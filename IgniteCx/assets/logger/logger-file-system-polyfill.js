// Keep this file in sync with the same file in the vue-logger project

// @ts-nocheck
/**
 * Copyright 2013 - Eric Bidelman.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at.
 *
 *      Http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.

 * @file
 * A polyfill implementation of the HTML5 Filesystem API which sits on top of
 * IndexedDB as storage layer. Files and folders are stored as FileEntry and
 * FolderEntry objects in a single object store. IDBKeyRanges are used to query
 * into a folder. A single object store is sufficient because we can utilize the
 * properties of ASCII. Namely, ASCII / is followed by ASCII 0. Thus,
 * "/one/two/" comes before "/one/two/ANYTHING" comes before "/one/two/0".
 *
 * @author Eric Bidelman (ebidel@gmail.com)
 * @version: 0.0.5 + custom modifications for Circuit
 */

/* global FileReaderSync */
/* eslint-disable dot-notation, no-console */

(function (worker) {
  'use strict';

  // Bomb out if the Filesystem API is available natively.
  if (worker.requestFileSystem || worker.webkitRequestFileSystem) {
    return;
  }

  // Bomb out if no indexedDB available
  const indexedDB = worker.indexedDB || worker.mozIndexedDB || worker.msIndexedDB;
  if (!indexedDB) {
    return;
  }

  // Added support for FileWriter's readyState property to allow proper throttling.
  const FileState = {
    INIT: 0,
    WRITING: 1,
    DONE: 2
  };

  // Check to see if IndexedDB support blobs
  const support = function () {
    const dbName = 'blob-support';
    indexedDB.deleteDatabase(dbName).onsuccess = function () {
      const request = indexedDB.open(dbName, 1.0);
      request.onerror = function () {
        support.blob = false;
      };
      request.onsuccess = function () {
        const db = request.result;
        try {
          const blob = new Blob(['test'], { type: 'text/plain' });
          const transaction = db.transaction('store', 'readwrite');
          transaction.objectStore('store').put(blob, 'key');
          support.blob = true;
        } catch {
          support.blob = false;
        } finally {
          db.close();
          indexedDB.deleteDatabase(dbName);
        }
      };
      request.onupgradeneeded = function () {
        request.result.createObjectStore('store');
      };
    };
  };

  const base64ToBlob = function (dataURL) {
    const BASE64_MARKER = ';base64,';
    let parts,
      contentType,
      raw;
    if (!dataURL.includes(BASE64_MARKER)) {
      parts = dataURL.split(',');
      contentType = parts[0].split(':')[1];
      raw = decodeURIComponent(parts[1]);

      return new Blob([raw], { type: contentType });
    }

    parts = dataURL.split(BASE64_MARKER);
    contentType = parts[0].split(':')[1];
    raw = worker.atob(parts[1]);
    const rawLength = raw.length;

    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  };

  const blobToBase64 = function (blob, onload) {
    let reader;
    if (typeof FileReader === 'function') {
      reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        onload(reader.result);
      };
    } else {
      reader = new FileReaderSync();
      onload(reader.readAsDataURL(blob));
    }
  };

  if (!worker.PERSISTENT) {
    worker.TEMPORARY = 0;
    worker.PERSISTENT = 1;
  }

  let fs_ = null; /* Browsers other than Chrome don't implement persistent vs. temporary storage.but default to temporary anyway. */
  let storageType_ = 'temporary';
  const idb_ = { db: null };

  const FILE_STORE_ = 'entries';
  const DIR_SEPARATOR = '/';
  const DIR_OPEN_BOUND = String.fromCharCode(DIR_SEPARATOR.charCodeAt(0) + 1);

  /* When saving an entry, the fullPath should always lead with a slash and never
    end with one (e.g. a directory). Also, resolve '.' and '..' to an absolute
    one. This method ensures path is legit! */
  /**
   * @param cwdFullPath
   * @param path
   */
  function resolveToFullPath_(cwdFullPath, path) {
    let fullPath = path;

    const relativePath = path[0] !== DIR_SEPARATOR;
    if (relativePath) {
      fullPath = cwdFullPath + DIR_SEPARATOR + path;
    }

    /* Normalize '.'s,  '..'s and '//'s. */
    const parts = fullPath.split(DIR_SEPARATOR);
    const finalParts = [];
    for (const part of parts) {
      if (part === '..') {
        /* Go up one level. */
        if (!finalParts.length) {
          throw new Error('Invalid path');
        }
        finalParts.pop();
      } else if (part !== '') {
        /* Eliminate sequences of '/'s as well as possible leading/trailing '/'s. */
        finalParts.push(part);
      }
    }

    fullPath = DIR_SEPARATOR + finalParts.join(DIR_SEPARATOR);

    /* fullPath is guaranteed to be normalized by construction at this point:
        '.'s, '..'s, '//'s will never appear in it. */

    return fullPath;
  }

  /* Path can be relative or absolute. If relative, it's taken from the cwd_.
     If a filesystem URL is passed it, it is simple returned
     function pathToFsURL_(path) {
       path = resolveToFullPath_(cwdFullPath, path);
       path = fs_.root.toURL() + path.substring(1);
       return path;
     };*/

  /**
   * Interface to wrap the native File interface.
   *
   * This interface is necessary for creating zero-length (empty) files,
   * something the Filesystem API allows you to do. Unfortunately, File's
   * constructor cannot be called directly, making it impossible to instantiate
   * an empty File in JS.
   *
   * @param {object} opts - Initial values.
   * @class
   */
  function MyFile(opts) {
    let blob_ = null;

    opts ||= {};
    this.size = opts.size || 0;
    this.name = opts.name || '';
    this.type = opts.type || '';
    this.lastModifiedDate = opts.lastModifiedDate || null;
    /* this.slice = Blob.prototype.slice; Doesn't work with structured clones. */

    /* Need some black magic to correct the object's size/name/type based on the
        blob that is saved. */
    Object.defineProperty(this, 'blob_', {
      enumerable: true,
      get() {
        return blob_;
      },
      set: function (val) {
        blob_ = val;
        opts = blob_ || {};
        this.size = opts.size || 0;
        this.name = opts.name || '';
        this.type = opts.type || '';
        this.lastModifiedDate = opts.lastModifiedDate || null;
      }.bind(this)
    });
  }
  MyFile.prototype.constructor = MyFile;

  /**
   * Interface to writing a Blob/File.
   *
   * Modeled from:
   * dev.w3.org/2009/dap/file-system/file-writer.html#the-filewriter-interface.
   *
   * @param {FileEntry} fileEntry - The FileEntry associated with this writer.
   * @class
   */
  function FileWriter(fileEntry) {
    if (!fileEntry) {
      throw new Error('Expected fileEntry argument to write.');
    }

    let position_ = 0;
    let blob_ = fileEntry.file_ ? fileEntry.file_.blob_ : null;
    let readyState_ = FileState.INIT;

    Object.defineProperty(this, 'position', {
      get() {
        return position_;
      }
    });

    Object.defineProperty(this, 'length', {
      get() {
        return blob_ ? blob_.size : 0;
      }
    });

    Object.defineProperty(this, 'readyState', {
      get() {
        return readyState_;
      }
    });

    this.seek = function (offset) {
      if (readyState_ === FileState.WRITING) {
        throw new Error('Cannot invoke seek while FileWriter is in WRITING state');
      }

      position_ = offset;

      if (position_ > this.length) {
        position_ = this.length;
      }
      if (position_ < 0) {
        position_ += this.length;
      }
      if (position_ < 0) {
        position_ = 0;
      }
    };

    this.truncate = function (size) {
      if (readyState_ === FileState.WRITING) {
        throw new Error('Cannot invoke truncate while FileWriter is in WRITING state');
      }

      if (blob_) {
        if (size < this.length) {
          blob_ = blob_.slice(0, size);
        } else {
          blob_ = new Blob([blob_, new Uint8Array(size - this.length)],
            { type: blob_.type });
        }
      } else {
        blob_ = new Blob([]);
      }

      position_ = 0; /* truncate from beginning of file.*/

      this.write(blob_); /* calls onwritestart and onwriteend.*/
    };

    this.write = function (data) {
      if (!data) {
        throw new Error('Expected blob argument to write.');
      }

      if (readyState_ === FileState.WRITING) {
        throw new Error('Cannot invoke write while FileWriter is in WRITING state');
      }

      /* Call onwritestart if it was defined.*/
      readyState_ = FileState.WRITING;
      if (this.onwritestart) {
        this.onwritestart();
      }

      if (blob_) {
        /* Calc the head and tail fragments*/
        const head = blob_.slice(0, position_);
        const tail = blob_.slice(position_ + data.size);

        /* Calc the padding*/
        let padding = position_ - head.size;
        if (padding < 0) {
          padding = 0;
        }

        // Do the "write". In fact, a full overwrite of the Blob.
        blob_ = new Blob([head, new Uint8Array(padding), data, tail],
          { type: blob_.type });
      } else {
        blob_ = new Blob([data], { type: data.type });
      }

      const writeFile = function (blob) {
        /* Blob might be a DataURI depending on browser support.*/
        fileEntry.file_.blob_ = blob;
        fileEntry.file_.lastModifiedDate = data.lastModifiedDate || new Date();

        /**
         * @param entry - The fileEntry.
         * @param err
         */
        idb_.put(fileEntry, () => {
          if (!support.blob) {
            /* Set the blob we're writing on this file entry so we can recall it later.*/
            fileEntry.file_.blob_ = blob_;
            fileEntry.file_.lastModifiedDate = data.lastModifiedDate || null;
          }

          /* Add size of data written to writer.position.*/
          position_ += data.size;

          readyState_ = FileState.DONE;
          if (this.onwriteend) {
            this.onwriteend();
          }
        }, err => {
          readyState_ = FileState.DONE;
          if (this.onerror) {
            this.onerror(err);
          }
        });
      }.bind(this);

      if (support.blob) {
        writeFile(blob_);
      } else {
        blobToBase64(blob_, writeFile);
      }
    };
  }


  /**
   * Interface for listing a directory's contents (files and folders).
   *
   * Modeled from:
   * dev.w3.org/2009/dap/file-system/pub/FileSystem/#idl-def-DirectoryReader.
   *
   * @param dirEntry
   * @class
   */
  function DirectoryReader(dirEntry) {
    const dirEntry_ = dirEntry;
    let used_ = false;

    this.readEntries = function (successCallback, opt_errorCallback) {
      if (!successCallback) {
        throw new Error('Expected successCallback argument.');
      }

      /* This is necessary to mimic the way DirectoryReader.readEntries() should
             normally behavior.  According to spec, readEntries() needs to be called
             until the length of result array is 0. To handle someone implementing
             a recursive call to readEntries(), get everything from indexedDB on the
             first shot. Then (DirectoryReader has been used), return an empty
             result array.*/
      if (!used_) {
        idb_.getAllEntries(dirEntry_.fullPath, entries => {
          used_ = true;
          successCallback(entries);
        }, opt_errorCallback);
      } else {
        successCallback([]);
      }
    };
  }

  /**
   * Interface supplies information about the state of a file or directory.
   *
   * Modeled from:
   * dev.w3.org/2009/dap/file-system/file-dir-sys.html#idl-def-Metadata.
   *
   * @param modificationTime
   * @param size
   * @class
   */
  function Metadata(modificationTime, size) {
    this.modificationTime_ = modificationTime || null;
    this.size_ = size || 0;
  }

  Metadata.prototype = {
    get modificationTime() {
      return this.modificationTime_;
    },
    get size() {
      return this.size_;
    }
  };

  /**
   * Interface representing entries in a filesystem, each of which may be a File
   * or DirectoryEntry.
   *
   * Modeled from:
   * dev.w3.org/2009/dap/file-system/pub/FileSystem/#idl-def-Entry.
   *
   * @class
   */
  function Entry() {}

  Entry.prototype = {
    name: null,
    fullPath: null,
    filesystem: null,
    copyTo() {},
    getMetadata(successCallback, opt_errorCallback) {
      if (!successCallback) {
        throw new Error('Expected successCallback argument.');
      }

      try {
        if (this.isFile) {
          const blob = this.file_.blob_;
          if (blob) {
            successCallback(new Metadata(this.file_.lastModifiedDate, blob.size));
          } else {
            opt_errorCallback('No data');
          }
        } else {
          opt_errorCallback('Not a file');
        }
      } catch (e) {
        opt_errorCallback && opt_errorCallback(e);
      }
    },
    getParent() {},
    moveTo() {},
    remove(successCallback, opt_errorCallback) {
      if (!successCallback) {
        throw new Error('Expected successCallback argument.');
      }
      /* This doesn't protect against directories that have content in it.
             Should throw an error instead if the dirEntry is not empty.*/
      idb_['delete'](this.fullPath, () => {
        successCallback();
      }, opt_errorCallback);
    },
    toURL() {
      const blob = this.file_.blob_;
      if (!blob) {
        return '';
      }
      blob.objectURL ||= URL.createObjectURL(blob);
      return blob.objectURL;
    }
  };

  /**
   * Interface representing a file in the filesystem.
   *
   * Modeled from:
   * dev.w3.org/2009/dap/file-system/pub/FileSystem/#the-fileentry-interface.
   *
   * @param {FileEntry} [opt_fileEntry] - Optional FileEntry to initialize this
   *     object from.
   * @class
   * @augments {Entry}
   */
  function FileEntry(opt_fileEntry) {
    this.file_ = null;

    Object.defineProperty(this, 'isFile', {
      enumerable: true,
      get() {
        return true;
      }
    });
    Object.defineProperty(this, 'isDirectory', {
      enumerable: true,
      get() {
        return false;
      }
    });

    /* Create this entry from properties from an existing FileEntry.*/
    if (opt_fileEntry) {
      this.file_ = opt_fileEntry.file_;
      this.name = opt_fileEntry.name;
      this.fullPath = opt_fileEntry.fullPath;
      this.filesystem = opt_fileEntry.filesystem;
      if (typeof this.file_.blob_ === 'string') {
        this.file_.blob_ = base64ToBlob(this.file_.blob_);
      }
    }
  }
  FileEntry.prototype = new Entry();
  FileEntry.prototype.constructor = FileEntry;
  FileEntry.prototype.createWriter = function (callback) {
    /* Figure out if there's a way to dispatch onwrite event as we're writing
         data to IDB. Right now, we're only calling onwritend/onerror
         FileEntry.write().*/
    callback(new FileWriter(this));
  };
  FileEntry.prototype.file = function (successCallback, opt_errorCallback) {
    if (!successCallback) {
      throw new Error('Expected successCallback argument.');
    }

    if (this.file_ === null) {
      if (opt_errorCallback) {
        opt_errorCallback();
      }
      return;
    }

    /*  If we're returning a zero-length (empty) file, return the fake file obj.
         Otherwise, return the native File object that we've stashed.*/
    const file = this.file_.blob_ === null ? this.file_ : this.file_.blob_;
    file.lastModifiedDate = this.file_.lastModifiedDate;

    /* Add Blob.slice() to this wrapped object. Currently won't work :(
        if (!val.slice) {
            val.slice = Blob.prototype.slice; // Hack to add back in .slice().
        }*/
    successCallback(file);
  };

  /**
   * Interface representing a directory in the filesystem.
   *
   * Modeled from:
   * dev.w3.org/2009/dap/file-system/pub/FileSystem/#the-directoryentry-interface.
   *
   * @param {DirectoryEntry} [opt_folderEntry] - Optional DirectoryEntry to
   *     initialize this object from.
   * @class
   * @augments {Entry}
   */
  function DirectoryEntry(opt_folderEntry) {
    Object.defineProperty(this, 'isFile', {
      enumerable: true,
      get() {
        return false;
      }
    });
    Object.defineProperty(this, 'isDirectory', {
      enumerable: true,
      get() {
        return true;
      }
    });

    /* Create this entry from properties from an existing DirectoryEntry.*/
    if (opt_folderEntry) {
      this.name = opt_folderEntry.name;
      this.fullPath = opt_folderEntry.fullPath;
      this.filesystem = opt_folderEntry.filesystem;
    }
  }
  DirectoryEntry.prototype = new Entry();
  DirectoryEntry.prototype.constructor = DirectoryEntry;
  DirectoryEntry.prototype.createReader = function () {
    return new DirectoryReader(this);
  };
  DirectoryEntry.prototype.getDirectory = function (path, options, successCallback, opt_errorCallback) {
    /* Create an absolute path if we were handed a relative one.*/
    path = resolveToFullPath_(this.fullPath, path);

    idb_.get(path, folderEntry => {
      if (!options) {
        options = {};
      }

      if ((options.create === true && options.exclusive === true && folderEntry) ||
                (!options.create && folderEntry && folderEntry.isFile)) {
        // If create and exclusive are both true, and the path already exists, getDirectory must fail; OR
        // If create is not true and the path exists, but is a file, getDirectory must fail.
        if (opt_errorCallback) {
          opt_errorCallback();
        }
      } else if (options.create === true && !folderEntry) {
        // If create is true, the path doesn't exist, and no other error occurs,
        // getDirectory must create it as a zero-length file and return a corresponding DirectoryEntry.
        const dirEntry = new DirectoryEntry();
        dirEntry.name = path.split(DIR_SEPARATOR).pop(); // Just need filename
        dirEntry.fullPath = path;
        dirEntry.filesystem = fs_;

        idb_.put(dirEntry, successCallback, opt_errorCallback);
      } else if (options.create === true && folderEntry) {
        if (folderEntry.isDirectory) {
          // IDB won't save methods, so we need re-create the DirectoryEntry.
          successCallback(new DirectoryEntry(folderEntry));
        } else if (opt_errorCallback) {
          opt_errorCallback();
        }
      } else if (!options.create && !folderEntry) {
        // Handle root special. It should always exist.
        if (path === DIR_SEPARATOR) {
          folderEntry = new DirectoryEntry();
          folderEntry.name = '';
          folderEntry.fullPath = DIR_SEPARATOR;
          folderEntry.filesystem = fs_;
          successCallback(folderEntry);
          return;
        }

        // If create is not true and the path doesn't exist, getDirectory must fail.
        if (opt_errorCallback) {
          opt_errorCallback();
        }
      } else {
        // Otherwise, if no other error occurs, getDirectory must return a DirectoryEntry corresponding to path.
        // IDB won't' save methods, so we need re-create DirectoryEntry.
        successCallback(new DirectoryEntry(folderEntry));
      }
    }, opt_errorCallback);
  };

  DirectoryEntry.prototype.getFile = function (path, options, successCallback, opt_errorCallback) {
    /*
        Create an absolute path if we were handed a relative one.
        */
    path = resolveToFullPath_(this.fullPath, path);

    idb_.get(path, fileEntry => {
      if (!options) {
        options = {};
      }

      if ((options.create === true && options.exclusive === true && fileEntry) ||
                (!options.create && (!fileEntry || fileEntry.isDirectory))) {
        // If create and exclusive are both true, and the path already exists, getFile must fail.
        // If create is not true and the path doesn't exist OR is a directory, getFile must fail.
        if (opt_errorCallback) {
          opt_errorCallback();
        }
      } else if (options.create === true && !fileEntry) {
        /* If create is true, the path doesn't exist, and no other error occurs,
                 getFile must create it as a zero-length file and return a corresponding
                 FileEntry.*/
        fileEntry = new FileEntry();
        fileEntry.name = path.split(DIR_SEPARATOR).pop(); /* Just need filename.*/
        fileEntry.fullPath = path;
        fileEntry.filesystem = fs_;
        fileEntry.file_ = new MyFile({
          size: 0,
          name: fileEntry.name,
          lastModifiedDate: new Date()
        });

        idb_.put(fileEntry, successCallback, opt_errorCallback);
      } else if (options.create === true && fileEntry) {
        if (fileEntry.isFile) {
          /* IDB won't save methods, so we need re-create the FileEntry.*/
          successCallback(new FileEntry(fileEntry));
        } else if (opt_errorCallback) {
          opt_errorCallback();
        }
      } else {
        /* Otherwise, if no other error occurs, getFile must return a FileEntry
                 corresponding to path.

                 IDB won't' save methods, so we need re-create the FileEntry.*/
        successCallback(new FileEntry(fileEntry));
      }
    }, opt_errorCallback);
  };

  DirectoryEntry.prototype.removeRecursively = function (successCallback, opt_errorCallback) {
    if (!successCallback) {
      throw new Error('Expected successCallback argument.');
    }

    this.remove(successCallback, opt_errorCallback);
  };

  /**
   * Interface representing a filesystem.
   *
   * Modeled from:
   * dev.w3.org/2009/dap/file-system/pub/FileSystem/#idl-def-LocalFileSystem.
   *
   * @param {number} type - Kind of storage to use, either TEMPORARY or PERSISTENT.
   * @param {number} size - Storage space (bytes) the application expects to need.
   * @class
   */
  // eslint-disable-next-line no-unused-vars
  function DOMFileSystem(type, size) {
    storageType_ = type === worker.TEMPORARY ? 'Temporary' : 'Persistent';
    this.name = `${(location.protocol + location.host).replaceAll(':', '_')}:${storageType_}`;
    this.root = new DirectoryEntry();
    this.root.fullPath = DIR_SEPARATOR;
    this.root.filesystem = this;
    this.root.name = '';
  }

  /**
   * @param type
   * @param size
   * @param successCallback
   * @param opt_errorCallback
   */
  function requestFileSystem(type, size, successCallback, opt_errorCallback) {
    if (type !== worker.TEMPORARY && type !== worker.PERSISTENT) {
      if (opt_errorCallback) {
        opt_errorCallback();
        return;
      }
    }

    fs_ = new DOMFileSystem(type, size);
    idb_.open(fs_.name, () => {
      successCallback(fs_);
    }, opt_errorCallback);
  }

  /**
   * @param url
   * @param successCallback
   * @param opt_errorCallback
   */
  function resolveLocalFileSystemURL(url, successCallback, opt_errorCallback) {
    const origin = `${location.protocol}//${location.host}`;
    const base = `filesystem:${origin}${DIR_SEPARATOR}${storageType_.toLowerCase()}`;
    url = url.replace(base, '');
    if (url.substr(-1) === '/') {
      url = url.slice(0, -1);
    }
    if (url) {
      idb_.get(url, entry => {
        if (entry) {
          if (entry.isFile) {
            successCallback(new FileEntry(entry));
          } else if (entry.isDirectory) {
            successCallback(new DirectoryEntry(entry));
          }
        } else {
          opt_errorCallback && opt_errorCallback();
        }
      }, opt_errorCallback);
    } else {
      successCallback(fs_.root);
    }
  }

  /* Core logic to handle IDB operations =========================================*/

  idb_.open = function (dbName, successCallback, opt_errorCallback) {
    const self = this;

    const request = indexedDB.open(dbName.replace(':', '_'));

    request.onerror = opt_errorCallback || onError;

    request.onupgradeneeded = function (e) {
      self.db = e.target.result;
      self.db.onerror = onError;

      if (!self.db.objectStoreNames.contains(FILE_STORE_)) {
        self.db.createObjectStore(FILE_STORE_);
      }
    };

    request.onsuccess = function (e) {
      self.db = e.target.result;
      self.db.onerror = onError;
      successCallback(e);
    };

    request.onblocked = opt_errorCallback || onError;
  };

  idb_.close = function () {
    this.db.close();
    this.db = null;
  };

  /* Figure out if we should ever call this method. The filesystem API
     doesn't allow you to delete a filesystem once it is 'created'. Users should
     use the public remove/removeRecursively API instead.*/
  idb_.drop = function (successCallback, opt_errorCallback) {
    if (!this.db) {
      return;
    }

    const dbName = this.db.name;

    const request = indexedDB.deleteDatabase(dbName);
    request.onsuccess = function (e) {
      successCallback(e);
    };
    request.onerror = opt_errorCallback || onError;

    idb_.close();
  };

  idb_.get = function (fullPath, successCallback, opt_errorCallback) {
    if (!this.db) {
      return;
    }

    const tx = this.db.transaction([FILE_STORE_], 'readonly');

    const range = IDBKeyRange.bound(fullPath, fullPath + DIR_OPEN_BOUND, false, true);
    const request = tx.objectStore(FILE_STORE_).get(range);

    tx.onabort = opt_errorCallback || onError;
    tx.oncomplete = function () {
      successCallback(request.result);
    };
  };

  idb_.getAllEntries = function (fullPath, successCallback, opt_errorCallback) {
    if (!this.db) {
      return;
    }

    let results = [];

    // Treat the root entry special. Querying it returns all entries because they match '/'.
    let range = null;
    if (fullPath !== DIR_SEPARATOR) {
      range = IDBKeyRange.bound(
        fullPath + DIR_SEPARATOR, fullPath + DIR_OPEN_BOUND, false, true);
    }

    const tx = this.db.transaction([FILE_STORE_], 'readonly');
    tx.onabort = opt_errorCallback || onError;
    tx.oncomplete = function () {
      /* Figure out how to do be range queries instead of filtering result in memory :( */
      const fullPathPartsLen = fullPath.split(DIR_SEPARATOR).length;

      results = results.filter(entry => {
        if (!entry || !entry.fullPath || !entry.file_ || !entry.file_.blob_) {
          return false;
        }
        const entryPartsLen = entry.fullPath.split(DIR_SEPARATOR).length;

        if (fullPath === DIR_SEPARATOR) {
          // Hack to filter out entries in the root folder. This is inefficient
          // because reading the entires of fs.root (e.g. '/') returns ALL
          // results in the database, then filters out the entries not in '/'.
          return entryPartsLen < fullPathPartsLen + 1;
        }
        /* If this a subfolder and entry is a direct child, include it in
                 the results. Otherwise, it's not an entry of this folder.*/
        return entryPartsLen === fullPathPartsLen + 1;
      });

      successCallback(results);
    };

    const request = tx.objectStore(FILE_STORE_).openCursor(range);

    request.onsuccess = function (e) {
      const cursor = e.target.result;
      if (cursor) {
        const val = cursor.value;
        results.push(val.isFile ? new FileEntry(val) : new DirectoryEntry(val));
        cursor['continue']();
      }
    };
  };

  idb_['delete'] = function (fullPath, successCallback, opt_errorCallback) {
    if (!this.db) {
      return;
    }

    const tx = this.db.transaction([FILE_STORE_], 'readwrite');
    tx.oncomplete = successCallback;
    tx.onabort = opt_errorCallback || onError;

    const range = IDBKeyRange.bound(fullPath, fullPath + DIR_OPEN_BOUND, false, true);
    tx.objectStore(FILE_STORE_)['delete'](range);
  };

  idb_.put = function (entry, successCallback, opt_errorCallback) {
    if (!this.db) {
      return;
    }

    const tx = this.db.transaction([FILE_STORE_], 'readwrite');
    tx.onabort = opt_errorCallback || onError;
    tx.oncomplete = function () {
      successCallback(entry);
    };

    tx.objectStore(FILE_STORE_).put(entry, entry.fullPath);
  };

  /* Global error handler. Errors bubble from request, to transaction, to db.*/
  /**
   * @param e
   */
  function onError(e) {
    if (e.target.errorCode === 12) {
      console.log('Error - Attempt to open db with a lower version than the current one.');
    } else {
      console.log(`errorCode: ${e.target.errorCode}`);
    }
    console.log(e, e.code, e.message);
  }

  /* Clean up */
  worker.addEventListener('beforeunload', () => {
    idb_.db.close();
  }, false);

  worker.requestFileSystem = requestFileSystem;
  worker.resolveLocalFileSystemURL = resolveLocalFileSystemURL;
})(self); /* Don't use window because we want to run in workers.*/

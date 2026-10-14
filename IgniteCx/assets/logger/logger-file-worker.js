// Keep this file in sync with the same file in the vue-logger project

// @ts-nocheck
/* global TEMPORARY, importScripts */
/* eslint-disable no-console */

///////////////////////////////////////////////////////////////////////////
// This file is loaded as a worker thread in clientLogger.js
///////////////////////////////////////////////////////////////////////////
(function () {
  'use strict';

  ///////////////////////////////////////////////////////////////////////////
  // Constants
  ///////////////////////////////////////////////////////////////////////////
  const FILE_STATE_WRITING = 1;
  const FILE_SYSTEM_ERROR = 'REQUEST_FILE_SYSTEM_ERROR';

  const LogFileWorkerMsgType = { // This must be in synch with the definition in clientLogger.js
    START: 'start',
    LOG: 'log',
    GET_LOG_FILES: 'getLogFiles',
    REMOVE_LOG_FILES: 'removeLogFiles',
    LOG_FILES: 'logFiles',
    SET_HEADER_INFO: 'setHeaderInfo',
    LOG_ERROR: 'logError'
  };

  ///////////////////////////////////////////////////////////////////////////
  // Constants
  ///////////////////////////////////////////////////////////////////////////
  const DEFAULT_CONFIG = {
    LOG_PREFIX: '',
    LOG_MAX_FILE_SIZE: 1024 * 1024,  // 1MB
    LOG_MAX_NUM_OF_FILES: 4,
    LOG_MAX_NUM_OF_FILES_PER_PREFIX: 4,
    LOG_DIR: '/logs/',
    LOG_SUFFIX: '.log',
    LOG_MAX_BUFFER_ENTRIES: 2000
  };

  ///////////////////////////////////////////////////////////////////////////
  // Internal variables
  ///////////////////////////////////////////////////////////////////////////
  const _browserData = getBrowserInfo();
  let _config = { ...DEFAULT_CONFIG };

  let _fs;
  let _writeBuffer = [];
  let _writeBufferTotalSize = 0;

  let _headerInfo;
  let _clientVersion;
  let _gettingFileWritter = false;
  let _fileWriter = null;
  let _removingFileWritter = false;

  ///////////////////////////////////////////////////////////////////////////
  // Helper functions
  ///////////////////////////////////////////////////////////////////////////
  /**
   * Extend configuration data with given data.
   *
   * @param {object} [newConfig] - The overriding configuration data.
   */
  function extendConfig(newConfig) {
    _config = {
      ...DEFAULT_CONFIG,
      ...newConfig
    };

    if (_config.LOG_MAX_NUM_OF_FILES_PER_PREFIX > _config.LOG_MAX_NUM_OF_FILES) {
      _config.LOG_MAX_NUM_OF_FILES_PER_PREFIX = _config.LOG_MAX_NUM_OF_FILES;
    }
  }

  /**
   * Get the maximum size for all log files.
   *
   * @returns {number} The max size in bytes.
   */
  function getLogMaxSize() {
    // Set file system max size according to the max number of files and give it
    // some extra room (+ 512kb) just in case. So no exception is thrown
    // if we go a little over the max size
    return (_config.LOG_MAX_FILE_SIZE * _config.LOG_MAX_NUM_OF_FILES) + 1024 * 512;
  }

  /**
   * Write buffered data to file.
   */
  function writeData() {
    if (_writeBuffer.length && _fileWriter && _fileWriter.readyState !== FILE_STATE_WRITING) {
      try {
        // Dump the whole buffer
        const blob = new Blob(_writeBuffer, { type: 'text/plain' });
        _fileWriter.write(blob);
        _writeBuffer = [];
        _writeBufferTotalSize = 0;
      } catch (e) {
        logError('writeData exception:', e);
      }
    }
  }

  /**
   * Logs an error to the console
   *
   * @param  {...any} args - Input to be logged.
   */
  function logError(...args) {
    console.error('[logFileWorker]:', ...args);
  }

  /**
   * Raise error message to main window.
   *
   * @param {*} error - The error data.
   */
  function postError(error) {
    postMessage({
      type: LogFileWorkerMsgType.LOG_ERROR,
      error
    });
  }

  /**
   * Event handler for onwriteend event.
   */
  function onWriteEnd() {
    if (_writeBuffer.length) {
      getFileWriterAndWrite();
    }
  }

  /**
   * Event handler for onerror event.
   *
   * @param {object} e - The error data.
   */
  function onWriteError(e) {
    logError('onWriteError:', e);
    // Try creating a new file
    createNewFile();
  }

  /**
   * Initialize the worker.
   *
   * @param {object} fs - The FileSystem object.
   */
  function init(fs) {
    console.log('[logFileWorker]: Initialize worker -', fs);
    _fs = fs;

    // Create log directory if it is not created yet
    _fs.root.getDirectory(_config.LOG_DIR, { create: true }, () => {
      getFileWriterAndWrite();
    }, e => {
      logError('getDirectory errorCb:', e);
    });
  }

  /**
   * Get the filename for the log file.
   *
   * @returns {string} The new filename.
   */
  function getFileName() {
    // ISO format: yyyy-MM-ddTHH:mm:ss.sssZ
    let date = new Date().toISOString();
    // Convert into yyyyMMddHHmmss
    date = date.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/, '$1$2$3$4$5$6');
    // /<dir>/<prefix><yyyyMMddHHmmss>.log
    return _config.LOG_DIR + _config.LOG_PREFIX + date + _config.LOG_SUFFIX;
  }

  /**
   * Get the browser information.
   *
   * @returns {object} The browser information.
   */
  function getBrowserInfo() {
    const ua = navigator.userAgent.toLowerCase();
    const match = /(msie|trident)(?: |.*rv:)([\d.]+)/.exec(ua) ||
            /(opera|opr)\/(?:.*version\/|)([\d.]+)/.exec(ua) ||
            /(firefox)\/([\d.]+)/.exec(ua) ||
            /(edge)\/([\d.]+)/.exec(ua) || // Legacy Edge
            /(edg)\/([\d.]+)/.exec(ua) || // New Edge based off Chrome
            /(chrome)\/([\d.]+)/.exec(ua) ||
            /version\/([\d.]+).*(safari)/.exec(ua) ||
            /(phantomjs)\/([\d.]+)/.exec(ua) || // Used for unit test (shouldn't impact performance here)
            [];

    let browser = match[1] || '';
    let version = match[2] || 0;

    // Swap matches for Safari because of inverted user agent
    if (version === 'safari') {
      browser = match[2];
      version = match[1];
    } else {
      switch (browser) {
        case 'trident':
          // IE no longer reported as MSIE starting from 11 version
          browser = 'msie';
          break;
        case 'opr':
          // Correctly define Opera
          browser = 'opera';
          break;
        case 'edge':
          // Legacy Edge browser
          browser = 'edge (old)';
          break;
        case 'edg':
          // New Edge (based on Chrome)
          browser = 'edge';
          break;
      }
    }

    return {
      [browser]: true,
      type: browser,
      version
    };
  }

  /**
   * Get the client timezone.
   *
   * @returns {string} The client timezone.
   */
  function getUtcOffset() {
    try {
      const offset = new Date().getTimezoneOffset();
      const absOffset = Math.abs(offset);
      const hours = `0${absOffset / 60}`.slice(-2);
      const min = `0${absOffset % 60}`.slice(-2);
      return `UTC${offset > 0 ? '-' : '+'}${hours}:${min}`;
    } catch {
      return '';
    }
  }

  /**
   * Remove older log files when exceeding
   */
  async function removeOldFiles() {
    const entries = await getLogEntriesList(false, false);
    if (_config.LOG_PREFIX) {
      // Check if max number of files with current prefix is reached
      const prefixed = entries.filter(file => file.entry.name.indexOf(_config.LOG_PREFIX) === 0);
      while (prefixed.length > _config.LOG_MAX_NUM_OF_FILES_PER_PREFIX) {
        const file = prefixed.shift();
        file.entry.remove(() => {});
        // Remove from entries
        const idx = entries.indexOf(file);
        entries.splice(idx, 1);
      }
    }

    // Remove oldest files if max number of files reached
    while (entries.length > _config.LOG_MAX_NUM_OF_FILES) {
      const file = entries.shift();
      file.entry.remove(() => {});
    }
  }

  /**
   * Create a new log file.
   */
  function createNewFile() {
    return new Promise(resolve => {
      const fileName = getFileName();
      _fs.root.getFile(fileName, { create: true }, f => {
        f.createWriter(fw => {
          if (_fileWriter) {
            _fileWriter.onwriteend = null;
            _fileWriter.onerror = null;
          }
          _fileWriter = fw;
          _fileWriter.onwriteend = onWriteEnd;
          _fileWriter.onerror = onWriteError;

          // add header
          let customHeader = '';
          if (_headerInfo) {
            for (const [key, value] of Object.entries(_headerInfo)) {
              customHeader += `${key}: ${value}\n`;
            }
          }

          const header = `Browser Type: ${_browserData.type}
Browser Version: ${_browserData.version}
Web Client Version: ${_clientVersion}
Server Address: ${location.host}
Client Timezone: ${getUtcOffset()}
${customHeader || '\n'}
`;

          // Add header to front of buffer and write log
          _writeBuffer.unshift(header);
          _writeBufferTotalSize += header.length;
          writeData();
          removeOldFiles().then(resolve);
        }, e => {
          resolve();
          logError('createWriter errorCb:', e);
        });
      }, e => {
        resolve();
        logError('Could not get file to store log files.', e);
        postError(FILE_SYSTEM_ERROR);
      });
    });
  }

  /**
   * Check if log file reached size limit and create a new file if needed.
   */
  async function checkFileSize() {
    if (_fileWriter.length + _writeBufferTotalSize > _config.LOG_MAX_FILE_SIZE) {
      // File reached max size, create a new one
      await createNewFile();
    }
  }

  /**
   * Create a new writer for an existing entry (file).
   *
   * @param {object} entry - The existing entry object.
   */
  function reopenFile(entry) {
    return new Promise(resolve => {
      entry.createWriter(fw => {
        _fileWriter = fw;
        _fileWriter.onwriteend = onWriteEnd;
        _fileWriter.onerror = onWriteError;
        _fileWriter.seek(_fileWriter.length);
        resolve();
      });
    });
  }

  /**
   * Create the file writer object.
   */
  async function getFileWriterAndWrite() {
    if (_gettingFileWritter || _removingFileWritter) {
      return;
    }

    try {
      _gettingFileWritter = true;

      if (!_fileWriter) {
        const entries = await getLogEntriesList(false, true);
        if (entries.length > 0) {
          // Directory is not empty, reopen the most recent file
          await reopenFile(entries.at(-1).entry);
          await checkFileSize();
        } else {
          // Directory is empty, create a new file
          await createNewFile();
        }
      } else {
        await checkFileSize();
      }
    } catch (e) {
      logError('getFileWriterAndWrite:', e);
    } finally {
      // eslint-disable-next-line require-atomic-updates
      _gettingFileWritter = false;
      writeData();
    }
  }

  /**
   * Create an error message with current timestamp.
   *
   * @param {string} message - The error message.
   * @returns {string} The formatted error message.
   */
  function createErrorMessage(message) {
    let date = new Date().toISOString();
    date = date.replace(/(\d{2})(\d{2})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/, '$2-$3-$4 $5:$6:$7.$8');
    // Format: yy-MM-dd HH:mm:ss.SSS ERROR message\n
    return `${date} ERROR ${message}`;
  }

  /**
   * Add the given log message to the buffer.
   *
   * @param {object} message - The log message.
   */
  function addMsgToBuffer(message) {
    if (_writeBuffer.length > _config.LOG_MAX_BUFFER_ENTRIES) {
      // Limit the buffer size. Discard newest half of the buffer to keep memory from growing indefinitely
      const discarded = Math.floor(_writeBuffer.length / 2);
      _writeBuffer = _writeBuffer.slice(0, discarded);
      logError('Buffer limit exceeded. Discarded some log messages.');
      const errorMsg = createErrorMessage(`***** Discarded ${discarded} log messages!!!*****\n`);
      _writeBuffer.push(errorMsg);

      // Now we need to recalculate the total buffer size
      _writeBufferTotalSize = 0;
      _writeBuffer.forEach(msg => {
        _writeBufferTotalSize += msg.length;
      });
    }
    _writeBuffer.push(message);
    _writeBufferTotalSize += message.length;
  }

  /**
   * Log the given message.
   *
   * @param {string} message - The log message.
   */
  function log(message) {
    try {
      addMsgToBuffer(`${message}\n`);
      // We may receive logs before the file system is initialized
      if (_fs) {
        getFileWriterAndWrite();
      }
    } catch (e) {
      logError('log exception:', e);
    }
  }

  /**
   * Compare function to sort entries array.
   *
   * @param {object} entryA - The first element for comparison.
   * @param {object} entryB - The second element for comparison.
   * @returns {number} - The comparison result.
   */
  function compareByDate(entryA, entryB) {
    return entryA.modifiedTimeObj - entryB.modifiedTimeObj;
  }

  /**
   * Gets the log files with the given criteria.
   *
   * @param {boolean} metadataOnly - If true, returns only the file metadata.
   * @param {boolean} filterByPrefix - Filter log files by prefix.
   */
  function getLogEntriesList(metadataOnly, filterByPrefix) {
    return new Promise(resolve => {
      let entries = [];
      try {
        _fs.root.getDirectory(_config.LOG_DIR, { create: false }, rd => {
          const r = rd.createReader();
          r.readEntries(e => {
            entries.push(...e);
            if (filterByPrefix && _config.LOG_PREFIX) {
              entries = entries.filter(entry => entry.name.indexOf(_config.LOG_PREFIX) === 0);
            }

            const logFiles = [];
            if (entries.length) {
              // Get metadata for each entry
              entries.forEach((entry, index) => {
                entry.getMetadata(metaData => {
                  const data = {
                    uri: entry.toURL(),
                    fileName: entry.name,
                    modifiedTime: metaData.modificationTime.toLocaleString(),
                    modifiedTimeObj: metaData.modificationTime, // Needed for our sorting
                    size: metaData.size
                  };
                  if (!metadataOnly) {
                    // The entry obj can't serialized, so it might not be wanted
                    data.entry = entry;
                  }
                  logFiles.push(data);
                  if (index + 1 >= entries.length) {
                    // Return entries sorted by modification time
                    logFiles.sort(compareByDate);
                    resolve(logFiles);
                  }
                }, err => {
                  if (index + 1 >= entries.length) {
                    // Return entries sorted by modification time
                    logFiles.sort(compareByDate);
                    resolve(logFiles);
                  }
                  logError('getMetadata errorCb:', err);
                });
              });
            } else {
              // No entries found
              resolve([]);
            }
          }, e => {
            resolve([]);
            logError('readEntries errorCb:', e);
          });
        }, e => {
          resolve([]);
          logError('getDirectory errorCb:', e);
        });
      } catch (e) {
        resolve([]);
        logError('getLogEntriesList exception:', e);
      }
    });
  }

  /**
   * Retrieves the log files and sends them to the main window.
   */
  async function getLogFiles() {
    let entries = await getLogEntriesList(true, true);
    if (entries.length > _config.LOG_MAX_NUM_OF_FILES) {
      entries = entries.slice(entries.length - _config.LOG_MAX_NUM_OF_FILES);
    }
    postMessage({
      type: LogFileWorkerMsgType.LOG_FILES,
      logFiles: entries
    });
  }

  /**
   * Remove the given file entry.
   *
   * @param {object} entry - The entry object.
   */
  function removeEntry(entry) {
    return new Promise(resolve => {
      entry.remove(resolve, err => {
        logError(`Error removing ${entry.name}.`, err);
        resolve();
      });
    });
  }

  /**
   * Removes all log files.
   */
  async function removeLogFiles(onlyPrefixed) {
    _removingFileWritter = true;

    const entries = await getLogEntriesList(false, onlyPrefixed);
    if (entries.length) {
      const promises = entries.map(file => removeEntry(file.entry));
      await Promise.all(promises);
    }

    _removingFileWritter = false;
    if (_fileWriter) {
      _fileWriter.onwriteend = null;
      _fileWriter.onerror = null;
    }
    _fileWriter = null;
  }

  ///////////////////////////////////////////////////////////////////////////
  // Event handler
  ///////////////////////////////////////////////////////////////////////////
  self.onmessage = async msg => {
    try {
      if (!self.requestFileSystem) {
        return;
      }

      const { data } = msg;

      switch (data.type) {
        case LogFileWorkerMsgType.START:
          _clientVersion = data.clientVersion;
          extendConfig(data.config);

          self.requestFileSystem(TEMPORARY, getLogMaxSize(), init, e => {
            _fs = null; // Set _fs to null to indicate that the request failed
            _writeBuffer = [];
            _writeBufferTotalSize = 0;
            console.warn('Could not access file system to store log files:', e);
            postError(FILE_SYSTEM_ERROR);
          });
          break;
        case LogFileWorkerMsgType.LOG:
          if (_fs !== null) {
            log(data.log);
          }
          break;
        case LogFileWorkerMsgType.GET_LOG_FILES:
          _fs && getLogFiles();
          break;
        case LogFileWorkerMsgType.REMOVE_LOG_FILES:
          if (_fs) {
            await removeLogFiles(!!data.onlyPrefixed);
            // Chain the new file creation and the list of files, otherwise the UI won't
            // know when they can get the new list of log files
            await createNewFile();
            getLogFiles();
          }
          break;
        case LogFileWorkerMsgType.SET_HEADER_INFO:
          _headerInfo = data.headerInfo;
          break;
        case LogFileWorkerMsgType.LOG_ERROR:
          break; // Handle in clientLogger
        default:
          logError(`Unknown request: ${data.type || '<empty>'}`);
          break;
      }
    } catch (error) {
      logError(error);
    }
  };

  ///////////////////////////////////////////////////////////////////////////
  // Initializations
  ///////////////////////////////////////////////////////////////////////////

  // Use async API, since the synchronous version has some performance issues
  self.requestFileSystem = self.webkitRequestFileSystem || self.requestFileSystem;

  if (!self.requestFileSystem) {
    // Load polyfill and try again
    console.info('[logFileWorker]: Browser does not support File System API. Create polyfill.');
    importScripts('logger-file-system-polyfill.js');

    self.requestFileSystem = self.webkitRequestFileSystem || self.requestFileSystem;
    if (!self.requestFileSystem) {
      logError('File System API is not available');
      postError(FILE_SYSTEM_ERROR);
    }
  }
}());

import { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const JsonEditor = ({ data, onChange }) => {
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState('');
  const [isFormatted, setIsFormatted] = useState(true);

  useEffect(() => {
    if (data) {
      try {
        setJsonString(JSON.stringify(data, null, 2));
        setError('');
      } catch (err) {
        setJsonString('');
      }
    } else {
      setJsonString('');
    }
  }, [data]);

  const handleChange = (value) => {
    setJsonString(value);
    
    if (!value.trim()) {
      setError('');
      onChange(null, '');
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setError('');
      onChange(parsed, '');
    } catch (err) {
      setError(err.message);
      onChange(null, err.message);
    }
  };

  const handleFormat = () => {
    if (error) return;
    
    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonString(formatted);
      setIsFormatted(true);
    } catch (err) {
      // Already has error displayed
    }
  };

  const handleMinify = () => {
    if (error) return;
    
    try {
      const parsed = JSON.parse(jsonString);
      const minified = JSON.stringify(parsed);
      setJsonString(minified);
      setIsFormatted(false);
    } catch (err) {
      // Already has error displayed
    }
  };

  const handleClear = () => {
    setJsonString('');
    setError('');
    onChange(null, '');
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="bg-muted px-3 py-2 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="braces" size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">JSON Editor</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleFormat}
            disabled={!!error || !jsonString.trim()}
            className="px-2 py-1 text-xs rounded hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
            title="Format JSON"
          >
            <Icon name="indent" size={14} />
          </button>
          <button
            type="button"
            onClick={handleMinify}
            disabled={!!error || !jsonString.trim()}
            className="px-2 py-1 text-xs rounded hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
            title="Minify JSON"
          >
            <Icon name="minimize-2" size={14} />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!jsonString.trim()}
            className="px-2 py-1 text-xs rounded hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      </div>
      <div className="relative">
        <textarea
          value={jsonString}
          onChange={(e) => handleChange(e.target.value)}
          className={`w-full px-3 py-2 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? 'bg-red-50 dark:bg-red-950/20' : 'bg-background'
          }`}
          rows="8"
          placeholder='{"key": "value"}'
          spellCheck="false"
        />
        {error && (
          <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
            <Icon name="alert-circle" size={12} />
            <span>Invalid JSON</span>
          </div>
        )}
        {!error && jsonString.trim() && (
          <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
            <Icon name="check-circle" size={12} />
            <span>Valid JSON</span>
          </div>
        )}
      </div>
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border-t border-red-200 dark:border-red-900 px-3 py-2">
          <p className="text-xs text-red-600 dark:text-red-400 font-mono">{error}</p>
        </div>
      )}
    </div>
  );
};

export default JsonEditor;

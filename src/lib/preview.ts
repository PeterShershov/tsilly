interface PreviewOptions {
  html: string;
  css: string;
  js: string;
}

const CONSOLE_CAPTURE_SCRIPT = `
<script>
(function() {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  };

  function serialize(arg) {
    if (arg === undefined) return 'undefined';
    if (arg === null) return 'null';
    if (typeof arg === 'function') return arg.toString();
    if (arg instanceof Error) return arg.stack || arg.message;
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }

  function sendToParent(type, args) {
    parent.postMessage({
      source: 'tsilly-preview',
      type: 'console',
      payload: {
        id: crypto.randomUUID(),
        type: type,
        args: Array.from(args).map(serialize),
        timestamp: Date.now(),
      }
    }, '*');
  }

  console.log = function(...args) {
    sendToParent('log', args);
    originalConsole.log.apply(console, args);
  };

  console.warn = function(...args) {
    sendToParent('warn', args);
    originalConsole.warn.apply(console, args);
  };

  console.error = function(...args) {
    sendToParent('error', args);
    originalConsole.error.apply(console, args);
  };

  console.info = function(...args) {
    sendToParent('info', args);
    originalConsole.info.apply(console, args);
  };

  window.onerror = function(message, source, lineno, colno, error) {
    sendToParent('error', [error ? error.stack : message]);
    return false;
  };

  window.onunhandledrejection = function(event) {
    sendToParent('error', ['Unhandled Promise Rejection: ' + event.reason]);
  };
})();
</script>
`;

export function generatePreviewDocument({ html, css, js }: PreviewOptions): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}</style>
  ${CONSOLE_CAPTURE_SCRIPT}
</head>
<body>
${html}
<script type="module">
${js}
</script>
</body>
</html>`;
}

import { useEditor } from "~/context/EditorContext";

export function ConsoleDrawer() {
  const { state, dispatch } = useEditor();

  if (!state.consoleOpen) {
    return null;
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-gray-300";
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "error":
        return "✕";
      case "warn":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "›";
    }
  };

  return (
    <div className="h-40 flex flex-col bg-[#1e1e1e] border-t border-[#3c3c3c]">
      <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#3c3c3c]">
        <span className="text-xs font-medium text-gray-400">Console</span>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: "CLEAR_CONSOLE" })}
            className="text-xs text-gray-400 hover:text-gray-200 px-2 py-0.5"
          >
            Clear
          </button>
          <button
            onClick={() => dispatch({ type: "TOGGLE_CONSOLE" })}
            className="text-xs text-gray-400 hover:text-gray-200 px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto font-mono text-sm p-2">
        {state.consoleLogs.length === 0 ? (
          <div className="text-gray-500 text-xs">
            Console output will appear here...
          </div>
        ) : (
          state.consoleLogs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-2 py-0.5 ${getLogColor(log.type)}`}
            >
              <span className="shrink-0 w-4">{getLogIcon(log.type)}</span>
              <span className="whitespace-pre-wrap break-all">
                {(log.args as string[]).join(" ")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

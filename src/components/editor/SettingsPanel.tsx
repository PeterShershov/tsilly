import { useState, useEffect } from "react";
import { useEditor } from "~/context/EditorContext";

export function SettingsPanel() {
  const { state, dispatch } = useEditor();
  const { tsConfig, settingsPanelOpen } = state;
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJsonText(JSON.stringify(tsConfig, null, 2));
    setError(null);
  }, [settingsPanelOpen]);

  if (!settingsPanelOpen) return null;

  const handleChange = (value: string) => {
    setJsonText(value);
    try {
      const parsed = JSON.parse(value);
      setError(null);
      dispatch({ type: "UPDATE_TS_CONFIG", payload: parsed });
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <div className="absolute top-12 right-4 z-50 w-80 bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl">
      <div className="px-4 py-3 border-b border-[#3c3c3c] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-200">TypeScript Config</h2>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
      <div className="p-2">
        <textarea
          value={jsonText}
          onChange={(e) => handleChange(e.target.value)}
          spellCheck={false}
          className="w-full h-48 p-2 text-xs font-mono bg-[#1e1e1e] border border-[#3c3c3c] rounded text-gray-200 resize-none focus:outline-none focus:border-[#0e639c]"
        />
      </div>
    </div>
  );
}

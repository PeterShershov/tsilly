import { useState } from "react";
import { FolderOpen, Share2, Check, Settings, RefreshCw } from "lucide-react";
import { useEditor } from "~/context/EditorContext";
import { copyShareUrl } from "~/lib/share";
import type { PanelVisibility } from "~/types/editor";
import { Logo } from "./Logo";
import { PlaygroundsPanel } from "./PlaygroundsPanel";

export function EditorHeader() {
  const { state, dispatch } = useEditor();
  const [copied, setCopied] = useState(false);
  const [playgroundsOpen, setPlaygroundsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch({ type: "RUN" });
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleShare = async () => {
    const success = await copyShareUrl({
      html: state.html,
      css: state.css,
      typescript: state.typescript,
    });
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const panels: { key: keyof PanelVisibility; label: string }[] = [
    { key: "html", label: "HTML" },
    { key: "css", label: "CSS" },
    { key: "typescript", label: "TypeScript" },
    { key: "preview", label: "Preview" },
  ];

  return (
    <header className="flex items-center px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
      <div className="flex items-center gap-3 w-32">
        <Logo size="sm" />
        <button
          onClick={() => setPlaygroundsOpen(!playgroundsOpen)}
          className={`p-1.5 rounded transition-colors ${
            playgroundsOpen
              ? "text-white bg-[#0e639c]"
              : "text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c]"
          }`}
          title="Playgrounds"
        >
          <FolderOpen size={16} />
        </button>
      </div>
      <PlaygroundsPanel
        open={playgroundsOpen}
        onClose={() => setPlaygroundsOpen(false)}
      />

      <div className="flex-1 flex justify-center">
        <div className="flex gap-1">
          {panels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => dispatch({ type: "TOGGLE_PANEL", payload: key })}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                state.panels[key]
                  ? "text-[#eeeeee]"
                  : "text-gray-400 hover:text-[#eeeeee]"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => dispatch({ type: "TOGGLE_CONSOLE" })}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              state.consoleOpen
                ? "text-[#eeeeee]"
                : "text-gray-400 hover:text-[#eeeeee]"
            }`}
          >
            Console
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 w-40 justify-end">
        <button
          onClick={handleShare}
          className={`p-1.5 rounded transition-colors ${
            copied
              ? "text-green-400 bg-[#3c3c3c]"
              : "text-gray-400 hover:text-blue-400 hover:bg-[#3c3c3c]"
          }`}
          title={copied ? "Copied!" : "Share"}
        >
          {copied ? <Check size={16} /> : <Share2 size={16} />}
        </button>
        <button
          onClick={handleRefresh}
          className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-[#3c3c3c] rounded transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
        <button
          onClick={() => dispatch({ type: "TOGGLE_SETTINGS_PANEL" })}
          className={`p-1.5 rounded transition-colors ${
            state.settingsPanelOpen
              ? "text-white bg-[#0e639c]"
              : "text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c]"
          }`}
          title="TypeScript Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}

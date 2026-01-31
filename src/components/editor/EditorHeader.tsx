import { useState } from "react";
import { Gamepad2, Share2, Check, RefreshCw, Save } from "lucide-react";
import { useEditor } from "~/context/EditorContext";
import { useSave } from "~/context/SaveContext";
import { useIsMobile } from "~/hooks/useIsMobile";
import { copyShareUrl } from "~/lib/share";
import type { PanelVisibility } from "~/types/editor";
import { Logo } from "./Logo";
import { PlaygroundsPanel } from "./PlaygroundsPanel";
import { LayoutDropdown } from "./LayoutDropdown";

export function EditorHeader() {
  const { state, dispatch } = useEditor();
  const { saveNow, isSaving, hasUnsavedChanges } = useSave();
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [playgroundsOpen, setPlaygroundsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch({ type: "RUN" });
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSave = async () => {
    await saveNow();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

  const panels: {
    key: keyof PanelVisibility;
    label: string;
    shortLabel: string;
  }[] = [
    { key: "html", label: "HTML", shortLabel: "HTML" },
    { key: "css", label: "CSS", shortLabel: "CSS" },
    { key: "typescript", label: "TypeScript", shortLabel: "TS" },
    { key: "preview", label: "Preview", shortLabel: "View" },
  ];

  return (
    <header className="flex items-center px-2 md:px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
      <div className="hidden md:flex items-center w-32">
        <Logo size="sm" />
      </div>
      <PlaygroundsPanel
        open={playgroundsOpen}
        onClose={() => setPlaygroundsOpen(false)}
      />

      <div className="flex-1 flex justify-start md:justify-center">
        <div className="flex gap-0.5 md:gap-1">
          {panels.map(({ key, label, shortLabel }) => (
            <button
              key={key}
              onClick={() => dispatch({ type: "TOGGLE_PANEL", payload: key })}
              className={`px-2 md:px-3 py-1 text-xs font-medium transition-colors ${
                state.panels[key]
                  ? "text-[#eeeeee]"
                  : "text-gray-400 hover:text-[#eeeeee]"
              }`}
            >
              {isMobile ? shortLabel : label}
            </button>
          ))}
          <button
            onClick={() => dispatch({ type: "TOGGLE_CONSOLE" })}
            className={`px-2 md:px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              state.consoleOpen
                ? "text-[#eeeeee]"
                : "text-gray-400 hover:text-[#eeeeee]"
            }`}
          >
            {isMobile ? "Log" : "Console"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2 justify-end">
        <button
          onClick={() => setPlaygroundsOpen(!playgroundsOpen)}
          className={`p-1.5 rounded transition-colors ${
            playgroundsOpen
              ? "text-white bg-[#0e639c]"
              : "text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c]"
          }`}
          title="Playgrounds"
        >
          <Gamepad2 size={16} />
        </button>
        <button
          data-testid="save-button"
          onClick={handleSave}
          disabled={isSaving}
          className={`p-1.5 rounded transition-colors ${
            saved
              ? "text-green-400 bg-[#3c3c3c]"
              : isSaving
                ? "text-blue-400 bg-[#3c3c3c]"
                : hasUnsavedChanges
                  ? "text-orange-400 hover:text-orange-300 hover:bg-[#3c3c3c]"
                  : "text-gray-400 hover:text-blue-400 hover:bg-[#3c3c3c]"
          }`}
          title={
            saved
              ? "Saved!"
              : isSaving
                ? "Saving..."
                : hasUnsavedChanges
                  ? "You have unsaved changes"
                  : "Save to URL"
          }
        >
          {saved ? (
            <Check size={16} />
          ) : (
            <Save size={16} className={isSaving ? "animate-pulse" : ""} />
          )}
        </button>
        <button
          onClick={handleShare}
          className={`p-1.5 rounded transition-colors ${
            copied
              ? "text-green-400 bg-[#3c3c3c]"
              : "text-gray-400 hover:text-blue-400 hover:bg-[#3c3c3c]"
          }`}
          title={copied ? "Copied!" : "Copy share link"}
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
        {!isMobile && <LayoutDropdown />}
      </div>
    </header>
  );
}

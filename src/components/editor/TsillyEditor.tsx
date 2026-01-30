import "allotment/dist/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  EditorProvider,
  useEditor,
  initialState,
} from "~/context/EditorContext";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { getWorkspaceFromUrl } from "~/lib/share";
import { ConsoleDrawer } from "./ConsoleDrawer";
import { EditorHeader } from "./EditorHeader";
import { EditorPanels } from "./EditorPanels";
import { LoadingOverlay } from "./LoadingOverlay";
import { SettingsPanel } from "./SettingsPanel";
import type { TypeScriptConfig } from "~/types/editor";

interface SavedState {
  html: string;
  css: string;
  typescript: string;
  tsConfig?: TypeScriptConfig;
}

const EXPECTED_EDITORS = 3; // HTML, CSS, TypeScript
const MIN_LOADING_TIME = 500;

function EditorWithPersistence() {
  const { state, dispatch } = useEditor();
  const loadedFromUrl = useRef(false);
  const [loading, setLoading] = useState(true);
  const editorsReadyCount = useRef(0);
  const editorsReady = useRef(false);
  const minTimeElapsed = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      minTimeElapsed.current = true;
      if (editorsReady.current) {
        setLoading(false);
      }
    }, MIN_LOADING_TIME);
    return () => clearTimeout(timer);
  }, []);

  const handleEditorReady = useCallback(() => {
    editorsReadyCount.current += 1;
    if (editorsReadyCount.current >= EXPECTED_EDITORS) {
      editorsReady.current = true;
      if (minTimeElapsed.current) {
        setLoading(false);
      }
    }
  }, []);

  const [savedState, setSavedState] = useLocalStorage<SavedState>(
    "tsilly-code",
    {
      html: initialState.html,
      css: initialState.css,
      typescript: initialState.typescript,
      tsConfig: initialState.tsConfig,
    },
  );

  useEffect(() => {
    // First, check if there's a shared workspace in the URL
    const sharedWorkspace = getWorkspaceFromUrl();
    if (sharedWorkspace) {
      loadedFromUrl.current = true;
      dispatch({ type: "LOAD_STATE", payload: sharedWorkspace });
      // Clear the URL params after loading
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.toString());
      return;
    }

    // Otherwise, load from localStorage
    const hasChanges =
      savedState.html !== initialState.html ||
      savedState.css !== initialState.css ||
      savedState.typescript !== initialState.typescript ||
      savedState.tsConfig;
    if (hasChanges) {
      dispatch({ type: "LOAD_STATE", payload: savedState });
    }
  }, []);

  useEffect(() => {
    const newState = {
      html: state.html,
      css: state.css,
      typescript: state.typescript,
      tsConfig: state.tsConfig,
    };
    const hasChanges =
      newState.html !== savedState.html ||
      newState.css !== savedState.css ||
      newState.typescript !== savedState.typescript ||
      JSON.stringify(newState.tsConfig) !== JSON.stringify(savedState.tsConfig);
    if (hasChanges) {
      setSavedState(newState);
    }
  }, [state.html, state.css, state.typescript, state.tsConfig]);

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] relative">
      <LoadingOverlay visible={loading} />
      <EditorHeader />
      <SettingsPanel />
      <div className="flex-1 min-h-0">
        <EditorPanels onEditorReady={handleEditorReady} />
      </div>
      <ConsoleDrawer />
    </div>
  );
}

export function TsillyEditor() {
  return (
    <EditorProvider>
      <EditorWithPersistence />
    </EditorProvider>
  );
}

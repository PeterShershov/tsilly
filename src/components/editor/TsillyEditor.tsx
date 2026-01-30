import "allotment/dist/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  EditorProvider,
  useEditor,
  initialState,
} from "~/context/EditorContext";
import { SaveContext, type SaveContextValue } from "~/context/SaveContext";
import { useDebouncedLocalStorage } from "~/hooks/useLocalStorage";
import { getWorkspaceFromUrl, getShareUrl } from "~/lib/share";
import { ConsoleDrawer } from "./ConsoleDrawer";
import { EditorHeader } from "./EditorHeader";
import { EditorPanels } from "./EditorPanels";
import { LoadingOverlay } from "./LoadingOverlay";
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
  const [isSaving, setIsSaving] = useState(false);
  const editorsReadyCount = useRef(0);
  const editorsReady = useRef(false);
  const minTimeElapsed = useRef(false);
  const initialLoadDone = useRef(false);

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

  const [savedState, setSavedState, flushStorage] =
    useDebouncedLocalStorage<SavedState>(
      "tsilly-code",
      {
        html: initialState.html,
        css: initialState.css,
        typescript: initialState.typescript,
        tsConfig: initialState.tsConfig,
      },
      200,
    );

  useEffect(() => {
    // First, check if there's a shared workspace in the URL
    const sharedWorkspace = getWorkspaceFromUrl();
    if (sharedWorkspace) {
      loadedFromUrl.current = true;
      dispatch({ type: "LOAD_STATE", payload: sharedWorkspace });
      // Don't clear URL - keep it for bookmarking/refreshing
      // Set initialLoadDone after a microtask to ensure state is applied
      queueMicrotask(() => {
        initialLoadDone.current = true;
      });
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
    // Delay to prevent saving initial state before loaded state is applied
    queueMicrotask(() => {
      initialLoadDone.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialLoadDone.current) return;

    const newState = {
      html: state.html,
      css: state.css,
      typescript: state.typescript,
      tsConfig: state.tsConfig,
    };
    setSavedState(newState);
  }, [state.html, state.css, state.typescript, state.tsConfig, setSavedState]);

  const saveNow = useCallback(async () => {
    setIsSaving(true);
    const workspace = {
      html: state.html,
      css: state.css,
      typescript: state.typescript,
    };

    flushStorage();

    const shareUrl = getShareUrl(workspace);
    window.history.replaceState({}, "", shareUrl);

    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsSaving(false);
  }, [state.html, state.css, state.typescript, flushStorage]);

  const saveContextValue: SaveContextValue = { saveNow, isSaving };

  return (
    <SaveContext.Provider value={saveContextValue}>
      <div className="flex flex-col h-screen bg-[#1e1e1e] relative">
        <LoadingOverlay visible={loading} />
        <EditorHeader />
        <div className="flex-1 min-h-0">
          <EditorPanels onEditorReady={handleEditorReady} />
        </div>
        <ConsoleDrawer />
      </div>
    </SaveContext.Provider>
  );
}

export function TsillyEditor() {
  return (
    <EditorProvider>
      <EditorWithPersistence />
    </EditorProvider>
  );
}

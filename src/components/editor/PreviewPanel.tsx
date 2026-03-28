import { useEffect, useMemo, useRef } from "react";
import { useEditor } from "~/context/EditorContext";
import { useDebounce } from "~/hooks/useDebounce";
import { compileTypeScript } from "~/lib/compiler";
import { generatePreviewDocument } from "~/lib/preview";
import type { ConsoleLogEntry } from "~/types/editor";

export function PreviewPanel() {
  const { state, dispatch } = useEditor();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const debouncedHtml = useDebounce(state.html, 300);
  const debouncedCss = useDebounce(state.css, 300);
  const debouncedTs = useDebounce(state.typescript, 300);

  useEffect(() => {
    const result = compileTypeScript(debouncedTs, state.tsConfig);
    dispatch({
      type: "SET_COMPILED_JS",
      payload: result.code,
      error: result.error,
    });
  }, [debouncedTs, state.tsConfig, dispatch]);

  const previewDoc = useMemo(() => {
    // runCounter dependency forces re-run when user clicks the run button
    void state.runCounter;
    if (state.compilationError) {
      return generatePreviewDocument({
        html: `<div style="color: #ff6b6b; font-family: monospace; padding: 20px;">
          <strong>Compilation Error:</strong>
          <pre>${state.compilationError}</pre>
        </div>`,
        css: "",
        js: "",
      });
    }
    return generatePreviewDocument({
      html: debouncedHtml,
      css: debouncedCss,
      js: state.compiledJs,
    });
  }, [
    debouncedHtml,
    debouncedCss,
    state.compiledJs,
    state.compilationError,
    state.runCounter,
  ]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        event.data?.source === "tsilly-preview" &&
        event.data.type === "console"
      ) {
        const entry = event.data.payload as ConsoleLogEntry;
        dispatch({ type: "ADD_CONSOLE_LOG", payload: entry });
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [dispatch]);

  useEffect(() => {
    dispatch({ type: "CLEAR_CONSOLE" });
  }, [previewDoc, dispatch]);

  return (
    <div className="h-full w-full bg-white">
      <iframe
        ref={iframeRef}
        srcDoc={previewDoc}
        sandbox="allow-scripts allow-modals allow-forms allow-popups"
        title="Preview"
        className="h-full w-full border-0"
      />
    </div>
  );
}

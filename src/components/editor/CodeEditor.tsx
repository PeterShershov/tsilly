import { useEffect, useRef, useState } from "react";

interface CodeEditorProps {
  language: "html" | "css" | "typescript";
  value: string;
  onChange: (value: string) => void;
  onReady?: () => void;
}

type Monaco = typeof import("monaco-editor");
type Editor = import("monaco-editor").editor.IStandaloneCodeEditor;

export function CodeEditor({ language, value, onChange, onReady }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const isUpdatingRef = useRef(false);
  const [monaco, setMonaco] = useState<Monaco | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMonaco() {
      const monacoModule = await import("monaco-editor");
      const editorWorker = await import(
        "monaco-editor/esm/vs/editor/editor.worker?worker"
      );
      const cssWorker = await import(
        "monaco-editor/esm/vs/language/css/css.worker?worker"
      );
      const htmlWorker = await import(
        "monaco-editor/esm/vs/language/html/html.worker?worker"
      );
      const tsWorker = await import(
        "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
      );

      if (cancelled) return;

      self.MonacoEnvironment = {
        getWorker(_workerId: string, label: string) {
          if (label === "css" || label === "scss" || label === "less") {
            return new cssWorker.default();
          }
          if (label === "html" || label === "handlebars" || label === "razor") {
            return new htmlWorker.default();
          }
          if (label === "typescript" || label === "javascript") {
            return new tsWorker.default();
          }
          return new editorWorker.default();
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ts = (monacoModule.languages as any).typescript;
      if (ts?.typescriptDefaults) {
        ts.typescriptDefaults.setCompilerOptions({
          target: ts.ScriptTarget?.ESNext ?? 99,
          module: ts.ModuleKind?.ESNext ?? 99,
          strict: true,
          noEmit: true,
          allowNonTsExtensions: true,
        });

        ts.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });
      }

      // Initialize Emmet for HTML and CSS
      const { emmetHTML, emmetCSS } = await import("emmet-monaco-es");
      emmetHTML(monacoModule);
      emmetCSS(monacoModule);

      // Expose Monaco globally for e2e testing
      (window as unknown as { monaco: Monaco }).monaco = monacoModule;
      setMonaco(monacoModule);
    }

    loadMonaco();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !monaco) return;

    const editor = monaco.editor.create(containerRef.current, {
      value,
      language,
      theme: "vs-dark",
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: "on",
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: "on",
      padding: { top: 8 },
    });

    editorRef.current = editor;

    const disposable = editor.onDidChangeModelContent(() => {
      if (!isUpdatingRef.current) {
        onChange(editor.getValue());
      }
    });

    // Signal that the editor is ready
    onReady?.();

    return () => {
      disposable.dispose();
      editor.dispose();
    };
  }, [monaco, language]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.getValue() !== value) {
      isUpdatingRef.current = true;
      editor.setValue(value);
      isUpdatingRef.current = false;
    }
  }, [value]);

  if (!monaco) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
        Loading editor...
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" data-testid={`editor-${language}`} />;
}

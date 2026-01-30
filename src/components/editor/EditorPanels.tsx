import { Allotment } from "allotment";
import { useEditor } from "~/context/EditorContext";
import { CodeEditor } from "./CodeEditor";
import { EditorPane } from "./EditorPane";
import { PreviewPanel } from "./PreviewPanel";

interface EditorPanelsProps {
  onEditorReady?: () => void;
}

export function EditorPanels({ onEditorReady }: EditorPanelsProps) {
  const { state, dispatch } = useEditor();

  const visiblePanels = Object.entries(state.panels).filter(([, visible]) => visible);

  if (visiblePanels.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-gray-500">
        No panels visible. Use the header buttons to show panels.
      </div>
    );
  }

  return (
    <Allotment>
      {state.panels.html && (
        <Allotment.Pane minSize={100}>
          <EditorPane title="HTML">
            <CodeEditor
              language="html"
              value={state.html}
              onChange={(value) => dispatch({ type: "SET_HTML", payload: value })}
              onReady={onEditorReady}
            />
          </EditorPane>
        </Allotment.Pane>
      )}
      {state.panels.css && (
        <Allotment.Pane minSize={100}>
          <EditorPane title="CSS">
            <CodeEditor
              language="css"
              value={state.css}
              onChange={(value) => dispatch({ type: "SET_CSS", payload: value })}
              onReady={onEditorReady}
            />
          </EditorPane>
        </Allotment.Pane>
      )}
      {state.panels.typescript && (
        <Allotment.Pane minSize={100}>
          <EditorPane title="TypeScript">
            <CodeEditor
              language="typescript"
              value={state.typescript}
              onChange={(value) => dispatch({ type: "SET_TYPESCRIPT", payload: value })}
              onReady={onEditorReady}
            />
          </EditorPane>
        </Allotment.Pane>
      )}
      {state.panels.preview && (
        <Allotment.Pane minSize={100}>
          <EditorPane title="Preview">
            <PreviewPanel />
          </EditorPane>
        </Allotment.Pane>
      )}
    </Allotment>
  );
}

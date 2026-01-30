import { Allotment } from "allotment";
import { useEditor } from "~/context/EditorContext";
import { useIsMobile } from "~/hooks/useIsMobile";
import { CodeEditor } from "./CodeEditor";
import { EditorPane } from "./EditorPane";
import { PreviewPanel } from "./PreviewPanel";

interface EditorPanelsProps {
  onEditorReady?: () => void;
}

export function EditorPanels({ onEditorReady }: EditorPanelsProps) {
  const { state, dispatch } = useEditor();
  const isMobile = useIsMobile();

  const visiblePanels = Object.entries(state.panels).filter(([, visible]) => visible);

  if (visiblePanels.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-gray-500">
        No panels visible. Use the header buttons to show panels.
      </div>
    );
  }

  const htmlContent = (
    <EditorPane title="HTML">
      <CodeEditor
        language="html"
        value={state.html}
        onChange={(value) => dispatch({ type: "SET_HTML", payload: value })}
        onReady={onEditorReady}
      />
    </EditorPane>
  );

  const cssContent = (
    <EditorPane title="CSS">
      <CodeEditor
        language="css"
        value={state.css}
        onChange={(value) => dispatch({ type: "SET_CSS", payload: value })}
        onReady={onEditorReady}
      />
    </EditorPane>
  );

  const tsContent = (
    <EditorPane title="TypeScript">
      <CodeEditor
        language="typescript"
        value={state.typescript}
        onChange={(value) => dispatch({ type: "SET_TYPESCRIPT", payload: value })}
        onReady={onEditorReady}
      />
    </EditorPane>
  );

  const previewContent = (
    <EditorPane title="Preview">
      <PreviewPanel />
    </EditorPane>
  );

  const hasVisibleEditors = state.panels.html || state.panels.css || state.panels.typescript;

  // Use layout as key to force clean remount when layout changes
  const layoutKey = isMobile ? "mobile" : state.layout;

  // Mobile always uses vertical stacked layout
  if (isMobile) {
    return (
      <div key={layoutKey} className="h-full w-full layout-container">
        <Allotment vertical>
          {state.panels.html && <Allotment.Pane minSize={100}>{htmlContent}</Allotment.Pane>}
          {state.panels.css && <Allotment.Pane minSize={100}>{cssContent}</Allotment.Pane>}
          {state.panels.typescript && <Allotment.Pane minSize={100}>{tsContent}</Allotment.Pane>}
          {state.panels.preview && <Allotment.Pane minSize={100}>{previewContent}</Allotment.Pane>}
        </Allotment>
      </div>
    );
  }

  // Vertical: All panels side by side horizontally
  if (state.layout === "vertical") {
    return (
      <div key={layoutKey} className="h-full w-full layout-container">
        <Allotment>
          {state.panels.html && <Allotment.Pane minSize={100}>{htmlContent}</Allotment.Pane>}
          {state.panels.css && <Allotment.Pane minSize={100}>{cssContent}</Allotment.Pane>}
          {state.panels.typescript && <Allotment.Pane minSize={100}>{tsContent}</Allotment.Pane>}
          {state.panels.preview && <Allotment.Pane minSize={100}>{previewContent}</Allotment.Pane>}
        </Allotment>
      </div>
    );
  }

  // Stacked: Editors horizontal on top, preview on bottom
  if (state.layout === "stacked") {
    return (
      <div key={layoutKey} className="h-full w-full layout-container">
        <Allotment vertical>
          {hasVisibleEditors && (
            <Allotment.Pane minSize={100}>
              <Allotment>
                {state.panels.html && <Allotment.Pane minSize={100}>{htmlContent}</Allotment.Pane>}
                {state.panels.css && <Allotment.Pane minSize={100}>{cssContent}</Allotment.Pane>}
                {state.panels.typescript && <Allotment.Pane minSize={100}>{tsContent}</Allotment.Pane>}
              </Allotment>
            </Allotment.Pane>
          )}
          {state.panels.preview && <Allotment.Pane minSize={100}>{previewContent}</Allotment.Pane>}
        </Allotment>
      </div>
    );
  }

  // Sidebar: Editors stacked vertically on left, preview on right
  if (state.layout === "sidebar") {
    return (
      <div key={layoutKey} className="h-full w-full layout-container">
        <Allotment>
          {hasVisibleEditors && (
            <Allotment.Pane minSize={100}>
              <Allotment vertical>
                {state.panels.html && <Allotment.Pane minSize={100}>{htmlContent}</Allotment.Pane>}
                {state.panels.css && <Allotment.Pane minSize={100}>{cssContent}</Allotment.Pane>}
                {state.panels.typescript && <Allotment.Pane minSize={100}>{tsContent}</Allotment.Pane>}
              </Allotment>
            </Allotment.Pane>
          )}
          {state.panels.preview && <Allotment.Pane minSize={100}>{previewContent}</Allotment.Pane>}
        </Allotment>
      </div>
    );
  }

  return null;
}

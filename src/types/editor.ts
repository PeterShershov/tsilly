export interface ConsoleLogEntry {
  id: string;
  type: "log" | "warn" | "error" | "info";
  args: unknown[];
  timestamp: number;
}

export interface PanelVisibility {
  html: boolean;
  css: boolean;
  typescript: boolean;
  preview: boolean;
}

export interface TypeScriptConfig {
  enableJsx: boolean;
  jsxRuntime: "classic" | "automatic";
  jsxImportSource: string;
  disableESTransforms: boolean;
  production: boolean;
}

export interface EditorState {
  html: string;
  css: string;
  typescript: string;
  compiledJs: string;
  compilationError: string | null;
  panels: PanelVisibility;
  consoleOpen: boolean;
  consoleLogs: ConsoleLogEntry[];
  tsConfig: TypeScriptConfig;
  settingsPanelOpen: boolean;
  runCounter: number;
}

export type EditorAction =
  | { type: "SET_HTML"; payload: string }
  | { type: "SET_CSS"; payload: string }
  | { type: "SET_TYPESCRIPT"; payload: string }
  | { type: "SET_COMPILED_JS"; payload: string; error?: string | null }
  | { type: "TOGGLE_PANEL"; payload: keyof PanelVisibility }
  | { type: "TOGGLE_CONSOLE" }
  | { type: "ADD_CONSOLE_LOG"; payload: ConsoleLogEntry }
  | { type: "CLEAR_CONSOLE" }
  | { type: "LOAD_STATE"; payload: Partial<EditorState> }
  | { type: "TOGGLE_SETTINGS_PANEL" }
  | { type: "UPDATE_TS_CONFIG"; payload: Partial<TypeScriptConfig> }
  | { type: "RUN" };

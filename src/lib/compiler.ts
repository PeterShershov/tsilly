import { transform, type Transform } from "sucrase";
import type { TypeScriptConfig } from "~/types/editor";

export interface CompilationResult {
  code: string;
  error: string | null;
}

export function compileTypeScript(code: string, config: TypeScriptConfig): CompilationResult {
  try {
    const transforms: Transform[] = ["typescript"];
    if (config.enableJsx) {
      transforms.push("jsx");
    }

    const result = transform(code, {
      transforms,
      disableESTransforms: config.disableESTransforms,
      jsxRuntime: config.jsxRuntime,
      jsxImportSource: config.jsxImportSource,
      production: config.production,
    });
    return { code: result.code, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { code: "", error };
  }
}

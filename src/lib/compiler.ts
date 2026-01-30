import { transform, type Transform } from "sucrase";
import type { TypeScriptConfig } from "~/types/editor";

export interface CompilationResult {
  code: string;
  error: string | null;
}

export function compileTypeScript(
  code: string,
  config: TypeScriptConfig,
): CompilationResult {
  try {
    const transforms: Transform[] = ["typescript"];
    const enableJsx = config.jsx !== "none";

    if (enableJsx) {
      transforms.push("jsx");
    }

    // Map jsx option to Sucrase's jsxRuntime
    const jsxRuntime =
      config.jsx === "react"
        ? "classic"
        : config.jsx === "react-jsx"
          ? "automatic"
          : config.jsx === "react-jsxdev"
            ? "automatic"
            : "classic";

    // Production mode when using react-jsx (not react-jsxdev)
    const production = config.jsx === "react-jsx";

    const result = transform(code, {
      transforms,
      disableESTransforms: config.target === "esnext",
      jsxRuntime,
      jsxImportSource: config.jsxImportSource,
      jsxPragma: config.jsxFactory,
      jsxFragmentPragma: config.jsxFragmentFactory,
      production,
    });

    return { code: result.code, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { code: "", error };
  }
}

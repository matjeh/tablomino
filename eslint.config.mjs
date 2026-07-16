import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // design-sync (claude.ai/design) staged scripts + generated bundle output
    ".ds-sync/**",
    "ds-bundle/**",
    // design handoff references (prototypes, not app source)
    "Design/**",
  ]),
]);

export default eslintConfig;

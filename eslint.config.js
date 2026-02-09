import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  // =========================
  // Global ignores
  // =========================
  {
    ignores: [
      "dist",
      "node_modules",
      "*.config.*",
    ],
  },

  // =========================
  // TypeScript + React files
  // =========================
  {
    files: ["**/*.{ts,tsx}"],

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],

    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: globals.browser,
    },

    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
    },

    settings: {
      // 🔥 CRITICAL: allow ESLint to resolve TS path aliases
      "import/resolver": {
        typescript: {
          project: [
            "./tsconfig.json",
            "./tsconfig.app.json",
          ],
        },
      },
    },

    rules: {
      // =========================
      // React rules
      // =========================
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // =========================
      // TypeScript relaxations
      // =========================
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",

      // =========================
      // 🔒 ARCHITECTURE ENFORCEMENT
      // =========================

      // ❌ Disallow ../ parent imports (force aliases)
      "import/no-relative-parent-imports": "error",

      // ❌ Error if alias is broken
      "import/no-unresolved": "error",

      // ❌ Ban old shadcn / legacy patterns
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/hooks/*"],
              message:
                "Do not import from '@/hooks'. Use '@shared/hooks/*' instead.",
            },
            {
              group: ["@/components/*"],
              message:
                "Do not import from '@/components'. Use '@shared/components/*'.",
            },
            {
              group: ["@/lib/*"],
              message:
                "Do not import from '@/lib'. Use '@shared/lib/*'.",
            },
            {
              group: ["../hooks/*"],
              message:
                "Do not use relative hook imports. Use '@shared/hooks/*'.",
            },
          ],
        },
      ],
    },
  }
);

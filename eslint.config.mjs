import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["dist", "build", "coverage", "node_modules", "netlify"],
    },
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.{ts,tsx}", "vite.config.ts"],
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": ["warn", {allowConstantExport: true}],
        },
    },
    {
        files: ["src/context/**/*.{ts,tsx}"],
        rules: {
            "react-refresh/only-export-components": "off",
        },
    },
);

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // React and Next.js best practices
      "react/prop-types": "off", // Using TypeScript
      "react/react-in-jsx-scope": "off", // Next.js handles this
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
      
      // TypeScript best practices
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      
      // General code quality
      "prefer-const": "warn",
      "no-var": "warn",
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "warn",
      
      // Import organization - make these warnings instead of errors
      "import/order": ["warn", {
        "groups": [
          "builtin",
          "external", 
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }]
    }
  },
];

export default eslintConfig;

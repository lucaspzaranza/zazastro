// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
//   {
//     rules: {
//       "@typescript-eslint/no-explicit-any": "off",
//       "react-hooks/exhaustive-deps": "off",
//     },
//   },
// ];

// export default eslintConfig;

import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Compatibilidade com configs antigas do Next.js
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Extensões padrão do Next.js + TypeScript
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Regras customizadas do projeto
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },

  // Ignorar pastas de build e dependências
  {
    files: ["**/*"], // aplica em todos os arquivos
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "out/**",
      "*.config.js",
    ],
  },
];

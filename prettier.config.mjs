/** @type {import("prettier").Config} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind CSS v4 hybrid 구성(tailwind.config.ts + app/globals.css)의 진입점
  tailwindStylesheet: "./app/globals.css",
};

export default config;

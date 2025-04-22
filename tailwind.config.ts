import type { Config } from "tailwindcss";
const { nextui } = require("@nextui-org/react");

export default {
  content: [
    "./src/shared/components/**/*.{js,jsx,ts,tsx}",
    "./src/domain/**/*.{js,jsx,ts,tsx}",
    "./src/entry/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    nextui()
  ],
} satisfies Config;

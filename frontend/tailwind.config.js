/** @type {import('tailwindcss').Config} */
export default {
    theme: {
      extend: {
        fontFamily: {
          'pixel': ["var(--font-vt323)", "monospace"],
        },
      },
    },
    content: ["./src/**/*.{js,ts,jsx,tsx}","./index.html"], // ajustá según tu estructura
    plugins: [],
  }
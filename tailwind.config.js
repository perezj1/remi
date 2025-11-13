/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // color principal REMI
        remi: {
          primary: "#8F31F3",
        },
      },
      borderRadius: {
        xl: "24px",
      },
      boxShadow: {
        card: "0 18px 40px rgba(25, 16, 74, 0.22)",
        button: "0 12px 24px rgba(143, 49, 243, 0.45)",
      },
    },
  },
  plugins: [],
};

module.exports = {
  purge: ["./src/**/*.html", "./src/**/*.vue"],
  theme: {
    rotate: {
      360: "360deg",
    },
    inset: {
      0: "0",
    },
    fontFamily: {
      sans: ["Roboto", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
    },
    extend: {
      colors: {
        primary: {
          100: "#79ecc9",
          200: "#63e9c0",
          300: "#4de5b7",
          400: "#36e2ae",
          500: "#27DFA7",
          600: "#1ab586",
          700: "#1ab284",
          800: "#138663",
        },
      },
      width: {
        100: "100%",
      },
    },
  },
  variants: {},
  plugins: [],
};

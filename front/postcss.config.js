// postcss.config.js
const postcssImport = require("postcss-import");
const autoprefixer = require("autoprefixer");
const tailwindcss = require("tailwindcss");

module.exports = {
  plugins: [postcssImport, tailwindcss, autoprefixer({ grid: false })],
  stats: { warnings: false }
};

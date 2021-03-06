let mix = require("laravel-mix");
const { BannerPlugin, DefinePlugin } = require("webpack");
const { readFileSync } = require("fs");
const pkg = require("./package.json");
const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const isDev = process.env.NODE_ENV !== "production";
const replaceVariables = (source, obj) => {
  let newSource = String(source);
  Object.entries(obj).forEach(([name, value]) => {
    newSource = newSource.split(`{{${name}}}`).join(value);
  });
  return newSource;
};
const outputFile = isDev ? "dist/app.js" : path.resolve("dist", pkg.main);
let appStyle;
let bannerContent;
const createHashVersion = () =>
  pkg.version + "-" + (Math.random() + 1).toString(36).substring(7);
let varContext = {
  ...pkg,
  grant: "none",
  displayName: pkg.userscript.name
};
if (isDev) varContext.version = createHashVersion();
bannerContent = replaceVariables(
  readFileSync("./src/banner.template").toString(),
  varContext
);
appStyle = readFileSync("./src/style/app.css").toString();
/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for your application, as well as bundling up your JS files.
 |
 */
mix.before(() => {
  if (isDev) varContext.version = createHashVersion();
  appStyle = readFileSync("./src/style/app.css").toString();
});
mix.setPublicPath("dist");
mix.webpackConfig({
  plugins: [
    new DefinePlugin({
      COUB_DL_CONTEXT: JSON.stringify({
        name: pkg.name,
        description: pkg.description,
        repository: pkg.repository,
        production: process.env.NODE_ENV === "production",
        version: pkg.version,
        style: appStyle,
      }),
    }),
    new BannerPlugin({
      banner: () => bannerContent,
      raw: true
    }),
  ],
});
mix.options({
  terser: {
    extractComments: {
      condition: true,
      filename: ({ filename }) => {
        return filename;
      },
      banner: bannerContent,
    },
  },
});
mix.ts(!isDev ? "src/app.prod.ts" : "src/app.dev.ts", outputFile);

// Full API
// mix.js(src, output);
// mix.react(src, output); <-- Identical to mix.js(), but registers React Babel compilation.
// mix.preact(src, output); <-- Identical to mix.js(), but registers Preact compilation.
// mix.coffee(src, output); <-- Identical to mix.js(), but registers CoffeeScript compilation.
// mix.ts(src, output); <-- TypeScript support. Requires tsconfig.json to exist in the same folder as webpack.mix.js
// mix.extract(vendorLibs);
// mix.sass(src, output);
// mix.less(src, output);
// mix.stylus(src, output);
// mix.postCss(src, output, [require('postcss-some-plugin')()]);
// mix.browserSync('my-site.test');
// mix.combine(files, destination);
// mix.babel(files, destination); <-- Identical to mix.combine(), but also includes Babel compilation.
// mix.copy(from, to);
// mix.copyDirectory(fromDir, toDir);
// mix.minify(file);
// mix.sourceMaps(); // Enable sourcemaps
// mix.version(); // Enable versioning.
// mix.disableNotifications();
// mix.setPublicPath('path/to/public');
// mix.setResourceRoot('prefix/for/resource/locators');
// mix.autoload({}); <-- Will be passed to Webpack's ProvidePlugin.
// mix.webpackConfig({}); <-- Override webpack.config.js, without editing the file directly.
// mix.babelConfig({}); <-- Merge extra Babel configuration (plugins, etc.) with Mix's default.
// mix.then(function () {}) <-- Will be triggered each time Webpack finishes building.
// mix.override(function (webpackConfig) {}) <-- Will be triggered once the webpack config object has been fully generated by Mix.
// mix.dump(); <-- Dump the generated webpack config object to the console.
// mix.extend(name, handler) <-- Extend Mix's API with your own components.
// mix.options({
//   extractVueStyles: false, // Extract .vue component styling to file, rather than inline.
//   globalVueStyles: file, // Variables file to be imported in every component.
//   processCssUrls: true, // Process/optimize relative stylesheet url()'s. Set to false, if you don't want them touched.
//   purifyCss: false, // Remove unused CSS selectors.
//   terser: {}, // Terser-specific options. https://github.com/webpack-contrib/terser-webpack-plugin#options
//   postCss: [] // Post-CSS options: https://github.com/postcss/postcss/blob/master/docs/plugins.md
// });

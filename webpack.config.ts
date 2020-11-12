let path = require("path");
module.exports = {
  entry: {
    app: "./src/ts/app.ts",
  },
  output: {
    filename: "build/bundle.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  module: {
    loaders: [{ test: /\.ts$/, loader: "ts-loader" }],
  },
};

import * as gulp from "gulp";
import * as webpack from "webpack";
import * as webpackStream from "webpack-stream";
import { join } from "path";
import { env } from "../config";
import { ENV_DEV, plugins } from "../utils/consts";
import { notify } from "../utils/notify";
import { ITs, ProcessInfo, StringMap } from "imagelogic-gulp";
import ReadWriteStream = NodeJS.ReadWriteStream;
import { createInfoArray, globFromInfoArray } from "../utils/files";
import { Globs } from "gulp";
import * as log from "fancy-log";
import * as colors from "ansi-colors";
import through2 = require("through2");

export const compileTs = (
  profile: ITs,
  name: string,
  watch: boolean,
  done: () => void
): void => {
  const files: ProcessInfo[] = createInfoArray(profile);
  const src: Globs = globFromInfoArray(files);

  log(`${name} with ENV:`, colors.red(env));
  const config: webpack.Configuration = makeWebpackConfig(profile, watch);

  gulp
    .src(src)
    .pipe(plumber())
    .pipe(webpackStream(config))
    .pipe(uglyfy())
    .pipe(gulp.dest(profile.dest))
    .on("finish", () => {
      done();
    });
};

const makeWebpackConfig = (
  profile: ITs,
  watch: boolean = false
): webpack.Configuration => {
  const entries: StringMap = {};
  for (const key in profile.files) {
    entries[key] = join(profile.src, profile.files[key]);
  }

  return {
    mode: "development",
    entry: entries,
    output: {
      filename: "[name]",
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: "ts-loader",
          options: {
            configFile: "./tsconfig.json",
          },
        },
      ],
    },
    optimization: {
      ...(profile.splitVendor
        ? {
            splitChunks: {
              name: "vendor.js",
              chunks: "initial",
            },
          }
        : {}),
    },
    devtool: env === ENV_DEV ? "inline-source-map" : false,
    watch: watch,
  };
};

const uglyfy = (): ReadWriteStream => {
  if (env === ENV_DEV) {
    return through2.obj();
  } else {
    return plugins.uglify();
  }
};

const plumber = (): ReadWriteStream => {
  return plugins.plumber({
    errorHandler: function (err: any) {
      notify(err);
      this.emit("end");
    },
  });
};

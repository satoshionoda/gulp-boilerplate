import * as colors from "ansi-colors";
import * as log from "fancy-log";
import * as gulp from "gulp";
import { Globs } from "gulp";
import { ISass, ProcessInfo } from "imagelogic-gulp";
import through2 = require("through2");
import { env } from "../config";
import { ENV_DEV, ENV_PROD, plugins } from "../utils/consts";
import { createInfoArray, globFromInfoArray, rename } from "../utils/files";
import { notify } from "../utils/notify";
import ReadWriteStream = NodeJS.ReadWriteStream;
const autoprefixer = require("gulp-autoprefixer");
const sass = require("gulp-sass")(require("sass"));

export const compileSass = (
  profile: ISass,
  name: string,
  done: () => void,
  priority: boolean = false
) => {
  log(`${name} with ENV:`, colors.red(env));
  const files: ProcessInfo[] = createInfoArray(profile, priority);
  const src: Globs = globFromInfoArray(files);

  gulp
    .src(src)
    .pipe(debug())
    .pipe(plumber())
    .pipe(initSourceMap())
    .pipe(sass())
    .pipe(autoprefixer(profile.autoprefixer))
    .pipe(addSourceMap())
    .pipe(addHashToImg())
    .pipe(minify())
    .pipe(rename(files))
    .pipe(gulp.dest(profile.dest))
    .on("finish", () => {
      done();
    });
};

const debug = (): ReadWriteStream => {
  return plugins.debug({ title: "sass processed:" });
};

const plumber = (): ReadWriteStream => {
  return plugins.plumber({
    errorHandler: function (err: any) {
      notify(err);
      this.emit("end");
    },
  });
};

const initSourceMap = (): ReadWriteStream => {
  return plugins.sourcemaps.init();
};

const addSourceMap = (): ReadWriteStream => {
  if (env === ENV_DEV) {
    return plugins.sourcemaps.write();
  } else {
    return through2.obj();
  }
};

const addHashToImg = (): NodeJS.ReadWriteStream => {
  if (env === ENV_PROD) {
    return plugins.replace(
      /background-image: url\("(.*)"\);/g,
      (match: string, p1: string, offset: number, string: string) => {
        const num = new Date().valueOf();
        return `background-image: url("${p1}?${num}");`;
      }
    );
  } else {
    return through2.obj();
  }
};

const minify = (): NodeJS.ReadWriteStream => {
  if (env === ENV_PROD) {
    return plugins.cleanCss({ debug: true }, (details: any) => {
      const name: string = details.name;
      const original: number = details.stats.originalSize;
      const minified: number = details.stats.minifiedSize;
      const originalKB: string = (original / 1024).toFixed(1) + "kB";
      const minifiedKB: string = (minified / 1024).toFixed(1) + "kB";
      const percent: string = ((minified / original) * 100).toFixed(1) + "%";
      log(`minified:`, colors.blue(name), `${originalKB} => ${minifiedKB} (${percent})`);
    });
  } else {
    return through2.obj();
  }
};

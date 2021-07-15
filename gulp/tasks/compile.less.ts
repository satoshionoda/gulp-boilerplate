import * as gulp from "gulp";
import { Globs } from "gulp";
import { env } from "../config";
import { ENV_DEV, ENV_PROD } from "../utils/consts";
import * as gulpLoadPlugins from "gulp-load-plugins";
import { notify } from "../utils/notify";
import * as util from "gulp-util";
import { ILess, ProcessInfo } from "imagelogic-gulp";
import { createInfoArray, globFromInfoArray, rename } from "../utils/files";
import * as autoprefixer from "autoprefixer";
import ReadWriteStream = NodeJS.ReadWriteStream;

const plugins: any = <any>gulpLoadPlugins();

export const compileLess = (
  profile: ILess,
  name: string,
  done: any,
  priority: boolean = false
): void => {
  util.log(`${name} with ENV:`, util.colors.red(env));
  const files: ProcessInfo[] = createInfoArray(profile, priority);
  const src: Globs = globFromInfoArray(files);

  gulp
    .src(src)
    .pipe(debug())
    .pipe(plumber())
    .pipe(initSourceMap())
    .pipe(less(profile.autoprefixer))
    .pipe(addSourceMap())
    .pipe(addHashToImg())
    .pipe(rename(files))
    .pipe(gulp.dest(profile.dest))
    .on("finish", () => {
      done();
    });
};

const debug = (): ReadWriteStream => {
  return plugins.debug({ title: "less processed:" });
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

const less = (autoprefixOpts: autoprefixer.Options): ReadWriteStream => {
  const LessAutoprefix = require("less-plugin-autoprefix");
  const autoprefix = new LessAutoprefix(autoprefixOpts);

  return plugins.less({
    plugins: [autoprefix],
  });
};

const addSourceMap = (): NodeJS.ReadWriteStream => {
  if (env === ENV_DEV) {
    return plugins.sourcemaps.write();
  } else {
    return util.noop();
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
    return util.noop();
  }
};

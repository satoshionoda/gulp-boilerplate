import * as gulp from "gulp";
import {env} from "../config";
import {ENV_DEV, ENV_PROD} from "../utils/consts";
import * as gulpLoadPlugins from "gulp-load-plugins";
import {notify} from "../utils/notify";
import * as util from "gulp-util";
import {ILess, ProcessInfo} from "imagelogic-gulp";
import {createInfoArray, globFromInfoArray, rename} from "../utils/files";
import {Globs} from "gulp";
import ReadWriteStream = NodeJS.ReadWriteStream;

const plugins: any = <any>gulpLoadPlugins();

let LessAutoprefix = require("less-plugin-autoprefix");
let autoprefix = new LessAutoprefix({
  browsers: [
    "last 3 versions",
    "Safari 8",
    "Android 4.2"
  ]
});

export function compileLess(profile: ILess, name: string, done: any, priority: boolean = false) {
  util.log(`${name} with ENV:`, util.colors.red(env));
  let files: ProcessInfo[] = createInfoArray(profile, priority);
  let src: Globs = globFromInfoArray(files);

  gulp.src(src)
    .pipe(debug())
    .pipe(plumber())
    .pipe(initSourceMap())
    .pipe(less())
    .pipe(addSourceMap())
    .pipe(addHashToImg())
    .pipe(rename(files))
    .pipe(gulp.dest(profile.dest))
    .on("finish", () => {
      done();
    });
}

function debug(): ReadWriteStream {
  return plugins.debug({title: "less processed:"});
}

function plumber(): ReadWriteStream {
  return plugins.plumber({
    errorHandler: function (err: any) {
      notify(err);
      this.emit("end");
    }
  });
}

function initSourceMap(): ReadWriteStream {
  return plugins.sourcemaps.init();
}

function less(): ReadWriteStream {
  return plugins.less({
    plugins: [autoprefix]
  });
}

function addSourceMap(): NodeJS.ReadWriteStream {
  if (env === ENV_DEV) {
    return plugins.sourcemaps.write();
    // return util.noop();
  } else {
    return util.noop();
  }
}

function addHashToImg(): NodeJS.ReadWriteStream {
  if (env === ENV_PROD) {
    return plugins.replace(/background-image: url\("(.*)"\);/g, (match: string, p1: string, offset: number, string: string) => {
      let num = new Date().valueOf();
      return `background-image: url("${p1}?${num}");`;
    });
  } else {
    return util.noop();
  }
}

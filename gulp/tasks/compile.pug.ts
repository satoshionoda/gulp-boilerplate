import * as gulp from "gulp";
import { join } from "path";
import { env } from "../config";
import * as gulpLoadPlugins from "gulp-load-plugins";
import * as util from "gulp-util";
import { notify } from "../utils/notify";
import { IPug, ProcessInfo } from "imagelogic-gulp";
import { Globs } from "gulp";
import ReadWriteStream = NodeJS.ReadWriteStream;
import { createInfoArray, globFromInfoArray, rename } from "../utils/files";

const plugins = <any>gulpLoadPlugins();

export function compilePug(profile: IPug, name: string, done: any, priority: boolean = false) {
  util.log(`${name} with ENV:`, util.colors.red(env));
  let files: ProcessInfo[] = createInfoArray(profile, priority);
  let src: Globs = globFromInfoArray(files);

  gulp
    .src(src)
    .pipe(debug())
    .pipe(plumber())
    .pipe(pug(profile))
    .pipe(rename(files))
    .pipe(gulp.dest(profile.dest))
    .on("finish", () => {
      done();
    });
}

function debug(): ReadWriteStream {
  return plugins.debug({ title: "pug processed:" });
}

function plumber(): ReadWriteStream {
  return plugins.plumber({
    errorHandler: function (err: any) {
      notify(err);
      this.emit("end");
    },
  });
}

function pug(profile: IPug): ReadWriteStream {
  let data: any = {};
  let dataPaths: string[] = profile.data;
  if (dataPaths) {
    for (let str of dataPaths) {
      let path = join(profile.src, str);
      delete require.cache[path];
      let tempData = require(path);
      // data = merge.recursive(true, dataPaths, tempData);
      data = Object.assign(data, tempData);
      util.log("pug settings loaded:", util.colors.green(str));
      // console.log(tempData);
    }
  }
  // console.log(data);

  return plugins.pug({
    pretty: true,
    locals: data,
    self: false,
  });
}

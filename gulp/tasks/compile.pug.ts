import * as gulp from "gulp";
import { Globs } from "gulp";
import { join } from "path";
import { env } from "../config";
import * as util from "gulp-util";
import { notify } from "../utils/notify";
import { IPug, ProcessInfo } from "imagelogic-gulp";
import { createInfoArray, globFromInfoArray, rename } from "../utils/files";
import ReadWriteStream = NodeJS.ReadWriteStream;
import { plugins } from "../utils/consts";

export const compilePug = (
  profile: IPug,
  name: string,
  done: () => void,
  priority: boolean = false
): void => {
  util.log(`${name} with ENV:`, util.colors.red(env));
  const files: ProcessInfo[] = createInfoArray(profile, priority);
  const src: Globs = globFromInfoArray(files);

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
};

const debug = (): ReadWriteStream => {
  return plugins.debug({ title: "pug processed:" });
};

const plumber = (): ReadWriteStream => {
  return plugins.plumber({
    errorHandler: function (err: any) {
      notify(err);
      this.emit("end");
    },
  });
};

const pug = (profile: IPug): ReadWriteStream => {
  let data: any = {};
  const dataPaths: string[] = profile.data;
  if (dataPaths) {
    for (const str of dataPaths) {
      const path = join(profile.src, str);
      delete require.cache[path];
      const tempData = require(path);
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
};

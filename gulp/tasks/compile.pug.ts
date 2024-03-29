import * as colors from "ansi-colors";
import * as log from "fancy-log";
import * as gulp from "gulp";
import { Globs } from "gulp";
import { IPug, ProcessInfo } from "imagelogic-gulp";
import { env } from "../config";
import { ENV_PROD, plugins } from "../utils/consts";
import { createInfoArray, globFromInfoArray, rename } from "../utils/files";
import { notify } from "../utils/notify";
import { join } from "path";
import ReadWriteStream = NodeJS.ReadWriteStream;

export const compilePug = (
  profile: IPug,
  name: string,
  done: () => void,
  priority: boolean = false
): void => {
  log(`${name} with ENV:`, colors.red(env));
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
  let data: any = {
    hash: env === ENV_PROD ? `?${new Date().valueOf()}` : "",
  };
  const dataPaths: string[] | undefined = profile.data;
  if (dataPaths) {
    for (const str of dataPaths) {
      const path = join(profile.src, str);
      delete require.cache[path];
      const tempData = require(path);
      // data = merge.recursive(true, dataPaths, tempData);
      data = Object.assign(data, tempData);
      log("pug settings loaded:", colors.green(str));
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

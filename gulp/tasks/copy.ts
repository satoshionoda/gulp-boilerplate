import * as gulp from "gulp";
import { ISync } from "imagelogic-gulp";
import { plugins } from "../utils/consts";
import ReadWriteStream = NodeJS.ReadWriteStream;

export const processSync = (profile: ISync, name: string, done: () => void): void => {
  const src = profile.src + "/**/*.*";
  gulp
    .src(src)
    .pipe(cache(name))
    .pipe(using())
    .pipe(gulp.dest(profile.dest))
    .on("finish", () => {
      done();
    });
};

const cache = (str: string): ReadWriteStream => {
  return plugins.cached(str);
};

const using = (): ReadWriteStream => {
  return plugins.using({ prefix: "copying", color: "blue" });
};

import * as gulp from "gulp";
import * as gulpLoadPlugins from "gulp-load-plugins";
import { ISync } from "imagelogic-gulp";
import ReadWriteStream = NodeJS.ReadWriteStream;

const plugins = <any>gulpLoadPlugins();

export function processSync(profile: ISync, name: string, done: any) {
  let src = profile.src + "/**/*.*";
  gulp
    .src(src)
    .pipe(cache(name))
    .pipe(using())
    .pipe(gulp.dest(profile.dest))
    .on("finish", () => {
      done();
    });
}

function cache(str: string): ReadWriteStream {
  return plugins.cached(str);
}

function using(): ReadWriteStream {
  return plugins.using({ prefix: "copying", color: "blue" });
}

import * as gulp from "gulp";
import gulpLoadPlugins = require("gulp-load-plugins");
import {join} from "path";
import pngquant = require("imagemin-pngquant");
import imageminMozjpeg = require("imagemin-mozjpeg");
import ReadWriteStream = NodeJS.ReadWriteStream;
import {IImagemin} from "imagelogic-gulp";

const plugins = <any>gulpLoadPlugins();

export function processImagemin(profile: IImagemin, done: any) {
  console.log(profile.path);
  gulp.src(`${profile.path}/**/*.*`)
    .pipe(imagemin(profile))
    .pipe(gulp.dest(profile.path))
    .on("finish", () => {
      done();
    });
}

function imagemin(profile: IImagemin): ReadWriteStream {
  return plugins.imagemin([
      plugins.imagemin.optipng(),
      pngquant({quality: profile.pngquant, speed: 1}),
      plugins.imagemin.jpegtran(),
      imageminMozjpeg({quality: profile.jpegmin}),
    ], {verbose: true}
  );
}

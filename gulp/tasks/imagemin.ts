import * as gulp from "gulp";
import { IImagemin } from "imagelogic-gulp";
import gulpLoadPlugins = require("gulp-load-plugins");
import pngquant = require("imagemin-pngquant");
import imageminMozjpeg = require("imagemin-mozjpeg");
import ReadWriteStream = NodeJS.ReadWriteStream;

const plugins = <any>gulpLoadPlugins();

export const processImagemin = (profile: IImagemin, done: any) => {
  console.log(profile.path);
  gulp
    .src(`${profile.path}/**/*.*`)
    .pipe(imagemin(profile))
    .pipe(gulp.dest(profile.path))
    .on("finish", () => {
      done();
    });
};

const imagemin = (profile: IImagemin): ReadWriteStream => {
  return plugins.imagemin(
    [
      plugins.imagemin.optipng(),
      pngquant({ quality: profile.pngquant, speed: 1 }),
      plugins.imagemin.mozjpeg(),
      imageminMozjpeg({ quality: profile.jpegmin }),
    ],
    { verbose: true }
  );
};

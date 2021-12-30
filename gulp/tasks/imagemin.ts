import * as colors from "ansi-colors";
import * as log from "fancy-log";
import * as gulp from "gulp";
import { IImagemin } from "imagelogic-gulp";
import imageminMozjpeg = require("imagemin-mozjpeg");
import pngquant = require("imagemin-pngquant");
import { plugins } from "../utils/consts";
import ReadWriteStream = NodeJS.ReadWriteStream;

export const processImagemin = (profile: IImagemin, done: () => void) => {
  log("compressing", colors.yellow(profile.path));
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

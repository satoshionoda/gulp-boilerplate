import * as gulp from "gulp";
import { IImagemin } from "imagelogic-gulp";
import pngquant = require("imagemin-pngquant");
import imageminMozjpeg = require("imagemin-mozjpeg");
import ReadWriteStream = NodeJS.ReadWriteStream;
import { plugins } from "../utils/consts";
import * as log from "fancy-log";
import * as colors from "ansi-colors";

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

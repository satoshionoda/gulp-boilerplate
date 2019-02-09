import * as gulp from "gulp";
import gulpLoadPlugins = require("gulp-load-plugins");
import {join} from "path";
import pngquant = require("imagemin-pngquant");
import imageminMozjpeg = require("imagemin-mozjpeg");

const plugins = <any>gulpLoadPlugins();

export = () => {
  let path = join(process.cwd(), "public/layout/store/pc/brand/assets/images/");
  return gulp.src(`${path}**/*`).pipe(
    plugins.imagemin([
      plugins.imagemin.optipng(),
      pngquant({quality: "40-100", speed: 1}),
      plugins.imagemin.jpegtran(),
      //A:60, B:70, C:80
      imageminMozjpeg({quality:80}),
    ], {verbose: true})
  ).pipe(
    gulp.dest(path)
  );
};

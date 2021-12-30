import * as gulpLoadPlugins from "gulp-load-plugins";

export const ENV_DEV: string = "develop";
export const ENV_PROD: string = "prod";

export enum KEYS {
  PUG = "pug",
  LESS = "less",
  TS = "ts",
  WATCH = "watch",
  OPEN = "open",
  SYNC = "sync",
  CLEAN = "clean",
  IMAGEMIN = "imagemin",
  LIVE_RELOAD = "liveReload",
  SINGLE_RELOAD = "singleReload",
  BROWSER_SYNC = "browser-sync",
  PRIORITY = "priority",
  BUILD = "build",
}

export const plugins: any = gulpLoadPlugins();

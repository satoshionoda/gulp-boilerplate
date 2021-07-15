import * as gulp from "gulp";
import { join } from "path";
import * as gulpLoadPlugins from "gulp-load-plugins";
import { IBrowserSync, ISrc, ISync } from "imagelogic-gulp";
import { KEYS } from "../utils/consts";

const plugins: any = <any>gulpLoadPlugins();

export const runWatchCopy = (profile: ISync, profileName: string): void => {
  let src: string = profile.src;
  const syncName: string = profile.name;
  src += "/**/*.*";
  gulp.watch(src, gulp.series(`${profileName}.sync.${syncName}`));
};

export const runWatchCompile = (
  profile: ISrc,
  profileName: string,
  taskBaseName: string
) => {
  const globs: string[] = [];
  for (let ext of profile.watch) {
    ext = "*." + ext;
    globs.push(join(profile.src, "/**/", ext));
  }
  let taskName;
  if (profile.files_priority) {
    taskName = `${profileName}.${taskBaseName}.priority`;
  } else {
    taskName = `${profileName}.${taskBaseName}`;
  }
  gulp.watch(globs, gulp.series(taskName));
};

export const liveReload = (profile: IBrowserSync): void => {
  const ext: string[] = profile.watch.ext,
    watch: string[] = [];

  for (const e of ext) {
    const str: string = profile.watch.dir + "/**/*." + e;
    watch.push(str);
  }
  if (profile.watch.exclude) {
    profile.watch.exclude.forEach((str) => {
      str = "!" + str;
      watch.push(str);
    });
  }
  gulp.watch(watch, gulp.series(KEYS.SINGLE_RELOAD));
};

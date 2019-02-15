import * as gulp from "gulp";
import {join} from "path";
import * as gulpLoadPlugins from "gulp-load-plugins";
import {ISync, ILiveReload, ISrc} from "imagelogic-gulp";
import {KEYS} from "../../gulpfile";

const plugins: any = <any>gulpLoadPlugins();


export function runWatchCopy(profile: ISync, profileName: string) {
  let src: string = profile.src;
  let syncName: string = profile.name;
  src += "/**/*.*";
  gulp.watch(src, gulp.series(`${profileName}.sync.${syncName}`));
}

export function runWatchCompile(profile: ISrc, profileName: string, taskBaseName: string) {
  let globs: string[] = [];
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
}

export function reloadBrowser() {
  let livereload = plugins.livereload;
  livereload.reload();
}

export function liveReload(profile: ILiveReload) {
  let livereload = plugins.livereload;

  livereload();
  livereload.listen({
    basePath: profile.dir
  });

  let ext: string[]   = profile.ext,
      watch: string[] = [];

  for (let e of ext) {
    let str: string = profile.dir + "/**/*." + e;
    watch.push(str);
  }
  if (profile.exclude) {
    profile.exclude.forEach((str) => {
      str = "!" + str;
      watch.push(str);
    });
  }

  gulp.watch(watch, gulp.series(KEYS.SINGLE_RELOAD));
}

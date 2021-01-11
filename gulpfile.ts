import * as gulp from "gulp";
import * as Undertaker from "undertaker";
import * as config from "./gulp/config";
import { compilePug } from "./gulp/tasks/compile.pug";
import { compileLess } from "./gulp/tasks/compile.less";
import { compileTs } from "./gulp/tasks/compile.ts";
import { processSync } from "./gulp/tasks/copy";
import { IBuild, ILess, IProfile, IPug, ISync, ITs } from "imagelogic-gulp";
import { clean } from "./gulp/tasks/clean";
import { ENV_DEV, ENV_PROD } from "./gulp/utils/consts";
import {
  liveReload,
  reloadBrowser,
  runWatchCompile,
  runWatchCopy,
} from "./gulp/tasks/watches";
import { processImagemin } from "./gulp/tasks/imagemin";
import { openURL } from "./gulp/tasks/open";
import * as browserSync from "browser-sync";
import { join } from "path";

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

function registerPug(profile: IPug, profileName: string) {
  const name: string = `${profileName}.${KEYS.PUG}`;
  gulp.task(name, (done: () => void) => {
    compilePug(profile, name, done);
  });

  if (profile.files_priority) {
    gulp.task(`${name}.${KEYS.PRIORITY}`, (done: () => void) => {
      compilePug(profile, name, done, true);
    });
  }
  gulp.task(`${name}.${KEYS.WATCH}`, () => {
    runWatchCompile(profile, profileName, KEYS.PUG);
  });
}

function registerLess(profile: ILess, profileName: string) {
  const name: string = `${profileName}.${KEYS.LESS}`;
  gulp.task(name, (done: () => void) => {
    compileLess(profile, name, done);
  });

  if (profile.files_priority) {
    gulp.task(`${name}.${KEYS.PRIORITY}`, (done: () => void) => {
      compileLess(profile, name, done, true);
    });
  }

  gulp.task(`${name}.${KEYS.WATCH}`, () => {
    runWatchCompile(profile, profileName, KEYS.LESS);
  });
}

function registerTs(profile: ITs, profileName: string) {
  const name: string = `${profileName}.${KEYS.TS}`;
  gulp.task(name, (done: () => void) => {
    compileTs(profile, name, false, done);
  });

  gulp.task(`${name}.${KEYS.WATCH}`, (done: () => void) => {
    compileTs(profile, name, true, done);
  });
}

function registerSync(profile: ISync, profileName: string) {
  const name: string = `${profileName}.${KEYS.SYNC}.${profile.name}`;
  gulp.task(name, (done: () => void) => {
    processSync(profile, name, done);
  });

  if (profile.watch) {
    gulp.task(`${name}.${KEYS.WATCH}`, () => {
      runWatchCopy(profile, profileName);
    });
  }
}

function registerClean(build: IBuild) {
  if (build.clean) {
    gulp.task(`${build.name}.${KEYS.CLEAN}`, (done: () => void) => {
      clean(build.clean, done);
    });
  }
}

function registerImagemin(build: IBuild) {
  if (!build.imagemin) {
    return;
  }
  gulp.task(`${build.name}.${KEYS.IMAGEMIN}`, (done: any) => {
    processImagemin(build.imagemin, done);
  });
}

function registerOpen(build: IBuild) {
  if (!build.url) {
    return;
  }
  gulp.task(`${build.name}.${KEYS.OPEN}`, (done: any) => {
    openURL(build.url, done);
  });
}

function registerBuildDevelop(build: IBuild) {
  const tasks = createTaskSequence(build);
  gulp.task(`${build.name}.${KEYS.BUILD}.${ENV_DEV}`, gulp.series(...tasks));
}

function registerBuildProd(build: IBuild) {
  const tasks = createTaskSequence(build);
  tasks.unshift((done: () => void) => {
    config.changeEnv(ENV_PROD);
    done();
  });
  if (build.imagemin) {
    tasks.push(`${build.name}.${KEYS.IMAGEMIN}`);
  }
  gulp.task(`${build.name}.${KEYS.BUILD}.${ENV_PROD}`, gulp.series(...tasks));
}

function registerWatch(build: IBuild) {
  const tasks: Undertaker.Task[] = [];
  build.profiles.forEach((profileName) => {
    const profile = findProfile(profileName);
    if (profile.ts) {
      tasks.push(`${profile.name}.${KEYS.TS}.${KEYS.WATCH}`);
    }
    if (profile.pug) {
      tasks.push(`${profile.name}.${KEYS.PUG}.${KEYS.WATCH}`);
    }
    if (profile.less) {
      tasks.push(`${profile.name}.${KEYS.LESS}.${KEYS.WATCH}`);
    }
    if (profile.sync) {
      profile.sync.forEach((sync) => {
        if (sync.watch) {
          tasks.push(`${profile.name}.${KEYS.SYNC}.${sync.name}.${KEYS.WATCH}`);
        }
      });
    }
  });
  if (build.livereload) {
    tasks.push(`${build.name}.${KEYS.LIVE_RELOAD}`);
  }
  if (build.server) {
    tasks.push(`${build.name}.${KEYS.BROWSER_SYNC}`);
  }
  gulp.task(`${build.name}.${KEYS.WATCH}`, gulp.parallel(...tasks));
}

function registerDevelop(build: IBuild) {
  const tasks: Undertaker.Task[] = [
    `${build.name}.${KEYS.BUILD}.${ENV_DEV}`,
    `${build.name}.${KEYS.WATCH}`,
  ];
  gulp.task(`${build.name}.${ENV_DEV}`, gulp.series(...tasks));
}

function registerLiveReload(build: IBuild) {
  if (!build.livereload) {
    return;
  }
  gulp.task(`${build.name}.${KEYS.LIVE_RELOAD}`, () => {
    liveReload(build.livereload);
  });
}

function registerBrowserSync(build: IBuild) {
  if (!build.server) {
    return;
  }
  gulp.task(`${build.name}.${KEYS.BROWSER_SYNC}`, () => {
    browserSync.init({
      server: {
        baseDir: build.server.base,
      },
    });
  });
}

function createTaskSequence(build: IBuild): Undertaker.Task[] {
  const buildName: string = build.name;
  const tasks: Undertaker.Task[] = [];
  if (build.clean) {
    tasks.push(`${buildName}.${KEYS.CLEAN}`);
  }
  build.profiles.forEach((key: string) => {
    const profile: IProfile = findProfile(key);
    if (!profile) {
      return;
    }
    const profileName: string = profile.name;
    if (profile.sync) {
      profile.sync.forEach((sync) => {
        tasks.push(`${profileName}.${KEYS.SYNC}.${sync.name}`);
      });
    }
    if (profile.pug) {
      tasks.push(`${profileName}.${KEYS.PUG}`);
    }
    if (profile.less) {
      tasks.push(`${profileName}.${KEYS.LESS}`);
    }
    if (profile.ts) {
      tasks.push(`${profileName}.${KEYS.TS}`);
    }
  });

  return tasks;
}

function findProfile(key: string) {
  let r: IProfile = null;
  config.profile.forEach((profile) => {
    if (profile.name === key) {
      r = profile;
    }
  });
  return r;
}

gulp.task(`${KEYS.SINGLE_RELOAD}`, (done) => {
  reloadBrowser();
  done();
});

config.profile.forEach((profile: IProfile) => {
  const profileName: string = profile.name;
  if (profile.pug) {
    registerPug(profile.pug, profileName);
  }
  if (profile.less) {
    registerLess(profile.less, profileName);
  }
  if (profile.ts) {
    registerTs(profile.ts, profileName);
  }
  if (profile.sync) {
    profile.sync.forEach((sync) => {
      registerSync(sync, profileName);
    });
  }
});

config.build.forEach((build: IBuild) => {
  registerOpen(build);
  registerClean(build);
  registerImagemin(build);
  registerLiveReload(build);
  registerBrowserSync(build);
  registerBuildDevelop(build);
  registerBuildProd(build);
  registerWatch(build);
  registerDevelop(build);
});

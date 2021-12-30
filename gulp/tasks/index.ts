import * as browserSync from "browser-sync";
import * as gulp from "gulp";
import { IBuild, ILess, IProfile, IPug, ISync, ITs } from "imagelogic-gulp";
import * as Undertaker from "undertaker";
import { clean } from "./clean";
import { compileLess } from "./compile.less";
import { compilePug } from "./compile.pug";
import { compileTs } from "./compile.ts";
import { processSync } from "./copy";
import { processImagemin } from "./imagemin";
import { openURL } from "./open";
import { liveReload, runWatchCompile, runWatchCopy } from "./watches";
import * as config from "../config";
import { ENV_DEV, ENV_PROD, KEYS } from "../utils/consts";

const registerPug = (profile: IPug, profileName: string) => {
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
};

const registerLess = (profile: ILess, profileName: string) => {
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
};

const registerTs = (profile: ITs, profileName: string) => {
  const name: string = `${profileName}.${KEYS.TS}`;
  gulp.task(name, (done: () => void) => {
    compileTs(profile, name, false, done);
  });

  gulp.task(`${name}.${KEYS.WATCH}`, (done: () => void) => {
    compileTs(profile, name, true, done);
  });
};

const registerSync = (profile: ISync, profileName: string) => {
  const name: string = `${profileName}.${KEYS.SYNC}.${profile.name}`;
  gulp.task(name, (done: () => void) => {
    processSync(profile, name, done);
  });

  if (profile.watch) {
    gulp.task(`${name}.${KEYS.WATCH}`, () => {
      runWatchCopy(profile, profileName);
    });
  }
};

const registerClean = (build: IBuild) => {
  const _clean = build.clean;
  if (!_clean) {
    return;
  }
  gulp.task(`${build.name}.${KEYS.CLEAN}`, (done: () => void) => {
    clean(_clean, done);
  });
};

const registerImagemin = (build: IBuild) => {
  const imagemin = build.imagemin;
  if (!imagemin) {
    return;
  }
  gulp.task(`${build.name}.${KEYS.IMAGEMIN}`, (done: any) => {
    processImagemin(imagemin, done);
  });
};

const registerBuildDevelop = (build: IBuild) => {
  const tasks = createTaskSequence(build);
  gulp.task(`${build.name}.${KEYS.BUILD}.${ENV_DEV}`, gulp.series(...tasks));
};

const registerBuildProd = (build: IBuild) => {
  const tasks = createTaskSequence(build);
  tasks.unshift((done: () => void) => {
    config.changeEnv(ENV_PROD);
    done();
  });
  if (build.imagemin) {
    tasks.push(`${build.name}.${KEYS.IMAGEMIN}`);
  }
  gulp.task(`${build.name}.${KEYS.BUILD}.${ENV_PROD}`, gulp.series(...tasks));
};

const registerWatch = (build: IBuild) => {
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
  const liveReload = setLiveReload(build);
  liveReload ? tasks.push(liveReload) : "";
  const server = setLiveReload(build);
  server ? tasks.push(server) : "";
  //
  gulp.task(`${build.name}.${KEYS.WATCH}`, gulp.parallel(...tasks));
};

const registerStart = (build: IBuild) => {
  const tasks: Undertaker.Task[] = [
    `${build.name}.${KEYS.BUILD}.${ENV_DEV}`,
    `${build.name}.${KEYS.WATCH}`,
  ];
  const wait = (done: () => void) => {
    setTimeout(() => done(), 3000);
  };
  const open = setOpen(build);
  const startTask: Undertaker.Task[] = [gulp.series(...tasks)];
  if (open) {
    startTask.push(gulp.series(wait, open));
  }

  gulp.task(`${build.name}.start`, gulp.parallel(...startTask));
};

const setLiveReload = (build: IBuild): Undertaker.Task | undefined => {
  const config = build.server;
  if (!config) {
    return;
  }
  const watch = (done: () => void) => {
    liveReload(config, browserSync);
    done();
  };
  return watch;
};
const setBrowserSync = (build: IBuild): Undertaker.Task | undefined => {
  const config = build.server;
  if (!config) {
    return;
  }

  const server = (done: () => void) => {
    browserSync.init({
      server: {
        baseDir: config.base,
      },
      port: config.port ?? 3000,
      open: false,
    });
    done();
  };
  return server;
};
const setOpen = (build: IBuild): Undertaker.Task | undefined => {
  const config = build.server;
  if (!config) {
    return;
  }
  const open = (done: () => void) => {
    if (config.start) {
      openURL(`http://localhost:${config.port}${config.start}`, done);
    } else {
      done();
    }
  };
  return open;
};

const createTaskSequence = (build: IBuild): Undertaker.Task[] => {
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
};

const findProfile = (key: string) => {
  let r: IProfile;
  config.profile.forEach((profile) => {
    if (profile.name === key) {
      r = profile;
    }
  });
  return r!;
};

const init = (): void => {
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
    registerClean(build);
    registerImagemin(build);
    registerBuildDevelop(build);
    registerBuildProd(build);
    registerWatch(build);
    registerStart(build);
  });
};

export { init };

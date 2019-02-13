import * as gulp from "gulp";
import * as Undertaker from "undertaker";

import * as config from "./gulp/config";
import {compilePug} from "./gulp/tasks/compile.pug";
import {compileLess} from "./gulp/tasks/compile.less";
import {compileTs} from "./gulp/tasks/compile.ts";
import {processSync} from "./gulp/tasks/copy";
import {IBuild, ILess, IProfile, IPug, ISync, ITs} from "imagelogic-gulp";
import {clean} from "./gulp/tasks/clean";
import {ENV_PROD} from "./gulp/utils/consts";
import {liveReload, reloadBrowser, runWatchCompile, runWatchCopy} from "./gulp/tasks/watches";
import {processImagemin} from "./gulp/tasks/imagemin";


function registerPug(profile: IPug, profileName: string) {
  const name: string = `${profileName}.pug`;
  gulp.task(name, (done: () => void) => {
    compilePug(profile, name, done);
  });

  if (profile.files_priority) {
    gulp.task(`${name}.priority`, (done: () => void) => {
      compilePug(profile, name, done, true);
    });
  }
  gulp.task(`${name}.watch`, () => {
    runWatchCompile(profile, profileName, "pug");
  });

}

function registerLess(profile: ILess, profileName: string) {
  const name: string = `${profileName}.less`;
  gulp.task(name, (done: () => void) => {
    compileLess(profile, name, done);
  });

  if (profile.files_priority) {
    gulp.task(`${name}.priority`, (done: () => void) => {
      compileLess(profile, name, done, true);
    });
  }

  gulp.task(`${name}.watch`, () => {
    runWatchCompile(profile, profileName, "less");
  });
}

function registerTs(profile: ITs, profileName: string) {
  const name: string = `${profileName}.ts`;
  gulp.task(name, (done: () => void) => {
    compileTs(profile, name, false, done);
  });

  gulp.task(`${name}.watch`, (done: () => void) => {
    compileTs(profile, name, true, done);
  });
}

function registerSync(profile: ISync, profileName: string) {
  const name: string = `${profileName}.sync.${profile.name}`;
  gulp.task(name, (done: () => void) => {
    processSync(profile, name, done);
  });

  if (profile.watch) {
    gulp.task(`${name}.watch`, () => {
      runWatchCopy(profile, profileName);
    });
  }
}

function registerClean(build: IBuild) {
  if (build.clean) {
    gulp.task(`${build.name}.clean`, (done: () => void) => {
      clean(build.clean, done);
    });
  }
}

function registerImagemin(build: IBuild) {
  if (!build.imagemin) {
    return;
  }
  gulp.task(`${build.name}.imagemin`, (done: any) => {
    processImagemin(build.imagemin, done);
  });
}

function registerBuildDevelop(build: IBuild) {
  const tasks = createTaskSequence(build);
  gulp.task(`${build.name}.build.develop`, gulp.series(...tasks));
}

function registerBuildProd(build: IBuild) {
  const tasks = createTaskSequence(build);
  tasks.unshift((done: () => void) => {
    config.changeEnv(ENV_PROD);
    done();
  });
  tasks.push(`${build.name}.imagemin`);
  gulp.task(`${build.name}.build.prod`, gulp.series(...tasks));
}

function registerWatch(build: IBuild) {
  const tasks: Undertaker.Task[] = [];
  build.profiles.forEach((profileName) => {
    const profile = findProfile(profileName);
    if (profile.ts) {
      tasks.push(`${profile.name}.ts.watch`);
    }
    if (profile.pug) {
      tasks.push(`${profile.name}.pug.watch`);
    }
    if (profile.less) {
      tasks.push(`${profile.name}.less.watch`);
    }
    if (profile.sync) {
      profile.sync.forEach((sync) => {
        if (sync.watch) {
          tasks.push(`${profile.name}.sync.${sync.name}.watch`);
        }
      });
    }
  });
  if (build.livereload) {
    tasks.push(`${build.name}.liveReload`);
  }
  gulp.task(`${build.name}.watch`, gulp.parallel(...tasks));
}

function registerDevelop(build: IBuild) {
  const tasks: Undertaker.Task[] = [
    `${build.name}.build.develop`,
    `${build.name}.watch`
  ];
  gulp.task(`${build.name}.develop`, gulp.series(...tasks));

}

function registerLiveReload(build: IBuild) {
  if (!build.livereload) {
    return;
  }
  gulp.task(`${build.name}.liveReload`, () => {
    liveReload(build.livereload);
  });
}


function createTaskSequence(build: IBuild): Undertaker.Task[] {
  const buildName: string = build.name;
  const tasks: Undertaker.Task[] = [];
  if (build.clean) {
    tasks.push(`${buildName}.clean`);
  }
  build.profiles.forEach((key: string) => {
    const profile: IProfile = findProfile(key);
    if (!profile) {
      return;
    }
    const profileName: string = profile.name;
    if (profile.sync) {
      profile.sync.forEach((sync) => {
        tasks.push(`${profileName}.sync.${sync.name}`);
      });
    }
    if (profile.pug) {
      tasks.push(`${profileName}.pug`);
    }
    if (profile.less) {
      tasks.push(`${profileName}.less`);
    }
    if (profile.ts) {
      tasks.push(`${profileName}.ts`);
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


gulp.task(`reloadBrowser`, (done) => {
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
  registerClean(build);
  registerImagemin(build);
  registerLiveReload(build);
  registerBuildDevelop(build);
  registerBuildProd(build);
  registerWatch(build);
  registerDevelop(build);
});



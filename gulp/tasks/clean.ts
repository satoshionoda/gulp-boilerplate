/**
 * borrowed from Angular2 Seed
 * https://github.com/mgechev/angular2-seed
 */

import * as rimraf from "rimraf";
import * as log from "fancy-log";
import * as colors from "ansi-colors";

/**
 * Cleans the given path(s) using `rimraf`.
 * @param {string or string[]} paths - The path or list of paths to clean.
 * @param done
 */
export const clean = (paths: string | string[], done: () => void) => {
  let pathsToClean: string[];
  if (paths instanceof Array) {
    pathsToClean = paths;
  } else {
    pathsToClean = [<string>paths];
  }

  const promises = pathsToClean.map((p) => {
    return new Promise((resolve: any) => {
      rimraf(p, (e) => {
        if (e) {
          log("Clean task failed with", e);
        } else {
          log("Deleted", colors.yellow(p || "-"));
        }
        resolve();
      });
    });
  });
  Promise.all(promises).then(() => done());
};

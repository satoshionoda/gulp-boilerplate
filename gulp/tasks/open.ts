import opn = require("open");

export const openURL = (urls: string | string[], done: () => void) => {
  let toOpen: string[];
  if (urls instanceof Array) {
    toOpen = urls;
  } else {
    toOpen = [urls];
  }

  toOpen.forEach((str) => {
    opn(str);
  });

  done();
};

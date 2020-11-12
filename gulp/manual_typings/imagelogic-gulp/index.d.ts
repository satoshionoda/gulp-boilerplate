declare module "imagelogic-gulp" {
  import * as autoprefixer from "autoprefixer";

  interface IProfile {
    name: string;
    sync?: ISync[];
    pug?: IPug;
    less?: ILess;
    ts?: ITs;
  }

  interface IBuild {
    name: string;
    profiles: string[];
    clean?: string | string[];
    livereload?: ILiveReload;
    imagemin?: IImagemin;
    url?: string | string[];
    server?: {
      base: string;
      port?: number;
    };
  }

  interface ISync {
    name: string;
    src: string;
    dest: string;
    watch: boolean;
  }

  interface ISrc {
    files_priority?: StringMap;
    files: StringMap;
    src: string;
    dest: string;
    watch: string[];
  }

  interface ILess extends ISrc {
    autoprefixer: autoprefixer.Options;
  }

  interface ITs extends ISrc {}

  interface IPug extends ISrc {
    data?: string[];
  }

  interface ILiveReload {
    dir: string;
    ext: string[];
    exclude?: string[];
  }

  interface IImagemin {
    path: string;
    jpegmin: number;
    pngquant: [number, number];
  }

  interface StringMap {
    [key: string]: string;
  }

  interface ProcessInfo {
    src: string;
    dest: string;
    fullSrc: string;
    fullDest: string;
  }
}

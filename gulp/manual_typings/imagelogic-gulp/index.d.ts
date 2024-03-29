declare module "imagelogic-gulp" {
  import * as autoprefixer from "autoprefixer";

  interface IProfile {
    name: string;
    sync?: ISync[];
    pug?: IPug;
    less?: ILess;
    sass?: ISass;
    ts?: ITs;
  }

  interface IBuild {
    name: string;
    profiles: string[];
    clean?: string | string[];
    imagemin?: IImagemin;
    url?: string | string[];
    server?: IBrowserSync;
  }
  interface IBrowserSync {
    base: string;
    watch: ILiveReload;
    port?: number;
    start?: string;
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
  interface ISass extends ISrc {
    autoprefixer: autoprefixer.Options;
  }

  interface ITs extends ISrc {
    splitVendor?: boolean;
  }

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

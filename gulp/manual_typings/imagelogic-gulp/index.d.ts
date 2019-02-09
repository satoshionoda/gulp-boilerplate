declare module "imagelogic-gulp" {

  interface IProfile {
    name: string;
    paths: string | string[];
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

  }

  interface ITs extends ISrc {

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
	  path:string;
	  jpegmin:number;
    pngquant:[number, number];
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

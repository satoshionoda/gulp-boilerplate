import {join} from "path";
import * as util from "gulp-util";
import * as consts from "./utils/consts";
import {IProfile} from "imagelogic-gulp";
import {IBuild} from "imagelogic-gulp";

const PROFILE_STATIC:string = "static";
const PROFILE_WP:string = "wp";
const BUILD_STATIC:string = "static";
const BUILD_WP:string = "wp";
const BUILD_ALL:string = "all";

const SRC_DIR = join(process.cwd(), "src");
const PUBLIC_DIR = join(process.cwd(), "public_static");
const PROD_DIR = join(PUBLIC_DIR, "products");
const ASSETS_DIR = join(PROD_DIR, "assets");

class Config {

  env:string = consts.ENV_DEV;

  profile:IProfile[] = [
    {
      name: PROFILE_STATIC,
      paths: join(PROD_DIR),
      pug: {
        src: join(SRC_DIR, "pug"),
        dest: join(PROD_DIR),
        watch: ["pug", "json", "js", "svg", "html"],
        data: ["_include/settings.json", "_include/meta.json"],
        files_priority: {
          "index.html": "top.pug",
        },
        files: {
          "index.html": "top.pug",
          "sub/index.html": "sub.pug",
        }
      },
      less: {
        src: join(SRC_DIR, "less"),
        dest: join(ASSETS_DIR, "css"),
        watch: ["less"],
        files_priority: {
          "main.css": "main.less",
        },
        files: {
          "main.css": "main.less",
          "top.css": "top.less",
        },
        autoprefixer: {
          browsers: [
            "last 2 versions"
          ]
        }
      },
      ts: {
        src: join(SRC_DIR, "ts"),
        dest: join(ASSETS_DIR, "js"),
        watch: ["ts"],
        files: {
          "main.js": "main.ts",
          "top.js": "top.ts",
        }
      },
      sync: [
        {
          name: "img",
          src: join(SRC_DIR, "assets/img"),
          dest: join(ASSETS_DIR, "images"),
          watch: false
        }, {
          name: "libs",
          src: join(SRC_DIR, "assets/libs"),
          dest: join(ASSETS_DIR, "libs"),
          watch: true
        }, {
          name: "fonts",
          src: join(SRC_DIR, "assets/fonts"),
          dest: join(ASSETS_DIR, "fonts"),
          watch: false
        }
      ]
    }
  ];
  build:IBuild[] = [
    {
      name: BUILD_STATIC,
      clean: [join(PROD_DIR)],
      profiles: [PROFILE_STATIC],
      livereload: {
        dir: PUBLIC_DIR,
        ext: ["php", "html", "css", "js", "jpg", "gif", "svg", "png"],
      },
      imagemin: {
        path: join(ASSETS_DIR, "images"),
        pngquant: [0.4, 1],
        jpegmin: 80
      }
    }
  ];

  changeEnv(env:string){
    this.env = env;
  }

  constructor(){
    util.log("making config");
  }
}

const config:Config = new Config();
export = config;


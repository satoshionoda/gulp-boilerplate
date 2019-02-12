import * as gulp from "gulp";
import * as webpack from "webpack";
import * as webpackStream from "webpack-stream";
import {join} from "path";
import {env} from "../config";
import {ENV_DEV} from "../utils/consts";
import * as gulpLoadPlugins from "gulp-load-plugins";
import * as util from "gulp-util";
import {notify} from "../utils/notify";
import {ITs, ProcessInfo, StringMap} from "imagelogic-gulp";
import ReadWriteStream = NodeJS.ReadWriteStream;
import {createInfoArray, globFromInfoArray} from "../utils/files";
import {Globs} from "gulp";

const plugins = <any>gulpLoadPlugins();

export function compileTs(profile: ITs, name: string, watch: boolean, done: any) {
  let files: ProcessInfo[] = createInfoArray(profile);
  let src: Globs = globFromInfoArray(files);

  util.log(`${name} with ENV:`, util.colors.red(env));
  let config: webpack.Configuration = makeWebpackConfig(profile, watch);

  gulp.src(src)
    .pipe(plumber())
    .pipe(webpackStream(config))
    .pipe(uglyfy())
    .pipe(gulp.dest(profile.dest))
    .on("finish", () => {
      done();
    });
}


function makeWebpackConfig(profile: ITs, watch: boolean = false): webpack.Configuration {
  let entries: StringMap = {};
  for (let key in profile.files) {
    entries[key] = join(profile.src, profile.files[key]);
  }

  return {
    mode: "development",
    entry: entries,
    output: {
      filename: "[name]"
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: "ts-loader",
          options: {
            configFile: "./tsconfig.json"
          }
        }
      ]
    },
    devtool: (env === ENV_DEV ? "inline-source-map" : false),
    watch: watch
  };
}

function uglyfy(): ReadWriteStream {
  if (env === ENV_DEV) {
    return util.noop();
  } else {
    return plugins.uglify();
  }
}

function plumber(): ReadWriteStream {
  return plugins.plumber({
    errorHandler: function(err: any) {
      notify(err);
      this.emit("end");
    }
  });
}

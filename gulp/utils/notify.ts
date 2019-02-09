import * as gulpLoadPlugins from "gulp-load-plugins";

const plugins = <any>gulpLoadPlugins();

export function notify(err: any) {
  plugins.notify.onError({
    title: "Gulp",
    contentImage: null,
    message: "Error: <%= error.message %>",
    sound: false
  } as any)(err);
}

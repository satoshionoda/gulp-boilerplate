import * as gulpLoadPlugins from "gulp-load-plugins";

const plugins = <any>gulpLoadPlugins();

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const notify = (err: any) => {
  plugins.notify.onError({
    title: "Gulp",
    contentImage: null,
    message: "Error: <%= error.message %>",
    sound: false,
  } as any)(err);
};

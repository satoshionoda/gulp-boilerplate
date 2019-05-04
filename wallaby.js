// var babel = require('babel');
var wallabyWebpack = require('wallaby-webpack');

var webpackPostprocessor = wallabyWebpack({});

module.exports = function () {

  return {
    files: [
      {pattern: 'node_modules/jquery/dist/jquery.js', instrument: false},
      {pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js', instrument: false},
      {pattern: 'src/ts/app/**/*.ts', load: false},
      'public_static/**/*.html'
    ],

    tests: [
      {pattern: 'src/ts/test/**/*spec.ts', load: false}
    ],
    debug: true,
    postprocessor: webpackPostprocessor,
    env: {kind: 'chrome'},
    bootstrap: function () {
      jasmine.getFixtures().fixturesPath = 'public_static';
      window.__moduleBundler.loadTests();
    }
  };
};

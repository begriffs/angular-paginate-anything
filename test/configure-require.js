/* global window */

// we get all the test files automatically
var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/spec\.js$/i.test(file)) {
      tests.push(file);
    }
  }
}

require.config({
  paths: {
    angular: '/base/bower_components/angular/angular',
    'angular-resource': '/base/bower_components/angular-resource/angular-resource',
    'angular-mocks': '/base/bower_components/angular-mocks/angular-mocks',
    'jasmine-as-promised': '/base/bower_components/jasmine-as-promised/src/jasmine-as-promised'
  },
  shim: {
    angular: { exports : 'angular' },
    'angular-mocks': {
      deps: ['angular', 'angular-resource'],
      exports: 'angular.mock'
    },
    'angular-resource': {
      deps: ['angular']
    }
  },
  deps: tests,
  callback: window.__karma__.start
});

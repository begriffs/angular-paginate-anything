module.exports = function (grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: [
        '*.js', '*.json', './test/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        commitFiles: ['package.json', 'bower.json'],
        pushTo: 'origin'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-bump');

  // By default, lint and run all tests.
  grunt.task.registerTask('default', ['jshint', 'mochaTest']);
  grunt.task.registerTask('test', ['mochaTest']);
};

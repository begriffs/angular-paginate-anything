module.exports = function (grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: [
        './src/*.js', '*.json', './test/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    karma: {
      travis: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
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

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('test', ['jshint', 'karma:travis']);
};

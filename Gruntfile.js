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
    karma: {
      unit: {
        configFile: 'config/karma.conf.js',
        background: true
      }
    },
    watch: {
      karma: {
        files: ['angular-paginated-resource.js', 'test/**/*.js'],
        tasks: ['karma:unit:run']
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
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('devmode', ['karma:unit', 'watch']);
};

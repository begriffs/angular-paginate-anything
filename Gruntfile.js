module.exports = function (grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: [
        './src/paginate-anything.js', '*.json', './test/*.js'
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
        commitFiles: ['package.json', 'bower.json', 'src/paginate-anything.min.js'],
        pushTo: 'origin'
      }
    },
    uglify: {
      options: {
        banner: '// <%= pkg.name %> - v<%= pkg.version %>\n'
      },
      dist: {
        files: {
          'src/paginate-anything.min.js': ['src/paginate-anything.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('test', ['jshint', 'karma:travis']);
};

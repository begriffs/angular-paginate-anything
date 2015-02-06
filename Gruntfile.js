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
        updateConfigs: ['pkg'],
        commitFiles: ['-a'],
        pushTo: 'origin'
      }
    },
    ngtemplates: {
      options: {
        module: 'bgf.paginateAnything',
        htmlmin: {
          collapseBooleanAttributes:      true,
          collapseWhitespace:             true,
          removeAttributeQuotes:          true,
          removeComments:                 true, // Only if you don't use comment directives!
          removeEmptyAttributes:          true,
          removeRedundantAttributes:      true,
          removeScriptTypeAttributes:     true,
          removeStyleLinkTypeAttributes:  true
        }
      },
      template: {
        src: ['src/*.html'],
        dest: 'tmp/templates.js'
      },
    },
    concat: {
      template: {
        options: {
        },
        src: ['src/paginate-anything.js', '<%= ngtemplates.template.dest %>'],
        dest: 'dist/paginate-anything-tpls.js'
      }
    },
    copy: {
      main : {
        files: [
          {
            src: ['src/paginate-anything.js'], 
            dest: 'dist/paginate-anything.js'
          }
        ]
      },
      template : {
        files: [
          {
            src: ['src/paginate-anything.html'], 
            dest: 'dist/paginate-anything.html'
          }
        ]
      }
    },
    uglify: {
      options: {
        banner: '// <%= pkg.name %> - v<%= pkg.version %>\n'
      },
      dist: {
        files: {
          'dist/paginate-anything.min.js': ['dist/paginate-anything.js'],
          'dist/paginate-anything-tpls.min.js': ['dist/paginate-anything-tpls.js'],
        }
      }
    },
    clean: {
      temp: {
        src: [ 'tmp' ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-angular-templates');

  grunt.registerTask('default', ['test', 'build']);
  grunt.registerTask('test', ['jshint', 'karma:travis']);
  grunt.registerTask('build', ['clean','ngtemplates', 'concat', 'copy', 'uglify']);
  grunt.registerTask('makeRelease', ['bump-only', 'test', 'build', 'bump-commit']);
};

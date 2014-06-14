module.exports = function(grunt) {

  var files = [
    'src/drupal.api.js',
    'src/drupal.entity.js',
    'src/drupal.system.js',
    'src/drupal.node.js',
    'src/drupal.user.js'
  ];

  var buildFiles = ['lib/json2.js'].concat(files);

  // The code to wrap the generated files with.
  var prefix = 'var drupalAPIExports = {};' + "\n";
  prefix += '(function(exports) {' + "\n";

  var suffix = 'exports.drupal = drupal;' + "\n";
  suffix += '})(drupalAPIExports);' + "\n";
  suffix += 'var drupal = drupalAPIExports.drupal;' + "\n";

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js'].concat(files)
    },
    concat: {
      js: {
        options: {
          banner: prefix,
          separator: '',
          footer: suffix
        },
        files: {
          'bin/drupal.api.js': buildFiles
        }
      }
    },
    uglify: {
      build: {
        options: {
          banner: prefix,
          footer: suffix
        },
        files: {
          'bin/drupal.api.min.js': buildFiles
        }
      }
    },
    jsdoc : {
      dist : {
        src: files,
        options: {
          destination: 'doc'
        }
      }
    },
    qunit: {
      all: {
        options: {
          'timeout': 20000,
          '--web-security': 'no',
          urls: [
            'http://localhost:4000/index.html?user=admin&pass=123testing&endpoint=1.3.3.7/api'
          ]
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 4000,
          base: '.'
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'jsdoc', 'connect', 'qunit']);
  grunt.registerTask('test', ['connect', 'qunit']);
};

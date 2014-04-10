module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/* Vivid Layer */',
    // Task configuration.
    concat: {
      dev: {
        src: 'src/*.css',
        dest: 'vividLayer.css'
      }
    },
    cssmin: {
      options: {
        banner: '<%= banner %>'
      },
      minify: {
        expand: true,
        cwd: 'src/',
        src: ['*.css'],
        dest: 'assets/css/pages/',
        ext: '.css'
      }
    },
    watch: {
      update: {
        files: 'static_pages/js/*.js',
        tasks: ['concat'],
        options: {
          event: ['changed']
        },
      },
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['concat']);

};
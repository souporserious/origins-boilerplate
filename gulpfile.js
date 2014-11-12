'use strict';

/**
 * Load Gulp
 */
var gulp = require('gulp');


/**
 * Load Gulp Plugins
 */
var $ = require('gulp-load-plugins')();


/**
 *  Globals Vars
 */
var buildFolder = 'dist',
    serverPort = 9000,
    onError = function(error) {
      $.notify.onError({
        title:    'Error',
        message:  '<%= error.message %>'   
      })(error);
    };


/**
 * Build Styles
 */
gulp.task('styles', function() {

    var processors = [
      require('autoprefixer')({browsers:['last 2 versions', 'ie >= 9']}),
      require('pixrem')
    ];

    return gulp.src('app/styles/main.scss')
          .pipe($.changed('.tmp/styles'))
          .pipe($.plumber({errorHandler: onError}))
          .pipe($.sass({
              precision: 10,
              includePaths: ['app/bower_components/']
          }))
          .pipe($.sourcemaps.init())
          .pipe($.postcss(processors))
          .pipe($.sourcemaps.write())
          .pipe(gulp.dest('.tmp/styles'))
          .pipe($.size());
});


/**
 * Build Scripts
 */
gulp.task('scripts', function() {
    return gulp.src('app/scripts/**/*.js')
          .pipe($.size());
});


/**
 * Put It All Together
 */
gulp.task('html', ['styles', 'scripts'], function() {
    
    var cssFilter = $.filter('**/*.css'),
        jsFilter  = $.filter('**/*.js');

    return gulp.src('app/*.html')
           .pipe($.useref.assets({searchPath: '{.tmp,app}'}))
           .pipe(jsFilter)
           .pipe($.stripDebug())
           .pipe($.uglify())
           .pipe(jsFilter.restore())
           .pipe(cssFilter)
           .pipe($.uncss({
               html: [buildFolder + '/index.html']
           }))
           .pipe($.csso())
           .pipe(cssFilter.restore())
           .pipe($.useref.restore())
           .pipe($.useref())
           .pipe(gulp.dest(buildFolder))
           .pipe($.size());
});


/**
 * Optimize Images
 */
gulp.task('images', function() {
    return gulp.src('app/images/**/*')
        .pipe($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: false
        }))
        .pipe(gulp.dest(buildFolder + '/images'))
        .pipe($.size());
});


/**
 * Build Fonts Folder
 */
gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*')
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe(gulp.dest(buildFolder + '/fonts'))
        .pipe($.size());
});

gulp.task('fontsBower', function() {
    
    var mainBowerFiles = require('main-bower-files');

    return gulp.src(mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten()) // grab all font files from all bower componenets
        .pipe(gulp.dest(buildFolder + '/fonts'))
        .pipe($.size());
});


/**
 * Pipe videos into build folder
 */
gulp.task('videos', function() {
    return gulp.src('app/videos/**/*')
        .pipe(gulp.dest(buildFolder + '/videos'))
        .pipe($.size());
});


/**
 * Grab Any Files like .htaccess, favicons, etc. and include them
 */
gulp.task('extras', function() {
    return gulp.src(['app/*.*', '!app/*.html'], { dot: true })
        .pipe(gulp.dest(buildFolder));
});


/**
 * Rebuild ".tmp" & "Build" folders
 */
gulp.task('clean', function(cb) {

    var del = require('del');

    del(['.tmp', buildFolder], cb);
});


/**
 * Build Deliverable
 */
gulp.task('build', ['clean'], function() {
    gulp.start(['html', 'images', 'fonts', 'fontsBower', 'videos', 'extras']);
});


/**
 * Start LiveReload Server
 */
gulp.task('connect', function() {

    $.connect.server({
        root: 'app',
        port: serverPort,
        livereload: true
    });
});

gulp.task('serve', ['connect', 'styles'], function() {
    require('opn')('http://localhost:' + serverPort);
});


/**
 * Inject Bower Components
 */
gulp.task('wiredep', function () {
    
    var wiredep = require('wiredep').stream;

    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});


/**
 * Start "Watching" Files
 */
gulp.task('default', ['connect', 'serve'], function () {
    
    //var server = $.livereload();

    // watch for changes
    gulp.watch([
        'app/*.html',
        '.tmp/styles/**/*.css',
        'app/scripts/**/*.js',
        'app/images/**/*'
    ]);

    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});
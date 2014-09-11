'use strict';

/**
 * Load Gulp
 */
var gulp = require('gulp');


/**
 * Load Gulp Plugins
 */
var $ = require('gulp-load-plugins')(),
    mainBowerFiles = require('main-bower-files');


/**
 *  Globals Vars
 */
var buildFolder = 'dist',
    liveReloadPort = 35729,
    serverPort = 9000;


/**
 * Build Styles
 */
gulp.task('styles', function() {
    var processors = [
      require('autoprefixer')({browsers:['last 2 versions', 'ie >= 9']}),
      require('pixrem')
    ];

    return gulp.src('app/styles/main.scss')
          .pipe($.rubySass({
              style: 'expanded',
              precision: 10
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
    
    var jsFilter = $.filter('**/*.js'),
        cssFilter = $.filter('**/*.css');

    return gulp.src('app/*.html')
          .pipe($.useref.assets({searchPath: '{.tmp,app}'}))
          .pipe(jsFilter)
          .pipe($.uglify())
          .pipe(jsFilter.restore())
          .pipe(cssFilter)
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
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
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
 * Clean Up Empty Files &/or Folders
 */
gulp.task('clean', function() {
    return gulp.src(['.tmp', buildFolder], { read: false }).pipe($.rimraf());
});


/**
 * Build Deliverable
 */
gulp.task('build', ['html', 'images', 'fonts', 'fontsBower', 'videos', 'extras']);

gulp.task('default', ['clean'], function() {
    gulp.start('build');
});


/**
 * Start LiveReload Server
 */
gulp.task('connect', function() {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: liveReloadPort }))
        .use(connect.static('app'))
        .use(connect.static('.tmp'))
        .use(connect.directory('app'));

    require('http').createServer(app)
        .listen(serverPort)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:' + serverPort);
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
gulp.task('watch', ['connect', 'serve'], function () {
    
    var server = $.livereload();

    // watch for changes

    gulp.watch([
        'app/*.html',
        '.tmp/styles/**/*.css',
        'app/scripts/**/*.js',
        'app/images/**/*'
    ]).on('change', function (file) {
        server.changed(file.path);
    });

    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});
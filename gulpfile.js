let gulp        = require('gulp');
let sass        = require('gulp-sass');
let browserSync = require('browser-sync').create();
let util        = require('gulp-util');
let useref      = require('gulp-useref');
let uglify      = require('gulp-uglify');
let gulpIf      = require('gulp-if');
let cssnano     = require('gulp-cssnano');
let imagemin    = require('gulp-imagemin');
let cache       = require('gulp-cache');
let del         = require('del');
let runSequence = require('run-sequence');


// Converts Sass to CSS with gulp-sass
gulp.task('sass', () => {
    return gulp.src('app/scss/**/*.scss')
      .pipe(sass()) 
      .pipe(gulp.dest('app/css'))
      .pipe(browserSync.reload({
          stream: true
      }))
})


//Reload browser after change
gulp.task('browserSync', () => {
    let files = [
        'app/*.html',
        'app/scss/**/*.scss',
        'app/js/**/*.js'
    ];

    browserSync.init(files, {
        injectChanges: true,
        server: {
            baseDir: "app"
          },
          port: util.env.port || 8080,
          open: true
    });
    gulp.watch('app/scss/**/*.scss', gulp.series(['sass']));
});

// Optimizing images & cache them
gulp.task('images', async () => {
    return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
    .pipe(cache(imagemin({
        interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
});

// Transport fonts into dist folder
gulp.task('fonts', async () => {
    return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
});

//Transform all javascript & css files into one -> main.min.js || main.min.css
gulp.task('useref', async () => {
    return gulp.src('app/*.html')
      .pipe(useref())
      .pipe(gulpIf('*.js', uglify()))
      .pipe(gulpIf('*.css', cssnano()))
      .pipe(gulp.dest('dist'))
});

gulp.task('clean:dist', async () => {
    return del.sync('dist');
});


gulp.task('watch', gulp.series(['sass', 'browserSync']));

gulp.task('build',  gulp.series(['clean:dist', 'sass', 'useref', 'images', 'fonts']));

gulp.task('default', gulp.series(['sass','browserSync', 'watch']));
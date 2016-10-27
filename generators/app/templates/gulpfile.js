const browserify = require('browserify')
const glob = require('glob')
const gulp = require('gulp')
const jsonEditor = require('gulp-json-editor')
const plumber = require('gulp-plumber')
const sass = require('gulp-sass')
const gutil = require('gulp-util')
const path = require('path')
const source = require('vinyl-source-stream')
const watchify = require('watchify')

const pkg = require('./package.json')
const config = require('./.extension.json')

const platforms = glob.sync('platform/*')
  .map(dir => {
    const platform = dir.replace('platform/', '')
    return (platform == 'safari') ? '<%= pkgName %>.safariextension' : platform
  })

gulp.task('copy', () => {
  gulp.src([
    'platform/**/*',
    '!platform/safari',
    '!platform/safari/**/*'
  ]).pipe(gulp.dest('.tmp'))
  gulp.src('platform/safari/**/*').pipe(gulp.dest('.tmp/<%= pkgName %>.safariextension'))
})

gulp.task('build:chromium', () => {
  gulp.src('platform/chromium/manifest.json')
    .pipe(jsonEditor({
      name: config.name,
      version: pkg.version,
      'content_scripts': config['content_scripts'],
      'short_name': pkg.name
    }))
    .pipe(gulp.dest('.tmp/chromium'))
})

gulp.task('build:css', () => {
  const task = gulp.src('src/style/*.scss')
    .pipe(plumber())
    .pipe(sass())
  platforms.forEach(dir => {
    task.pipe(gulp.dest(`.tmp/${dir}`))
  })
})

gulp.task('build:js', () => {
  glob.sync('src/script/*.js')
    .forEach(file => {
      const task = browserify()
        .add(file)
        .transform('babelify')
        .bundle()
        .on('error', e => gutil.log(`${e.name}: ${e.message}`))
      platforms.forEach(dir => {
        task.pipe(gulp.dest(`.tmp/${dir}`))
      })
    })
})

gulp.task('watch:js', () => {
  glob.sync('src/script/*.js')
    .forEach(file => {
      const watch = watchify(browserify())
        .add(file)
        .transform('babelify')
      const basename = path.basename(file)

      function bundle() {
        const task = watch.bundle()
          .on('error', e => gutil.log(`${e.name}: ${e.message}`))
          .pipe(source(basename))
        platforms.forEach(dir => {
          task.pipe(gulp.dest(`.tmp/${dir}`))
        })
      }

      watch.on('update', bundle)
      bundle()
    })
})
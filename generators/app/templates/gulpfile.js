const browserify = require('browserify')
const glob = require('glob')
const gulp = require('gulp')
const ejs = require('gulp-ejs')
const jsonEditor = require('gulp-json-editor')
const plist = require('gulp-plist')
const plumber = require('gulp-plumber')
const sass = require('gulp-sass')
const gutil = require('gulp-util')
const map = require('lodash.map')
const merge = require('lodash.merge')
const path = require('path')
const source = require('vinyl-source-stream')
const watchify = require('watchify')

const pkg = require('./package.json')
const config = require('./.extension.json')

const platforms = glob.sync('platform/*')
  .map(dir => {
    const platform = dir.replace('platform/', '')
    switch (platform) {
      case 'safari':
        return '<%= pkgName %>.safariextension'
      case 'firefox':
        return 'firefox/data'
      default:
        return platform
    }
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
  const scripts = config.content ? config.content.scripts : []
  const constentScripts = map(scripts, (js, runAt) => {
    return {
      js,
      matches: config.content.whitelist,
      'run_at': `document_${runAt}`
    }
  })
  gulp.src('platform/chromium/manifest.json')
    .pipe(jsonEditor({
      name: config.name,
      version: pkg.version,
      'content_scripts': contentScripts,
      'short_name': pkg.name
    }))
    .pipe(gulp.dest('.tmp/chromium'))
})

gulp.task('build:safari', () => {
  gulp.src('platform/safari/Info.plist')
    .pipe(plist({
      CFBundleDisplayName: config.name,
      CFBundleShortVersionString: pkg.version,
      Content: {
        Scripts: {
          Start: config.content.scripts.start,
          End: config.content.scripts.end
        }
      },
      Whitelist: config.content.whitelist
    }))
    .pipe(gulp.dest('.tmp/<%= pkgName %>.safariextension'))
})

gulp.task('build:firefox', () => {
  gulp.src('platform/firefox/package.json')
    .pipe(jsonEditor(json => {
      return merge(pkg, json)
    }))
    .pipe(gulp.dest('.tmp/firefox'))

  gulp.src('platform/firefox/index.ejs')
    .pipe(ejs(config, {ext: '.js'}))
    .pipe(gulp.dest('.tmp/firefox'))
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
      let task = browserify()
        .add(file)
        .transform('babelify')
        .bundle()
        .on('error', e => gutil.log(`${e.name}: ${e.message}`))
        .pipe(source(path.basename(file)))
      platforms.forEach(dir => {
        task = task.pipe(gulp.dest(`.tmp/${dir}`))
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
        let task = watch.bundle()
          .on('error', e => gutil.log(`${e.name}: ${e.message}`))
          .pipe(source(basename))
        platforms.forEach(dir => {
          task = task.pipe(gulp.dest(`.tmp/${dir}`))
        })
      }

      watch.on('update', bundle)
      bundle()
    })
})
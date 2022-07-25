'use strict';

const {src, dest, watch, series, parallel} = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const del = require('del');

const srcDir = 'src';
const buildDir = 'build';

const pugPath = srcDir + '/index.pug';
const sassPath = srcDir + '/scss/*';

const cssDestPath = buildDir + '/css';

const copyPaths = new Map([
  [srcDir + '/css/*',buildDir + '/css'],
  [srcDir + '/fonts/*',buildDir + '/fonts'],
  [srcDir + '/images/*',buildDir + '/images'],
  [srcDir + '/js/*',buildDir + '/js']
]);

function clean(cb) {
  try {
    del('build/**');
  } catch (e) {
    cb(e);
  }
  cb();
}

function pugCompile(cb) {
  try {
    src(pugPath)
    .pipe(pug({pretty:true}))
    .pipe(dest(buildDir));
    cb();
  } catch (e) {
    cb(e);
  }
}

function watchPugCompile(cb) {
  watch(pugPath,
    {ignoreInitial: false},
    parallel(pugCompile));
  cb();
}

function sassCompile(cb) {
  try {
    src(sassPath)
    .pipe(sass().on('error', sass.logError))
    .pipe(dest(cssDestPath));
    cb();
  } catch (e) {
    cb(e);
  }  
}

function watchSassCompile(cb) {
  watch(sassPath,
    {ignoreInitial: false},
    parallel(sassCompile));
  cb();  
}

function startServer(cb) {
  browserSync.init({
    server: {
        baseDir: buildDir
    }
  });
  cb();
}

function syncBrowser(cb) {
  watch(buildDir + "/**")
    .on("all", browserSync.reload);
  cb();
}

function copyDirContent(source, target) {
  src(source)
    .pipe(dest(target));
}

function watchPaths(cb) {
  for (const key of copyPaths.keys()) {
    watch(key,
      {ignoreInitial: false},
      function(cb) {
        copyDirContent(key, copyPaths.get(key));
        cb();
      }
    );
  }
  cb();
}

exports.default =
  series(clean,
    watchPugCompile,
    watchSassCompile,
    watchPaths,
    startServer,
    syncBrowser
  );
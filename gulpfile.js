'use strict';

const {src, dest, watch, series, parallel} = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const del = require('del');

const srcDir = 'src';
const buildDir = 'build';

const pugPath = srcDir + '/index.pug';
const fontSrcPath = srcDir + '/fonts/*';
const imgSrcPath = srcDir + '/images/*';
const sassPath = srcDir + '/scss/*';

const htmlPath = buildDir + '/index.html';
const fontDestPath = buildDir + '/fonts';
const imgDestPath = buildDir + '/images';
const cssPath = buildDir + '/css';

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
    .pipe(dest(cssPath));
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

function copyImages(cb) {
  src(imgSrcPath)
    .pipe(dest(imgDestPath));
  cb();
}

function watchImagesSync(cb) {
  watch(imgSrcPath,
    {ignoreInitial: false},
    copyImages
  );
  cb();
}

function copyFonts(cb) {
  src(fontSrcPath)
    .pipe(dest(fontDestPath));
  cb();
}

function watchFontsSync(cb) {
  watch(fontSrcPath,
    {ignoreInitial: false},
    copyFonts
  );
  cb();
}

exports.default =
  series(clean,
    watchPugCompile,
    watchSassCompile,
    watchImagesSync,
    watchFontsSync,
    startServer,
    syncBrowser
  );
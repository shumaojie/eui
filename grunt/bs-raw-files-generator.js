/*!
 * Bootstrap Grunt task for generating raw-files.min.js for the Customizer
 * http://getbootstrap.com
 * Copyright 2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

/* global btoa: true */

'use strict';
var fs = require('fs');
var btoa = require('btoa');
var glob = require('glob');

function getFiles(type) {
  var files = {};
  var recursive = (type === 'js');
  var globExpr = (recursive ? '/**/*' : '/*');

  glob.sync((type === 'scss' ? 'sass' : type)  + globExpr)
    .filter(function (path) {
      return type === 'fonts' ? true : new RegExp('\\.' + type + '$').test(path);
    })
    .forEach(function (fullPath) {
      var relativePath = fullPath.replace(/^[^/]+\//, '');
      files[relativePath] = (type === 'fonts' ? btoa(fs.readFileSync(fullPath)) : fs.readFileSync(fullPath, 'utf8'));
    });
  return 'var __' + type + ' = ' + JSON.stringify(files) + '\n';
}

module.exports = function generateRawFilesJs(grunt, banner) {
  if (!banner) {
    banner = '';
  }
  var dirs = ['js', 'scss', 'fonts'];
  var files = banner + dirs.map(getFiles).reduce(function (combined, file) {
    return combined + file;
  }, '');
  var rawFilesJs = 'docs/assets/js/raw-files.min.js';
  try {
    fs.writeFileSync(rawFilesJs, files);
  }
  catch (err) {
    grunt.fail.warn(err);
  }
  grunt.log.writeln('File ' + rawFilesJs.cyan + ' created.');
};

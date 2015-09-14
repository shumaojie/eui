/*!
 * Mui Grunt task for namespace generation
 */

/* jshint node: true */
'use strict';
var fs = require('fs');
var grunt = require('grunt');

module.exports = function generateNamespace() {
	var dir = fs.readdirSync('dist/js/');
	var pkg = grunt.file.readJSON('package.json');
	dir.forEach(function(file) {
		if (~file.indexOf('.js') && !~file.indexOf('.min')) {
			var source = fs.readFileSync('dist/js/' + file, 'utf8');
			var name = pkg.namespace;
			source = source.toString().replace(/\$\.className\(([\'|"])([^\'|"]*)[\'|"]\)/g, '$1' + name + '-$2$1')
				.replace(/\$\.classSelector\(([\'|"])([^\'|"]*)[\'|"]\)/g, function(match, p1, p2) {
				return p1 + p2.replace(/\./g, '.' + name + '-') + p1;
			});
			fs.writeFileSync('dist/js/' + file, source);
		}
	});
};

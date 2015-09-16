/*!
 * Eui's Gruntfile
 */

/* jshint node: true */
module.exports = function(grunt) {
	'use strict';

	// Force use of Unix newlines
	grunt.util.linefeed = '\n';

	RegExp.quote = function(string) {
		return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
	};

	var fs = require('fs');
	var path = require('path');

	var generateNamespace = require('./grunt/eui-namespace-generator.js');

	var generateRawFiles = require('./grunt/bs-raw-files-generator.js');

	var pkgs = grunt.file.readJSON('package.json');

	var configBridge = grunt.file.readJSON('./grunt/configBridge.json', { encoding: 'utf8' });

	Object.keys(configBridge.paths).forEach(function (key) {
		configBridge.paths[key].forEach(function (val, i, arr) {
			arr[i] = path.join('./docs/assets', val);
		});
	});

	var configModules = grunt.file.readJSON('./build.json', { encoding: 'utf8' });
	//编译的模块,在package.json中buildModules定义.
	var buildModules = pkgs.modules;
	var buildFiles = [];
	Object.keys(configModules).forEach(function (key) {
		if(buildModules.indexOf(key) != -1){
			var configModule = configModules[key];
			var basePath = configModule["basePath"];
			var modules = configModule["modules"];
			modules.forEach(function(value){
				var filePath = basePath + "/" + value + ".js";
				buildFiles.push(filePath);
			});
		}
	});

	// Project configuration.
	grunt.initConfig({
		pkg: pkgs,

		// Metadata.
		meta: {
			libPath: 'lib/',
			distPath: 'dist/',
			jsPath: 'js/',
			sassPath: 'sass/',
			examplesPath: 'examples/',
			apiPath : 'apidoc',
			ghPages : '_gh_pages/',
			downloadPath : "download/"
		},

		banner: '/*!\n' +
			' * =====================================================\n' +
			' * Eui Framework v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
			' *\n' +
			' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
			' *\n' +
			' * Released under the <%= _.pluck(pkg.licenses, "type").join(",") %> license\n' +
			' *\n' +
			' * last update at : <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n ' +
			' * =====================================================\n' +
			' */\n',

		clean: {
			dist : ['<%= meta.distPath %>'],
			sourceMap: ['<%= meta.distPath %>css/*.map'],
			docs : ['docs/dist/**/eui.*'],
			//examples : ['<%= meta.examplesPath %>**/eui.*'],
            ghPages : ['<%= meta.ghPages %>'],
			sassCache : ['.sass-cache/'],
			apidoc : ['<%= meta.apiPath %>/']
		},

		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners : false
			},
			eui: {
				src: buildFiles,
				dest: '<%= meta.distPath %>js/<%= pkg.name %>.js'
			}
		},

		sass: {
			options: {
				banner: '<%= banner %>',
				style: 'expanded',
				unixNewlines: true
			},
			dist: {
				files: {
					'<%= meta.distPath %>css/<%= pkg.name %>.css': '<%= meta.sassPath %>eui.scss'
				}
			}
		},

		csscomb: {
			options: {
				config: '<%= meta.sassPath %>.csscomb.json'
			},
			dist: {
				files: {
					'<%= meta.distPath %>/css/<%= pkg.name %>.css': '<%= meta.distPath %>/css/<%= pkg.name %>.css'
				}
			}
		},

		copy: {
			fonts: {
				expand: true,
				src: 'fonts/*',
				dest: '<%= meta.distPath %>'
			},
			examples: {
				files : [
					{expand : true,cwd : '<%= meta.distPath %>',src : ["**"],dest : "<%= meta.examplesPath %>hello-eui"},
					{expand : true,cwd : '<%= meta.distPath %>',src : ["**"],dest : "<%= meta.examplesPath %>login"},
					{expand : true,cwd : '<%= meta.distPath %>',src : ["**"],dest : "<%= meta.examplesPath %>application/assets"}
				]
			},
			docs: {
				expand: true,
				cwd: '<%= meta.distPath %>',
				src: ['**'],
				dest: 'docs/dist'
			}
		},

		jekyll: {
			options: {
				config: '_config.yml'
			},
			docs: {
				options : {
					watch : true,
					serve : true
				}
			},
			github: {
				options: {
					raw: 'github: true\n' +
						'baseurl : <%= pkg.repo %>'
				}
			}
		},

		cssmin: {
			options: {
				banner: '', // set to empty; see bellow
				keepSpecialComments: '*', // set to '*' because we already add the banner in sass
				sourceMap: false
			},
			core : {
				src: '<%= meta.distPath %>css/<%= pkg.name %>.css',
				dest: '<%= meta.distPath %>css/<%= pkg.name %>.min.css'
			},
			docs: {
				src: configBridge.paths.docsCss,
				dest: 'docs/assets/css/docs.min.css'
			}
		},

		uglify: {
			options: {
				preserveComments: 'some'
			},
			core : {
				src: '<%= concat.eui.dest %>',
				dest: '<%= meta.distPath %>js/<%= pkg.name %>.min.js'
			},
			docsJs: {
				src: configBridge.paths.docsJs,
				dest: 'docs/assets/js/docs.min.js'
			}
		},

		jshint: {
			options: {
				jshintrc: '<%= meta.jsPath %>.jshintrc'
			},
			grunt: {
				options: {
					jshintrc: 'grunt/.jshintrc'
				},
				src: ['Gruntfile.js', 'grunt/*.js']
			},
			core: {
				src: '<%= meta.jsPath %>/**/*.js'
			}
		},

		jscs: {
			options: {
				config: '<%= meta.jsPath %>.jscsrc'
			},
			grunt: {
				src: '<%= jshint.grunt.src %>'
			},
			core : {
				src: '<%= jshint.src.src %>'
			}
		},

		csslint: {
			options: {
				csslintrc: 'sass/.csslintrc'
			},
			dist : [
				'<%= meta.distPath %>/css/<%= pkg.name %>.css',
			],
			docs: {
				options: {
					ids: false,
					'overqualified-elements': false
				},
				src: 'docs/assets/css/src/docs.css'
			}
		},

		sed: {
			versionNumber: {
				pattern: (function() {
					var old = grunt.option('oldver');
					return old ? RegExp.quote(old) : old;
				})(),
				replacement: grunt.option('newver'),
				recursive: true
			}
		},

		compress: {
			sdk : {
				options: {
					archive: '<%= meta.downloadPath %>v<%= pkg.version %>/<%= pkg.name %>-sdk-<%= pkg.version %>.zip',
					mode: 'zip',
					level: 9,
					pretty: true
				},
				files: [
					{
						expand: true,
						cwd: '<%= meta.distPath %>',
						src: ['**']
					}
				]
			},
			api : {
				options: {
					archive: '<%= meta.downloadPath %>v<%= pkg.version %>/<%= pkg.name %>-api-<%= pkg.version %>.zip',
					mode: 'zip',
					level: 9,
					pretty: true
				},
				files: [
					{
						expand: true,
						cwd: '<%= meta.apiPath %>',
						src: ['**']
					}
				]
			},
			ghPages : {
				options: {
					archive: '<%= meta.downloadPath %>v<%= pkg.version %>/<%= pkg.name %>-gh-pages-<%= pkg.version %>.zip',
					mode: 'zip',
					level: 9,
					pretty: true
				},
				files: [
					{
						expand: true,
						cwd: '<%= meta.ghPages %>',
						src: ['**']
					}
				]
			},
			release : {
				options: {
					archive: '<%= meta.downloadPath %>v<%= pkg.version %>/<%= pkg.name %>-all-<%= pkg.version %>.zip',
					mode: 'zip',
					level: 9,
					pretty: true
				},
				files: [
					{
						expand: true,
						src: ['<%= meta.distPath %>**','<%= meta.examplesPath %>**']
					}
				]
			}
		},

		jsdoc : {
			dist : {
				src: ['<%= concat.eui.src %>','README.md','LICENSE'],
				options: {
					destination: '<%= meta.apiPath %>',
					template : "grunt/jaguarjs-jsdoc",
					configure : "grunt/jaguarjs-jsdoc/conf.json",
					'private': false
				}
			}
		},

		connect: {
			options: {
				port: 9000,
				hostname: '127.0.0.1', //默认就是这个值，可配置为本机某个 IP，localhost 或域名
				livereload: 35729  //声明给 watch 监听的端口
			},

			server: {
				options: {
					open: true, //自动打开网页 http://
					base: [
						'<%= meta.apiPath %>'  //主目录
					]
				}
			}
		},

		watch: {
			options: {
				dateFormat: function(time) {
					grunt.log.writeln('The watch finished in ' + time + 'ms at' + (new Date()).toString());
					grunt.log.writeln('Waiting for more changes...');
				},
				livereload: true
			},
			src : {
				files: '<%= jshint.core.src %>',
				tasks: ['jshint:core','concat']
			},
			sass : {
				files : '<%= meta.sassPath %>/**/*.scss',
				tasks : 'sass'
			},
			doc : {
				files: '<%= jsdoc.dist.src %>',
				tasks: ['jsdoc']
			},
			livereload : {
				options: {
					livereload: '<%=connect.options.livereload%>'  //监听前面声明的端口  35729
				},

				files: [  //下面文件的改变就会实时刷新网页
					'<%= meta.apiPath %>/**'
				]
			}
		}
	});

	// Load the plugins
	require('load-grunt-tasks')(grunt, {
		scope: 'devDependencies'
	});
	require('time-grunt')(grunt);

	grunt.registerTask('test-js', ['jshint:core', 'jshint:grunt', 'jscs:core','jscs:grunt']);

	// Default task(s).
	grunt.registerTask('cleanAll', ['clean']);

	grunt.registerTask('build-namespace', generateNamespace);

	grunt.registerTask('dist-css', ['sass', 'csscomb', 'cssmin:core', 'clean:sourceMap']);
	grunt.registerTask('dist-js', ['concat', 'build-namespace', 'uglify:core']);
	grunt.registerTask('dist', ['clean:apidoc','clean:dist', 'dist-css', 'dist-js','copy:fonts']);

	// Default task.
	grunt.registerTask('default', ['clean','test-js']);

	grunt.registerTask('dist-watch', ['dist','watch']);

	//Watch Apidoc
	grunt.registerTask('api-server',['jsdoc','connect:server','watch:doc','watch:livereload']);

	//Start Jekyll
	grunt.registerTask('doc-server',['jekyll:docs']);

	// Version numbering task.
	// grunt change-version-number --oldver=A.B.C --newver=X.Y.Z
	// This can be overzealous, so its changes should always be manually reviewed!
	grunt.registerTask('change-version-number', 'sed');

	// Docs task.
	grunt.registerTask('docs-css', ['cssmin:docs']);
	grunt.registerTask('lint-docs-css', ['csslint:docs']);
	grunt.registerTask('docs-js', ['uglify:docsJs']);
	grunt.registerTask('docs', ['docs-css', 'docs-js','clean:docs', 'copy:docs','jsdoc']);

	grunt.registerTask('build', ['dist','docs','jekyll:github','jsdoc']);

	grunt.registerTask('release', ['build', 'compress','clean:ghPages','clean:apidoc','clean:sassCache']);

	grunt.event.on('watch', function(action, filepath, target) {
		grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
	});

	grunt.registerTask('build-raw-files', 'Add scripts/sass files to customizer.', function () {
		var banner = grunt.template.process('<%= banner %>');
		generateRawFiles(grunt, banner);
	});
};
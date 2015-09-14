Eui.js
========

  它是一个基于[Zepto.js](http://www.css88.com/doc/zeptojs/)扩展的Javascript开发包，包括了zepto.js的core,ajax,form,
detect,fx,fx_methods,data,selector等模块，充分利用移动设备特性，让APP开发更加迅速，简单。

- `原生JS扩展` : 包括[Array](./Eui.Array.html)、[Date](./Eui.Date.html)、[Function](./Eui.Function.html)、
[JSON](./Eui.JSON.html)、[Number](./Eui.Number.html)、[Object](./Eui.Object.html)、[String](./Eui.String.html)、
[Format](./Eui.util.Format.html)、[HashMap](./Eui.util.HashMap.html).
- `本地数据存储` : 管理应用本地数据存储区，应用内支持跨域操作([Storage](./Eui.Storage.html)).
- `模板解析` : 提供统一的模板解析，基于[tmodjs](https://github.com/aui/tmodjs)构建([Template](./Eui.Template.html)).
- `数据通信` : 支持原生Https方式与AJAX方式灵活切换([Comm](./Eui.Comm.html)).
- `常用工具类` : 提供丰富的常用业务逻辑处理工具类([Extra](./Eui.Extra.html)).


详情介绍可查看官网 [EUI](http://192.168.10.127/docs/eui/).


##如何构建

1. 使用 `git clone` 命令下载项目.
    ```
    $ git clone https://github.com/scm-Q/eui.git
    ```

2. 使用命令 `npm install` 安装package.
    ```
    $ npm install
    ```
    如果你没有安装 npm, 你可以安装[node.js](http://nodejs.org)它已经包含`npm`.

3. 整个项目基于 [grunt](http://www.gruntjs.net/)构建，常用的插件有：clean、compress、concat、connect、copy、sass、
    uglify、watch等，更多插件请访问[npmjs](https://www.npmjs.com/)搜索.

    ```
    $ grunt build
    ```
    - `default` : 清空所有编译的目录及文件，并通过jshint检测核心js的语法.
    - `cleanAll`: 清空所有编译目录及临时文件，包括`dist`、`_gh_pages`、`.sass-cache`、`apidoc`、`*.map`、`eui.*`等.
    - `dist-css` : 编译.scss文件并合并压缩.
    - `dist-js` : 合并js源码，替换命名空间并压缩JS.
    - `dist` : 清空`dist`目录，并执行`dist-css`,`dist-js`任务，并copy SDK到示例项目指定目录.
    - `api-server`: 执行`jsdoc`任务并监听JS变更及时生成API，自动打开默认浏览器查看.
    - `doc-server`: 执行`jekyll`生成静态站点.
    - `build` : 编译源码，生成API文档及静态站点.
    - `release` : 执行`build`任务并打包SDK,API DOC，gh-pages等，完成后并清空临时目录`apidoc`、`gh-pages`等.

  更多构建任务请查看Gruntfile.js。

## [许可](LICENSE)

Copyright (c) 2015 [SCM] & The Core Less Team
Licensed under the [Apache License](LICENSE).

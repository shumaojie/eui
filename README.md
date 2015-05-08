# eui

eui 是一个基于Mui,Zepto.js封装的移动端APP开发平台，可选择Huilder或webstrom做为开发环境，

# 开始

  安装并运行（安装插件）：

```
npm install
```

# gulp-tmod

前端模板预编译工具 [tmodjs](https://github.com/lichunqiang/gulp-tmod) 的gulp自动化插件,执行

```
gulp tmodjs
```

将会把`examples/tpl`目录下的模板预编译到`dist`目录；

# gulp-concat

文件合并插件[concat](https://github.com/wearefractal/gulp-concat),将`src`目录下的源码，合并到`dist/erajs.all.js`

```
gulp concat
```

# 监控模板/源码修改即时编译

> 原tmodjs有配备的watch功能,在gulp中统一使用[watch插件](https://github.com/floatdrop/gulp-watch)来实现,
所以取消了gulp-tmodjs中的watch参数.具体设置方法可以参照下面带watch的配置示例,也可以参考`gulp-watch`官网的说明.

```
gulp watch
```

# 执行自动化测试

```
npm test
```

# 开启8080端口服务访问examples.

```
npm start
```

## License

The MIT license.

# webpack-buildzip-plugin
用于打包后自动化构建压缩包

## 使用方法
```
npm install webpack-buildzip-plugin --save-dev
```
``` javascript
  //webpack配置文件中
   
  const WebpackBuildZipPlugin = require('webpack-buildzip-plugin')

  configureWebpack: {
    plugins: [
      new WebpackBuildZipPlugin({
        filename: 'build.zip', //[非必须] 设置压缩包的文件名，如果不设置，默认为 'output.zip'
        exclude: ['*.map'],   //[非必须] 设置排除文件，按照glob的规则
      })
    ]
  }
```
```
运行npm run build完成后，自动在输出目录中创建压缩包
```

# webpack-buildzip-plugin
> 用于打包后自动化构建压缩包，支持打包后自动上传服务器并解压

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
运行npm run build完成后，自动在输出目录中创建压缩包

## 自动上传服务器并解压
> 自动上传功能是基于sftp，需要填写主机账号密码，为保证安全，可将账号密码存于本地或项目以外，再通过require的方式引入到webpack配置文件

``` javascript

  //webpack配置文件中
  
  new WebpackBuildZipPlugin({
    filename: 'build.zip', //[非必须] 设置压缩包的文件名，如果不设置，默认为 'output.zip'
    exclude: ['*.map'],   //[非必须] 设置排除文件，按照glob的规则
    
    //如需配置自动上传服务器，可加入以下配置，如果不配置sshConfig，则只打包不上传服务器
    
    sshConfig: {
      host: 'ip',
      port: 22,
      username: '用户名',
      password: '密码',
    },
    remotePath: '/www', // 上传到服务器的目标目录
    unzipCommand: `unzip -o -d /www`, // 自定义解压命令
    
  })
```

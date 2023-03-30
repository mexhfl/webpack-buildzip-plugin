const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

class WebpackBuildZipPlugin {
  constructor(options = {}) {
    this.options = options;
    this.exclude = options.exclude || [];
    this.sshConfig = options.sshConfig || null;
    this.remotePath = options.remotePath || '~';
    this.unzipCommand = options.unzipCommand || `unzip -o -d ${this.remotePath}`;
  }
  
  async uploadAndUnzip(archiveName, localPath) {
    return new Promise(async (resolve, reject) => {
      const conn = new Client();
      conn
      .on('ready', () => {
        conn.sftp(async (err, sftp) => {
          if (err) {
            reject(err);
          }
          
          const remotePath = path.join(this.remotePath, archiveName).replace(/\\/g, '/');
          sftp.fastPut(localPath, remotePath, (err) => {
            if (err) {
              reject(err);
            } else {
              console.log(`Uploaded '${archiveName}' to '${remotePath}'`);
              conn.exec(`${this.unzipCommand} ${remotePath}`, (err, stream) => {
                if (err) {
                  reject(err);
                } else {
                  console.log(`Unzipped '${archiveName}' at '${remotePath}'`);
                  stream
                  .on('close', () => {
                    conn.end();
                    resolve();
                  })
                  .on('data', (data) => {
                    console.log('STDOUT: ' + data);
                  })
                  .stderr.on('data', (data) => {
                    console.log('STDERR: ' + data);
                  });
                }
              });
            }
          });
        });
      })
      .connect(this.sshConfig);
    });
  }
  
  apply(compiler) {
    // 在 'done' 钩子里注册回调函数
    compiler.hooks.done.tapAsync('WebpackBuildZipPlugin', async (stats, callback) => {
      const { path: outputPath } = stats.compilation.options.output;
      const archiveName = this.options.filename || 'output.zip';
      // 创建一个文件以保存压缩包
      const output = fs.createWriteStream(path.join(outputPath, archiveName));
      const archive = archiver('zip', {
        zlib: { level: 9 }, // 设置压缩级别
      });
      
      // 监听压缩过程中的错误
      archive.on('error', (err) => {
        throw err;
      });
      
      // 将压缩包内容写入文件
      archive.pipe(output);
      
      // 使用 'exclude' 选项来过滤文件，并将符合条件的文件添加到压缩包中
      archive.glob('**/*', {
        cwd: outputPath,
        ignore: this.exclude,
      });
      
      // 将构建输出目录中的所有文件添加到压缩包中
      // archive.directory(outputPath, false);
      
      // 完成压缩包的创建
      archive.finalize();
      
      // 监听 'close' 事件，以确保压缩完成后再调用回调函数
      output.on('close', async () => {
        console.log(`Created '${archiveName}' in '${outputPath}'`);
        
        if (this.sshConfig) {
          try {
            await this.uploadAndUnzip(archiveName, path.join(outputPath, archiveName));
          } catch (err) {
            console.error('Error uploading or unzipping the file:', err);
          }
        }
        callback();
      });
    });
  }
}

module.exports = WebpackBuildZipPlugin;
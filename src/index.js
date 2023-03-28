const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

class WebpackBuildZipPlugin {
    constructor(options = {}) {
        this.options = options;
        this.exclude = options.exclude || [];
    }

    apply(compiler) {
        // 在 'done' 钩子里注册回调函数
        compiler.hooks.done.tapAsync('WebpackBuildZipPlugin', async (stats, callback) => {
            const {path: outputPath} = stats.compilation.options.output;
            const archiveName = this.options.filename || 'output.zip';
            // 创建一个文件以保存压缩包
            const output = fs.createWriteStream(path.join(outputPath, archiveName));
            const archive = archiver('zip', {
                zlib: {level: 9}, // 设置压缩级别
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
            output.on('close', () => {
                console.log(`Build '${archiveName}' in '${outputPath}'`);
                callback();
            });
        });
    }
}

module.exports = WebpackBuildZipPlugin;


var walkSync = function (dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
};

var filelist = []
filelist = walkSync("ru/", filelist).filter(filename => filename.endsWith(".md"))

var extract = require('md2xliff').extract
var fs = require('fs')
var path = require('path')
if (fs.existsSync("skeletons")) {
    fs.rmdirSync("skeletons", { recursive: true })
}
fs.mkdirSync("skeletons")

if (fs.existsSync("xliff")) {
    fs.rmdirSync("xliff", { recursive: true, })
}
fs.mkdirSync("xliff")


filelist.forEach(filename => {
    var file = fs.readFileSync(filename, 'utf8')
    var result = extract(file, filename)
    var paths = result.data.markdownFileName.split("/")
    fs.writeFileSync("skeletons/" + result.data.skeletonFilename.replace(/\//gm, "_").replace(/\\/gm, "_"), result.skeleton)
    fs.writeFileSync("xliff/" + result.data.markdownFileName.replace(/\//gm, "_").replace(/\\/gm, "_").replace(".md", ".xlf"), result.xliff)
})

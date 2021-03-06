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

var reconstruct = require('md2xliff').xliffReconstruct
var fs = require('fs')

var Skeletonfilelist = []
Skeletonfilelist = walkSync("skeletons/", Skeletonfilelist).filter(filename => filename.endsWith("skl.md"))

process.argv.slice(2).forEach((targetLang) => {
    var XliffFileList = []
    XliffFileList = walkSync(`${targetLang}_xliff/`, XliffFileList).filter(
        (filename, index) => {
            let skeletonFilename = Skeletonfilelist[index]
            return filename.endsWith(".xlf")
        }
    )
    if (fs.existsSync(`${targetLang}_reconstructed`)) {
        fs.rmdirSync(`${targetLang}_reconstructed`, { recursive: true })
    }
    fs.mkdirSync(`${targetLang}_reconstructed`)

    Skeletonfilelist.forEach((skeletonFile, index) => {
        let xliffFile = XliffFileList[index]
        let skeleton = fs.readFileSync(skeletonFile, "utf8")
        let xliff = fs.readFileSync(xliffFile, "utf8")
        let nameItems = skeletonFile.substring(10).split("_")
        let folder = nameItems[1]
        if (!fs.existsSync(`${targetLang}_reconstructed/${folder}`)) {
            fs.mkdirSync(`${targetLang}_reconstructed/${folder}`)
        }
        let name = nameItems[2].split(".skl.").join(".")
        let result = reconstruct(xliff, skeleton, function (err, translatedMd) {
            if (err) throw new Error(err);
            fs.writeFileSync(`${targetLang}_reconstructed/${folder}/` + name, translatedMd)
        })
    });
})



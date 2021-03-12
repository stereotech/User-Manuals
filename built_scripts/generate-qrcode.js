var QRCode = require('qrcode'), fs = require('fs'), path = require('path');
var svgjs = require('@svgdotjs/svg.js'), SVG = svgjs.SVG;
var jsontoFileList = function (file, inputFolder) {
    var result = [];
    json = JSON.parse(fs.readFileSync(file));
    var menu = json[0];
    var namePrefix = menu.title + '-';
    menu.links.forEach(function (link) {
        var key = "/" + inputFolder + link.to;
        var prefixWithLink = namePrefix + link.name.replace('/', '_');
        result.push({ key: key, name: prefixWithLink });
        prefixWithLink = prefixWithLink + '-';
        link.contents.forEach(function (content) {
            var key = "/" + inputFolder + link.to + content.to;
            result.push({ key: key, name: prefixWithLink + content.name.replace('/', '_') });
        });
    });
    return result;
};
var generateQrCode = function (inputFolder, prefix) {
    var filelist = [];
    filelist = jsontoFileList("ru/" + inputFolder + "/menu.json", inputFolder);
    filelist.forEach(function (file) {
        var filepath = path.join('qrcode', file.name + '.svg');
        QRCode.toFile(filepath, prefix + file.key, {
            type: 'svg'
        });
    });
};
var cleanup = function () {
    var qrcodeDir = 'qrcode/';
    if (fs.existsSync(qrcodeDir)) {
        files = fs.readdirSync(path.resolve(qrcodeDir));
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            fs.unlinkSync(path.join(qrcodeDir, file));
        }
        fs.rmdirSync(qrcodeDir, { recursive: true });
    }
    fs.mkdirSync(qrcodeDir);
};
var generateQrCodes = function () {
    fs.readdirSync('ru', { withFileTypes: true })
        .filter(function (dirent) { return dirent.isDirectory(); })
        .forEach(function (dir_path) {
        generateQrCode(dir_path.name, 'w-d-stereotech---');
    });
};
cleanup();
generateQrCodes();
//# sourceMappingURL=generate-qrcode.js.map
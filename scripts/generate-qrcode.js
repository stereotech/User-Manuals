var QRCode = require('qrcode'),
    fs = require('fs'),
    path = require('path')

var svgjs = require('@svgdotjs/svg.js'),
    SVG = svgjs.SVG


var jsontoFileList = function (file, inputFolder) {
    let result = []
    json = JSON.parse(fs.readFileSync(file))
    let menu = json[0]
    let namePrefix = menu.title + '-'
    menu.links.forEach(link => {
        let key = `/${inputFolder}${link.to}`
        let prefixWithLink = namePrefix + link.name.replace('/', '_')
        result.push({ key, name: prefixWithLink })
        prefixWithLink = prefixWithLink + '-'
        link.contents.forEach(content => {
            let key = `/${inputFolder}${link.to}${content.to}`
            result.push({ key, name: prefixWithLink + content.name.replace('/', '_') })
        });
    });
    return result
}

var generateQrCode = function (inputFolder, prefix) {
    var filelist = []
    filelist = jsontoFileList(`ru/${inputFolder}/menu.json`, inputFolder)
    filelist.forEach(file => {
        let filepath = path.join('qrcode', file.name + '.svg')
        QRCode.toFile(filepath, prefix + file.key, {
            type: 'svg'
        })
    })
}

var cleanup = () => {
    let qrcodeDir = 'qrcode/'
    if (fs.existsSync(qrcodeDir)) {
        files = fs.readdirSync(path.resolve(qrcodeDir))
        for (const file of files) {
            fs.unlinkSync(path.join(qrcodeDir, file))
        }
        fs.rmdirSync(qrcodeDir, { recursive: true })

    }
    fs.mkdirSync(qrcodeDir)
}

var generateQrCodes = function () {
    fs.readdirSync('ru', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .forEach(dir_path => {
            generateQrCode(dir_path.name, 'w-d-stereotech---')
        })
}

cleanup()

generateQrCodes()



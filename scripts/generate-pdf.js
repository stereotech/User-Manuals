var fs = require('fs'),
    path = require('path'),
    through = require('through2'),
    cheerio = require('cheerio'),
    markdownPdf = require('markdown-pdf');

var preProcessHtml = function (basePath) {
    return function () {
        return through(function (chunk, encoding, callback) {
            var $ = cheerio.load(chunk);
            $('img[src]').each(function () {
                var imagePath = $(this).attr('src');
                imagePath = path.join(basePath, "static", imagePath);
                $(this).attr('src', 'file://' + (process.platform === 'win32' ? '/' : '') + imagePath);
            });

            this.push($.html())
            callback();
        });
    }
};


function preProcessMd() {
    return through((data, enc, cb) => {
        let nd = data.toString()
            .replace(/^---\n/s, "")
            .replace(/title: (.{0,})/g, "# $1")
            .replace(/description: (.{0,})/g, "")
        let pageBreak = '\n\n<div style="display: block; page-break-before: always; break-before: always;"></div>\n\n'
        nd += pageBreak
        cb(null, Buffer.from(nd))
    });
}

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

var jsonToMd = function (jsonPath, outputPath) {
    json = JSON.parse(fs.readFileSync(jsonPath))

    let output = '---\ntitle: Оглавление\n---\n\n'
    let menu = json[0]
    menu.links.forEach(link => {
        output += '- ### ' + link.name + '\n'
        link.contents.forEach(content => {
            output += '  - #### ' + content.name + '\n'
        });
    });

    fs.writeFileSync(outputPath, output)
}

var generatePdf = (inputFolder, outputName, lang) => {
    var filelist = []

    jsonToMd(`${lang}/${inputFolder}/menu.json`, `${lang}/${inputFolder}/!toc.md`)

    filelist = walkSync(`${lang}/${inputFolder}`, filelist).filter(filename => filename.endsWith(".md"))

    var basePath = path.resolve('.');
    markdownPdf({
        runningsPath: path.join(__dirname, 'runnings.js'),
        preProcessMd: preProcessMd,
        preProcessHtml: preProcessHtml(basePath),
        cssPath: path.join(__dirname, 'pdf.css'),
        paperBorder: '1cm',
        remarkable: {
            html: true
        }
    }).concat.from([
        ...filelist
    ]).to(path.resolve(`pdf/${outputName}.pdf`), function () {
        console.log(`${outputName}.pdf  is created.`);
    });

}

var cleanup = () => {
    let pdfDir = 'pdf/'
    if (fs.existsSync(pdfDir)) {
        files = fs.readdirSync(path.resolve(pdfDir))
        for (const file of files) {
            fs.unlinkSync(path.join(pdfDir, file))
        }
        fs.rmdirSync(pdfDir, { recursive: true })

    }
    fs.mkdirSync(pdfDir)
}

var generatePdfs = function () {
    fs.readdirSync('ru', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .forEach(dir_path => {
            generatePdf(dir_path.name, `${dir_path.name}_ru`, 'ru')
        })

    fs.readdirSync('en', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .forEach(dir_path => {
            generatePdf(dir_path.name, `${dir_path.name}_en`, 'en')
        })
}

cleanup()

generatePdfs()

//generatePdf('ste320', 'STE320_ru')
//generatePdf('steapp', 'STEApp_ru')
//generatePdf('steslicer', 'STESlicer_ru')
//generatePdf('steos', 'STEOS_ru')
//generatePdf('printblock', 'PrintBlock_ru')
//generatePdf('instructions', 'instructions_ru')
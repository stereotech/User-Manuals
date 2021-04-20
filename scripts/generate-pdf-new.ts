import { statSync, readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync, rmdirSync, mkdirSync } from 'fs';
import { resolve, join } from 'path'
import { mdToPdf } from 'md-to-pdf';
import { URL } from 'url';

var walkSync = function (dir: string, filelist: string[]) {
    let files = readdirSync(dir);
    files.forEach(function (file) {
        if (statSync(join(dir, file)).isDirectory()) {
            filelist = walkSync(join(dir, file), filelist);
        }
        else {
            filelist.push(join(dir, file));
        }
    });
    return filelist;
};

var jsonToMd = function (jsonPath: string, outputPath: string) {
    let json = JSON.parse(readFileSync(jsonPath).toString())

    let output = ' # Оглавление\n\n'
    let menu = json[0]
    menu.links.forEach((link: { name: string; contents: any[]; }) => {
        output += '- ### ' + link.name + '\n'
        link.contents.forEach(content => {
            output += '  - #### ' + content.name + '\n'
        });
    });

    writeFileSync(outputPath, output)
}

var generatePdf = async (inputFolder: string, outputName: string, lang: string) => {
    var filelist: string[] = []

    jsonToMd(`${lang}/${inputFolder}/menu.json`, `${lang}/${inputFolder}/!toc.md`)

    filelist = walkSync(`${lang}/${inputFolder}`, filelist).filter(filename => filename.endsWith(".md"))

    var basePath = resolve('.');

    let combined_md: string = '';
    filelist.forEach((filePath, index) => {
        let md_content = readFileSync(filePath).toString();
        if (index > 1) {
            const regex = /---\r\ntitle: ([a-zA-Z0-9_а-яА-Я \–\-\"]*)\r\ndescription: [a-zA-Z0-9_а-яА-Я \–\-\"]*\r\n---/m;
            const subst = ` # $1`;
            const match = regex.test(md_content)
            md_content = md_content.replace('---', '')
            md_content = md_content.replace(/title: ([a-zA-Z0-9_а-яА-Я \–\-\"]*)/, ' # $1')
            md_content = md_content.replace(/description: [a-zA-Z0-9_а-яА-Я \–\-\"]*/, '')
            //md_content = md_content.replace(regex, subst)
        }
        //add page break
        if (index < filelist.length - 1) {
            md_content += '<div class="page-break"></div>\r\n\r\n'
        }
        combined_md += md_content;
    })

    let pdf = await mdToPdf({ content: combined_md }, {
        basedir: './static/',
        css: './scripts/pdf.css',
        pdf_options: {
            displayHeaderFooter: true,
            headerTemplate: `<div style="position: relative; top: 0px; left: 0px; width: 100%; margin: -5px 30px 0px; padding: 0px 0px 1px; font-size: 9px; font-family: Roboto, Arial, sans-serif;">
            <div style="top: 0px; left: 0px; width: 200px; height: 30px; margin: 0px; padding: 0px">
                <?xml version="1.0" encoding="UTF-8"?>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="99pt" height="26pt" viewBox="0 0 99 26" version="1.1">
                <g id="surface1">
                <path style="fill-rule:evenodd;fill:rgb(100%,100%,100%);fill-opacity:1;stroke-width:86.8;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,45.882353%,74.509804%);stroke-opacity:1;stroke-miterlimit:22.9256;" d="M 2125.965667 43.306321 C 3277.071191 43.306321 4209.519834 976.360689 4209.519834 2126.602817 C 4209.519834 3276.844946 3277.071191 4209.899314 2125.965667 4209.899314 C 976.189364 4209.899314 43.740721 3276.844946 43.740721 2126.602817 C 43.740721 976.360689 976.189364 43.306321 2125.965667 43.306321 Z M 2125.965667 43.306321 " transform="matrix(0.0058775,0,0,0.00595323,0.00463258,0)"/>
                <path style=" stroke:none;fill-rule:evenodd;fill:rgb(76.078431%,76.078431%,76.078431%);fill-opacity:1;" d="M 1.53125 14.171875 C 1.695312 14.710938 3.011719 15.285156 4.347656 15.863281 L 16.445312 21.050781 L 10.882812 17.289062 C 9.015625 16.027344 7.167969 14.785156 7.53125 13.507812 C 7.898438 12.246094 10.476562 10.949219 13.0625 9.648438 C 13.480469 9.445312 13.644531 8.945312 13.445312 8.539062 C 13.246094 8.132812 12.75 7.960938 12.34375 8.164062 L 10.847656 8.90625 L 4.347656 12.171875 C 2.351562 13.15625 1.367188 13.65625 1.53125 14.171875 Z M 1.53125 14.171875 "/>
                <path style=" stroke:none;fill-rule:evenodd;fill:rgb(0%,45.882353%,74.509804%);fill-opacity:1;" d="M 17.140625 1.863281 C 16.613281 1.75 15.457031 2.625 14.304688 3.496094 L 3.816406 11.503906 L 9.820312 8.519531 C 11.816406 7.515625 13.808594 6.519531 14.730469 7.480469 C 15.621094 8.425781 15.4375 11.339844 15.253906 14.25 C 15.222656 14.710938 15.566406 15.101562 16.007812 15.136719 C 16.464844 15.175781 16.847656 14.824219 16.886719 14.359375 L 17 12.671875 L 17.472656 5.347656 C 17.617188 3.085938 17.6875 1.972656 17.140625 1.863281 Z M 17.140625 1.863281 "/>
                <path style=" stroke:none;fill-rule:evenodd;fill:rgb(9.803922%,10.588235%,21.960784%);fill-opacity:1;" d="M 19.871094 21.71875 C 20.234375 21.3125 20.070312 19.863281 19.890625 18.417969 L 18.277344 5.21875 L 17.855469 11.96875 C 17.710938 14.230469 17.5625 16.46875 16.28125 16.789062 C 15.019531 17.105469 12.621094 15.488281 10.226562 13.859375 C 9.839844 13.617188 9.34375 13.707031 9.089844 14.101562 C 8.832031 14.46875 8.941406 14.988281 9.308594 15.246094 L 10.703125 16.191406 L 16.738281 20.273438 C 18.589844 21.515625 19.503906 22.148438 19.871094 21.71875 Z M 19.871094 21.71875 "/>
                <path style=" stroke:none;fill-rule:nonzero;fill:rgb(9.803922%,10.588235%,21.960784%);fill-opacity:1;" d="M 34.382812 15.382812 C 34.382812 14.929688 34.222656 14.578125 33.902344 14.332031 C 33.578125 14.085938 32.992188 13.839844 32.148438 13.582031 C 31.308594 13.332031 30.632812 13.054688 30.132812 12.742188 C 29.183594 12.152344 28.703125 11.375 28.703125 10.417969 C 28.703125 9.585938 29.046875 8.894531 29.738281 8.355469 C 30.425781 7.8125 31.316406 7.539062 32.414062 7.539062 C 33.140625 7.539062 33.792969 7.675781 34.363281 7.9375 C 34.929688 8.207031 35.382812 8.585938 35.703125 9.078125 C 36.03125 9.566406 36.195312 10.113281 36.195312 10.710938 L 34.382812 10.710938 C 34.382812 10.167969 34.214844 9.75 33.871094 9.445312 C 33.527344 9.140625 33.039062 8.984375 32.402344 8.984375 C 31.808594 8.984375 31.34375 9.113281 31.015625 9.363281 C 30.6875 9.613281 30.523438 9.960938 30.523438 10.414062 C 30.523438 10.792969 30.699219 11.113281 31.054688 11.363281 C 31.410156 11.617188 31.996094 11.859375 32.808594 12.101562 C 33.625 12.339844 34.277344 12.613281 34.769531 12.917969 C 35.265625 13.226562 35.628906 13.582031 35.855469 13.976562 C 36.089844 14.375 36.203125 14.839844 36.203125 15.371094 C 36.203125 16.234375 35.867188 16.921875 35.203125 17.4375 C 34.535156 17.945312 33.625 18.199219 32.476562 18.199219 C 31.722656 18.199219 31.023438 18.0625 30.386719 17.785156 C 29.753906 17.507812 29.261719 17.125 28.910156 16.632812 C 28.558594 16.144531 28.378906 15.574219 28.378906 14.921875 L 30.203125 14.921875 C 30.203125 15.511719 30.398438 15.964844 30.789062 16.289062 C 31.179688 16.613281 31.746094 16.769531 32.476562 16.769531 C 33.109375 16.769531 33.585938 16.648438 33.90625 16.394531 C 34.226562 16.140625 34.382812 15.800781 34.382812 15.382812 Z M 39.820312 8.488281 L 39.820312 10.355469 L 41.191406 10.355469 L 41.191406 11.640625 L 39.820312 11.640625 L 39.820312 15.9375 C 39.820312 16.234375 39.878906 16.445312 40 16.578125 C 40.113281 16.703125 40.324219 16.769531 40.625 16.769531 C 40.828125 16.769531 41.027344 16.746094 41.234375 16.699219 L 41.234375 18.039062 C 40.839844 18.152344 40.457031 18.199219 40.085938 18.199219 C 38.746094 18.199219 38.074219 17.464844 38.074219 16.003906 L 38.074219 11.640625 L 36.796875 11.640625 L 36.796875 10.355469 L 38.074219 10.355469 L 38.074219 8.488281 Z M 45.949219 18.199219 C 44.847656 18.199219 43.945312 17.855469 43.257812 17.164062 C 42.574219 16.472656 42.226562 15.554688 42.226562 14.40625 L 42.226562 14.1875 C 42.226562 13.421875 42.375 12.734375 42.675781 12.128906 C 42.976562 11.527344 43.394531 11.054688 43.9375 10.714844 C 44.480469 10.378906 45.078125 10.210938 45.75 10.210938 C 46.808594 10.210938 47.625 10.546875 48.203125 11.214844 C 48.78125 11.890625 49.066406 12.835938 49.066406 14.0625 L 49.066406 14.761719 L 43.984375 14.761719 C 44.042969 15.394531 44.253906 15.894531 44.628906 16.261719 C 45.007812 16.632812 45.484375 16.816406 46.050781 16.816406 C 46.851562 16.816406 47.503906 16.496094 48.007812 15.859375 L 48.949219 16.746094 C 48.636719 17.207031 48.21875 17.566406 47.699219 17.820312 C 47.179688 18.078125 46.597656 18.199219 45.949219 18.199219 Z M 45.742188 11.597656 C 45.261719 11.597656 44.875 11.761719 44.578125 12.097656 C 44.285156 12.429688 44.097656 12.898438 44.015625 13.492188 L 47.34375 13.492188 L 47.34375 13.363281 C 47.304688 12.78125 47.148438 12.339844 46.875 12.042969 C 46.605469 11.742188 46.226562 11.597656 45.742188 11.597656 Z M 54.5 11.925781 C 54.265625 11.894531 54.03125 11.875 53.789062 11.875 C 52.988281 11.875 52.445312 12.175781 52.171875 12.785156 L 52.171875 18.058594 L 50.421875 18.058594 L 50.421875 10.355469 L 52.089844 10.355469 L 52.132812 11.210938 C 52.558594 10.546875 53.140625 10.210938 53.890625 10.210938 C 54.136719 10.210938 54.34375 10.242188 54.507812 10.308594 Z M 58.894531 18.199219 C 57.785156 18.199219 56.886719 17.855469 56.199219 17.164062 C 55.511719 16.472656 55.167969 15.554688 55.167969 14.40625 L 55.167969 14.1875 C 55.167969 13.421875 55.316406 12.734375 55.621094 12.128906 C 55.917969 11.527344 56.335938 11.054688 56.882812 10.714844 C 57.421875 10.378906 58.023438 10.210938 58.691406 10.210938 C 59.75 10.210938 60.566406 10.546875 61.148438 11.214844 C 61.726562 11.890625 62.011719 12.835938 62.011719 14.0625 L 62.011719 14.761719 L 56.929688 14.761719 C 56.980469 15.394531 57.199219 15.894531 57.574219 16.261719 C 57.949219 16.632812 58.421875 16.816406 58.996094 16.816406 C 59.792969 16.816406 60.445312 16.496094 60.949219 15.859375 L 61.890625 16.746094 C 61.582031 17.207031 61.160156 17.566406 60.644531 17.820312 C 60.121094 18.078125 59.539062 18.199219 58.894531 18.199219 Z M 58.683594 11.597656 C 58.203125 11.597656 57.816406 11.761719 57.523438 12.097656 C 57.226562 12.429688 57.042969 12.898438 56.960938 13.492188 L 60.289062 13.492188 L 60.289062 13.363281 C 60.25 12.78125 60.089844 12.339844 59.820312 12.042969 C 59.542969 11.742188 59.167969 11.597656 58.683594 11.597656 Z M 63.035156 14.136719 C 63.035156 13.378906 63.1875 12.699219 63.488281 12.09375 C 63.789062 11.488281 64.210938 11.023438 64.761719 10.699219 C 65.308594 10.375 65.933594 10.210938 66.640625 10.210938 C 67.695312 10.210938 68.546875 10.546875 69.203125 11.210938 C 69.851562 11.886719 70.207031 12.773438 70.261719 13.878906 L 70.269531 14.28125 C 70.269531 15.042969 70.121094 15.722656 69.828125 16.320312 C 69.53125 16.917969 69.109375 17.382812 68.5625 17.710938 C 68.011719 18.039062 67.378906 18.199219 66.660156 18.199219 C 65.5625 18.199219 64.683594 17.839844 64.023438 17.117188 C 63.363281 16.394531 63.035156 15.425781 63.035156 14.21875 Z M 64.78125 14.28125 C 64.78125 15.074219 64.949219 15.691406 65.277344 16.144531 C 65.609375 16.59375 66.070312 16.816406 66.660156 16.816406 C 67.25 16.816406 67.710938 16.585938 68.035156 16.132812 C 68.367188 15.675781 68.527344 15.011719 68.527344 14.132812 C 68.527344 13.351562 68.359375 12.734375 68.023438 12.277344 C 67.6875 11.824219 67.226562 11.597656 66.640625 11.597656 C 66.074219 11.597656 65.621094 11.820312 65.289062 12.269531 C 64.953125 12.71875 64.78125 13.386719 64.78125 14.28125 Z M 64.78125 14.28125 "/>
                <path style=" stroke:none;fill-rule:nonzero;fill:rgb(0%,45.882353%,74.509804%);fill-opacity:1;" d="M 73.941406 8.488281 L 73.941406 10.355469 L 75.316406 10.355469 L 75.316406 11.640625 L 73.941406 11.640625 L 73.941406 15.9375 C 73.941406 16.234375 74.003906 16.445312 74.121094 16.578125 C 74.234375 16.703125 74.445312 16.769531 74.746094 16.769531 C 74.949219 16.769531 75.152344 16.746094 75.355469 16.699219 L 75.355469 18.039062 C 74.960938 18.152344 74.578125 18.199219 74.207031 18.199219 C 72.867188 18.199219 72.195312 17.464844 72.195312 16.003906 L 72.195312 11.640625 L 70.917969 11.640625 L 70.917969 10.355469 L 72.195312 10.355469 L 72.195312 8.488281 Z M 80.070312 18.199219 C 78.96875 18.199219 78.070312 17.855469 77.378906 17.164062 C 76.695312 16.472656 76.347656 15.554688 76.347656 14.40625 L 76.347656 14.1875 C 76.347656 13.421875 76.496094 12.734375 76.796875 12.128906 C 77.101562 11.527344 77.515625 11.054688 78.058594 10.714844 C 78.601562 10.378906 79.199219 10.210938 79.871094 10.210938 C 80.929688 10.210938 81.75 10.546875 82.324219 11.214844 C 82.90625 11.890625 83.191406 12.835938 83.191406 14.0625 L 83.191406 14.761719 L 78.105469 14.761719 C 78.164062 15.394531 78.378906 15.894531 78.75 16.261719 C 79.128906 16.632812 79.605469 16.816406 80.171875 16.816406 C 80.972656 16.816406 81.625 16.496094 82.128906 15.859375 L 83.070312 16.746094 C 82.757812 17.207031 82.339844 17.566406 81.820312 17.820312 C 81.300781 18.078125 80.722656 18.199219 80.070312 18.199219 Z M 79.863281 11.597656 C 79.382812 11.597656 78.996094 11.761719 78.703125 12.097656 C 78.40625 12.429688 78.21875 12.898438 78.136719 13.492188 L 81.464844 13.492188 L 81.464844 13.363281 C 81.429688 12.78125 81.273438 12.339844 80.996094 12.042969 C 80.726562 11.742188 80.347656 11.597656 79.863281 11.597656 Z M 87.738281 16.816406 C 88.171875 16.816406 88.539062 16.6875 88.824219 16.4375 C 89.109375 16.1875 89.265625 15.878906 89.28125 15.507812 L 90.929688 15.507812 C 90.914062 15.988281 90.757812 16.4375 90.476562 16.855469 C 90.195312 17.269531 89.8125 17.597656 89.328125 17.839844 C 88.84375 18.082031 88.320312 18.199219 87.757812 18.199219 C 86.671875 18.199219 85.804688 17.855469 85.171875 17.15625 C 84.53125 16.457031 84.214844 15.492188 84.214844 14.261719 L 84.214844 14.085938 C 84.214844 12.914062 84.53125 11.96875 85.160156 11.269531 C 85.796875 10.5625 86.660156 10.210938 87.75 10.210938 C 88.675781 10.210938 89.433594 10.476562 90.011719 11.011719 C 90.59375 11.546875 90.902344 12.246094 90.929688 13.121094 L 89.28125 13.121094 C 89.265625 12.671875 89.113281 12.3125 88.824219 12.023438 C 88.542969 11.738281 88.179688 11.597656 87.738281 11.597656 C 87.171875 11.597656 86.734375 11.800781 86.429688 12.203125 C 86.121094 12.613281 85.964844 13.226562 85.964844 14.050781 L 85.964844 14.328125 C 85.964844 15.164062 86.113281 15.789062 86.417969 16.195312 C 86.722656 16.609375 87.160156 16.816406 87.738281 16.816406 Z M 93.976562 11.191406 C 94.542969 10.535156 95.265625 10.210938 96.136719 10.210938 C 97.792969 10.210938 98.636719 11.148438 98.664062 13.023438 L 98.664062 18.058594 L 96.917969 18.058594 L 96.917969 13.085938 C 96.917969 12.554688 96.796875 12.175781 96.566406 11.953125 C 96.332031 11.734375 95.988281 11.625 95.542969 11.625 C 94.839844 11.625 94.320312 11.933594 93.976562 12.550781 L 93.976562 18.058594 L 92.230469 18.058594 L 92.230469 7.121094 L 93.976562 7.121094 Z M 93.976562 11.191406 "/>
                </g>
                </svg>
            </div></div>`,
            footerTemplate: `<div style="position: relative; width: 100%; border-top: 1px solid black; margin: 0px 30px 25px; padding: 1px, 0px, 0px; font-size: 9px; font-family: Roboto, Arial, sans-serif;">
                <div style="position: absolute; top: 5px; left: 0px; text-align: left;">
                <span class="title"></span></div>
                <div style="position: absolute; top: 5px; width: 100%; text-align: center;">
                <span class="pageNumber"></span> / <span class="totalPages"></span></div>
                <div style="position: absolute; top: 5px; right: 0px; text-align: right;">Stereotech LLC.</div></div>`,
            margin: {
                top: "60px",
                bottom: "60px",
                right: "30px",
                left: "30px"
            }
        }
    })
    if (pdf) {
        writeFileSync(`pdf_new/${outputName}.pdf`, pdf.content);
    }

}

var cleanup = () => {
    let pdfDir = 'pdf_new/'
    if (existsSync(pdfDir)) {
        let files = readdirSync(resolve(pdfDir))
        for (const file of files) {
            unlinkSync(join(pdfDir, file))
        }
        rmdirSync(pdfDir, { recursive: true })

    }
    mkdirSync(pdfDir)
}

var generatePdfs = function () {
    readdirSync('ru/software', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .forEach(async (dir_path) => {

            await generatePdf(`software/${dir_path.name}`, `${dir_path.name}_ru`, 'ru')
        })
    readdirSync('ru/printers', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .forEach(async (dir_path) => {
            await generatePdf(`printers/${dir_path.name}`, `${dir_path.name}_ru`, 'ru')
        })

}

cleanup()

generatePdfs()
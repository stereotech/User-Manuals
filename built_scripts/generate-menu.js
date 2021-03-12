var fs = require('fs'), path = require('path');
var generateMenuForDirectory = function (dir_path, lang) {
    var md_files = fs.readdirSync(dir_path)
        .filter(function (filent) { return filent.endsWith('.md'); });
    var menu = {};
    menu.download = "http://download.stereotech.org/manuals/" + dir_path.substring(3) + "_" + lang + ".pdf";
    menu.links = [];
    md_files.forEach(function (md_file) {
        var content = fs.readFileSync(path.join(dir_path, md_file)).toString().split('\n');
        if (md_file === '!cover.md') {
            menu.title = content.find(function (str) { return str.startsWith('# '); }).substring(2);
        }
        else {
            var link_1 = {};
            link_1.to = "/" + md_file.split('.')[0];
            link_1.name = content.find(function (str) { return str.startsWith('title:'); }).split(': ')[1].replace('\r', '');
            link_1.contents = [];
            var links = content.filter(function (str) { return str.startsWith('## '); }).map(function (str) { return str.substring(3); });
            links.forEach(function (lnk) {
                var cnt = {};
                cnt.name = lnk.replace('\r', '');
                cnt.to = "#" + lnk.toLowerCase().replace('\r', '').replace(/\s/g, '-');
                link_1.contents.push(cnt);
            });
            menu.links.push(link_1);
        }
    });
    var menu_arr = [];
    menu_arr.push(menu);
    var menu_str = JSON.stringify(menu_arr, null, 4);
    fs.writeFileSync(path.join(dir_path, 'menu.json'), menu_str);
};
var generateMenus = function () {
    fs.readdirSync('ru', { withFileTypes: true })
        .filter(function (dirent) { return dirent.isDirectory(); })
        .map(function (dirent) { return path.join('ru', dirent.name); })
        .forEach(function (dir_path) {
        generateMenuForDirectory(dir_path, 'ru');
        //if (!fs.existsSync(path.join(dir_path, 'menu.json'))) {
        //    generateMenuForDirectory(dir_path)
        //}
    });
    fs.readdirSync('en', { withFileTypes: true })
        .filter(function (dirent) { return dirent.isDirectory(); })
        .map(function (dirent) { return path.join('en', dirent.name); })
        .forEach(function (dir_path) {
        generateMenuForDirectory(dir_path, 'en');
        //if (!fs.existsSync(path.join(dir_path, 'menu.json'))) {
        //    generateMenuForDirectory(dir_path)
        //}
    });
};
generateMenus();
console.log("Menus generaded!");
//# sourceMappingURL=generate-menu.js.map
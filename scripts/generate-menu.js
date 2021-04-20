var fs = require('fs'),
    path = require('path')

var generateMenuForDirectory = function (dir_path, lang) {
    let md_files = fs.readdirSync(dir_path)
        .filter(filent => filent.endsWith('.md'))

    let menu = {}
    menu.download = `http://download.stereotech.org/manuals/${dir_path.substring(3)}_${lang}.pdf`
    menu.links = []
    md_files.forEach(md_file => {
        let content = fs.readFileSync(path.join(dir_path, md_file)).toString().split('\n')
        if (md_file === '!cover.md') {
            menu.title = content.find(str => str.startsWith('# ')).substring(2)
        } else {
            let link = {}
            link.to = `/${md_file.split('.')[0]}`
            link.name = content.find(str => str.startsWith('title:')).split(': ')[1].replace('\r', '')
            link.contents = []
            let links = content.filter(str => str.startsWith('## ')).map(str => str.substring(3))
            links.forEach(lnk => {
                let cnt = {}
                cnt.name = lnk.replace('\r', '')
                cnt.to = `#${lnk.toLowerCase().replace('\r', '').replace(/\s/g, '-')}`
                link.contents.push(cnt)
            });
            menu.links.push(link)
        }
    })
    let menu_arr = []
    menu_arr.push(menu)
    let menu_str = JSON.stringify(menu_arr, null, 4)
    fs.writeFileSync(path.join(dir_path, 'menu.json'), menu_str)
}

var generateMenus = function () {
    fs.readdirSync('ru/software', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join('ru', 'software', dirent.name))
        .forEach(dir_path => {
            generateMenuForDirectory(dir_path, 'ru')
        })

    fs.readdirSync('ru/printers', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join('ru', 'printers', dirent.name))
        .forEach(dir_path => {
            generateMenuForDirectory(dir_path, 'ru')
        })

    fs.readdirSync('en/software', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join('en', 'software', dirent.name))
        .forEach(dir_path => {
            generateMenuForDirectory(dir_path, 'en')
        })

    fs.readdirSync('en/printers', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join('en', 'printers', dirent.name))
        .forEach(dir_path => {
            generateMenuForDirectory(dir_path, 'en')
        })
}

generateMenus()
console.log("Menus generaded!")

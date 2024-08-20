const PDFExtract = require('pdf.js-extract').PDFExtract;


let files = [];
let fileNames = [];
let fileTexts = [];
let versions = {};
let recentFile;
module.exports = {
    uploadFile: async function(req, res) {
        let file = req['files'].file;
        const fileName = file.name;
        let fileObj;
        if (!fileNames.includes(fileName)) {
            files.push(file)
            fileNames.push(fileName)
            console.log("File uploaded: ", fileName);
            const pdfExtract = new PDFExtract();
            const data = await pdfExtract.extractBuffer(file.data)
            fileText = getPdfText(data.pages);
            fileObj = {
                name: fileName,
                text: fileText
            }
            fileTexts.push(fileObj)
            recentFile = fileObj;
            versions[fileName] = [{
                datetime: getDateTime(),
                text: fileText
            }];
        }
        res.send({
            currentFile: fileObj, 
            allFiles: fileNames
        });
    },

    getFile: function (req, res) {
        const fileName = req.params.name;
        const fullFile = fileTexts.find((file) => {
            return file.name == fileName;
        });
        recentFile = fullFile;
        res.send(fullFile);
    },

    saveFile: function (req, res) {
        const file = req.body;
        const fileName = file.name;
        const fileText = file.text;
        fileTexts.find((file) => {
            if (file.name == fileName) {
                file.text = fileText;
                return;
            }
        });
        versions[fileName].unshift({
            datetime: getDateTime(),
            text: fileText
        });
        console.log("File saved: ", fileName);
        res.send(true)
    },

    getRecentFile: function (req, res) {
        res.send(recentFile);
    },

    getAllVersions: function (req, res) {
        const fileName = req.params.name;
        res.send(versions[fileName]);
    },

    getVersion: function (req, res) {
        const fileDate = req.body.datetime;
        const fileName = recentFile.name;
        const version = versions[fileName].find((version) => {
            return version.datetime == fileDate;
        })
        recentFile.text = version.text;
        res.send(recentFile);
    },

     files,
     fileTexts,
     fileNames,
     recentFile
}

function getPdfText(pdfPages) {
    if (pdfPages) {
        let text = '';
        let lastLine;
        let currentLine;
        for (let i = 0; i < pdfPages.length; i++) {
            page = pdfPages[i];
            pageContent = page.content;
            pageContent.sort((a, b) => a.y - b.y)
            for (let j = 0; j < pageContent.length; j++) {
                content = pageContent[j]
                if (j === 0) {
                    lastLine = content.y
                }
                currentLine = content.y;
                if (currentLine != lastLine) {
                    text += '\n'
                }
                text += content.str;
                if ((j === pageContent.length-1) || (content.str === '')) {
                    text += '\n'
                }
                lastLine = currentLine;
            }
        }
        return text;
    }
}

function pad2(n) { 
    return n < 10 ? '0' + n : n 
}

function getDateTime() {
    const date = new Date();
    const year = date.getFullYear().toString(); 
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());
    const hour = pad2(date.getHours());
    const minute = pad2(date.getMinutes());
    const second = pad2(date.getSeconds());
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`

}
    
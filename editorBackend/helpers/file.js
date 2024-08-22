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
        // Check if file already uploaded
        if (!fileNames.includes(fileName)) {
            files.push(file)
            // Add file name to list of files to display in documents pane
            fileNames.push(fileName)
            console.log("File uploaded: ", fileName);
            // Extract text from pdf
            const pdfExtract = new PDFExtract();
            const data = await pdfExtract.extractBuffer(file.data)
            fileText = getPdfText(data.pages);
            fileObj = {
                name: fileName,
                text: fileText
            }
            // Save file name and text
            fileTexts.push(fileObj)
            // Set file as one currently displayed in the editor in case of page refresh
            recentFile = fileObj;
            // Save file version with current datetime to be displayed in history pane
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
        // Get file text based on file name to display in editor
        const fileName = req.params.name;
        const fullFile = fileTexts.find((file) => {
            return file.name == fileName;
        });
        // Set file as one currently displayed in the editor in case of page refresh
        recentFile = fullFile;
        res.send(fullFile);
    },

    saveFile: function (req, res) {
        // Update file text based on filename
        const file = req.body;
        const fileName = file.name;
        const fileText = file.text;
        fileTexts.find((file) => {
            if (file.name == fileName) {
                file.text = fileText;
                return;
            }
        });
        // Save a new version of the file
        versions[fileName].unshift({
            datetime: getDateTime(),
            text: fileText
        });
        console.log("File saved: ", fileName);
        res.send(true)
    },

    getRecentFile: function (req, res) {
        // Get currently displayed in the editor. Function called on page refreshed
        res.send(recentFile);
    },

    getAllVersions: function (req, res) {
        // Get list of versions to display in history pane
        const fileName = req.params.name;
        res.send(versions[fileName]);
    },

    getVersion: function (req, res) {
        // Get a version by file name and datetime
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
        // Extract text from pdf pages
        for (let i = 0; i < pdfPages.length; i++) {
            page = pdfPages[i];
            // Each oject is {x: , y: , content: } where x,y is location on the page and content is the text
            pageContent = page.content;
            // Sort content by y value so it reads top to bottom
            pageContent.sort((a, b) => a.y - b.y)
            for (let j = 0; j < pageContent.length; j++) {
                content = pageContent[j]
                if (j === 0) {
                    lastLine = content.y
                }
                currentLine = content.y;
                // If the current line location is not the same as the previous line location, add a new line character
                if (currentLine != lastLine) {
                    text += '\n'
                }
                text += content.str;
                // If on the last line of the page or text content is empty, add a new line
                if ((j === pageContent.length-1) || (content.str === '')) {
                    text += '\n'
                }
                // Update the last line
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
    
const fileUpload = require('express-fileupload');
const express = require('express');
const fileHelper = require("./helpers/file")
const cors = require("cors");
var corsOptions = {
    origin: "http://localhost:4200",
    optionsSuccessStatus: 200,
}

const app = express();
const port = 3000;
app.use(fileUpload());
app.use(cors(corsOptions));
app.use(express.json())
  
app.listen(port, () => {
console.log(`Server listening at http://localhost:${port}`);
});

// Upload new file
app.route('/api/file-upload').post((req, res) => {
    Promise.resolve(fileHelper.uploadFile(req, res))
});

// Get list of files for documents pane
app.route('/api/files').get((req, res) => {
    res.send(fileHelper.fileNames)
});

// Get the file that was most recently in the editor
app.route('/api/recent-file').get((req, res) => {
    fileHelper.getRecentFile(req, res);
});

// Get a file when clicked on from the documents pane
app.route('/api/open-file/:name').get((req, res) => {
    fileHelper.getFile(req, res)
});

// Save updates to a file
app.route('/api/save-file').post((req, res) => {
    fileHelper.saveFile(req, res);
});

// Get list of file versions for history pane
app.route('/api/versions/:name').get((req, res) => {
    fileHelper.getAllVersions(req, res)
});

// Get a file when clicked on from the history pane
app.route('/api/open-version').post((req, res) => {
    fileHelper.getVersion(req, res)
});

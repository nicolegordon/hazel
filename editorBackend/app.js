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


app.route('/api/file-upload').post((req, res) => {
    Promise.resolve(fileHelper.uploadFile(req, res))
});

app.route('/api/files').get((req, res) => {
    res.send(fileHelper.fileNames)
});

app.route('/api/recent-file').get((req, res) => {
    fileHelper.getRecentFile(req, res);
});

app.route('/api/open-file/:name').get((req, res) => {
    fileHelper.getFile(req, res)
});

app.route('/api/save-file').post((req, res) => {
    fileHelper.saveFile(req, res);
});

app.route('/api/versions/:name').get((req, res) => {
    fileHelper.getAllVersions(req, res)
});

app.route('/api/open-version').post((req, res) => {
    fileHelper.getVersion(req, res)
});

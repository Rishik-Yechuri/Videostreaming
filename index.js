const admin = require('firebase-admin');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const {getVideoDurationInSeconds} = require('get-video-duration')
const {Storage} = require('@google-cloud/storage');
const os = require('os');


admin.initializeApp();
const storage = admin.storage();

const app = express();
app.use(bodyParser.json());

app.post('/processVideo', async (req, res) => {

    const bucketName = 'holdvideos';
    const fileName = req.body.filePath;
    const tempLocalFile = path.join(os.tmpdir(), fileName);
    getVideoDuration(fileName,tempLocalFile)
        .then(duration => {
            res.status(200).send({success: true, length: duration});
        })
        .catch(console.error);
});

async function getVideoDuration(fileName, tempLocalFile) {
    // Create a local temporary file

    // Download file from bucket.
    await storage.bucket(bucketName).file(fileName).download({destination: tempLocalFile});

    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(tempLocalFile, function (err, metadata) {
            if (err) {
                reject(err);
                return;
            }
            // delete the temporary file
            fs.unlinkSync(tempLocalFile);
            resolve(metadata.format.duration);
        });
    });
}

// Error handling middleware
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

'use strict';

const { getVideoDurationInSeconds } = require('get-video-duration');
const fs = require('fs');
const path = require('path');
const getFiles = require('./getfiles');

async function getDirDuration(dir) {
  if (fs.statSync(dir).isFile()) {
    try {
      const duration = await getVideoDurationInSeconds(dir);
      return duration;
    } catch (err) {
      return 0;
    }
  }
  const files = await getFiles(dir);
  let total = 0;
  for (let i = 0; i < files.length; i++) {
    const file = path.resolve(dir, files[i]);
    try {
      const duration = await getVideoDurationInSeconds(file);
      total += duration;
    } catch (err) {}
  }
  return total;
}

async function run(dir) {
  const dirs = fs.readdirSync(dir).sort((a, b) => {
    return parseInt(a) > parseInt(b) ? 1 : -1;
  });
  for (let i = 0; i < dirs.length; i++) {
    const duration = await getDirDuration(dirs[i]);
    console.log(
      path.basename(dirs[i]),
      ' --- ',
      new Date(duration * 1000).toISOString().substr(11, 8)
    );
  }
}

module.exports = run;

const path = require('path');
const readline = require('readline');
const exec = require('child_process').exec;
const chalk = require('chalk');

/*
 * @param {String} wd - The directory to run git command.
 * @return {Object} - `tag_name`, `datetime_created`
 */
function gitTags(wd) {
  const basename = path.basename(wd);
  const keys = ['tag_name', 'datetime_created'];
  const separator = '_,,,_';
  const cmd = `git for-each-ref --format='%(refname:short)${separator}%(taggerdate)' refs/tags`;

  console.log(`Collecting git tags of repo ${chalk.cyan(basename)}`);
  const gitProcess = exec(cmd, {
    cwd: wd
  });
  const rl = readline.createInterface({
    input: gitProcess.stdout
  });

  const tagStats = [];
  return new Promise((resolve, reject) => {
    gitProcess.on('error', (err) => {
      reject(err);
    });

    rl.on('line', (line) => {
      const entry = line.split(separator);
      tagStats.push({
        tag_name: entry[0],
        datetime_created: new Date(entry[1]).toISOString()
      });
    }).on('close', () => {
      if (tagStats.length === 0) {
        reject(new Error(chalk.red(`No tags added to this repo`)));
      }
      resolve(tagStats);
    });

  });
}

if (require.main === module) {
  gitTags(process.cwd())
    .then(data => {
      console.log(data);
    })
    .catch(err => {
      console.log(err);
    });  
}

module.exports = gitTags;
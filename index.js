const path = require('path');
const chalk = require('chalk');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const gitTags = require('./lib/git-tags.js');

const files = ['package.json', 'bower.json', 'origami.json'];

/*
 * @param {String} repoDir - The repo to collection information. Default to cwd.
 * @param {String} outDir - The destination directory to put result json file. Default to cwd.
 * @return {Object}
 */
async function component({repoDir=process.cwd(), outDir=process.cwd()}={}) {
  repoDir = path.isAbsolute(repoDir) ? repoDir : path.resolve(process.cwd(), repoDir);

  outDir = path.isAbsolute(outDir) ? outDir : path.resolve(process.cwd(), outDir);

  const dest = path.resolve(outDir, 'stats.json');

  const promisedData = files.map(filename => {
    console.log(`Reading file: ${repoDir}/${filename}`);
    return loadJsonFile(path.resolve(repoDir, filename));
  });

  promisedData.push(gitTags(repoDir));

  const [package, bower, origami, tags] = await Promise.all(promisedData);

  const statsData = {
    module_name: bower.name,
    keywords: package.keywords,
    repo_home_url: package.homepage,
    is_stable: true,
    tag_name: tags[tags.length-1].tag_name,
    datetime_created: tags[tags.length-1].datetime_created,
    versions: tags,
    has_css: bower.main.indexOf('main.scss') !== -1,
    has_js: bower.main.indexOf('main.js') !== -1,
    dependencies: bower.dependencies,
    description: package.description,
    origami_type: origami.origamiType,
    origami_category: origami.origamiCategory,
    origami_version: origami.origamiVersion,
    support: package.bugs.url,
    support_status: origami.supportStatus,
    brower_features: origami.browserFeatures,
    demos: origami.demos
  };
  console.log(`Generating ${chalk.cyan(dest)}`);
  await writeJsonFile(dest, statsData);
  return statsData;
}

if (require.main === module) {
  component({
      repoDir: '../ftc-share',
      outDir: '.tmp'
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports = component;
const ReactDOMServer = require('react-dom/server');
const Promise = require('bluebird');
const fs = require('fs');
const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);
const yaml = require('js-yaml');
const Resume = require('./lib/resume');

const path = process.argv[2];

if (!path) { console.error('ERR: A render path is required...'); process.exit(); }

const save = (data) => writeFile(path, data, 'utf8');

var chokidar = require('chokidar');

render(path);

chokidar
  .watch('./resume.yaml')
  .on('change', render);

function render(path) {
  readFile('./resume.yaml', 'utf8')
    .then(yaml.safeLoad)
    .then(Resume)
    .then(ReactDOMServer.renderToStaticMarkup)
    .then(prependFrontMatter)
    .then(save)
    .then( () => console.log('Rendered resume...') );
}

function prependFrontMatter(data) {
  return 'title: Resume\n' +
    'css:\n' +
    '  - ./resume\n' +
    '---\n' +
    data;
}

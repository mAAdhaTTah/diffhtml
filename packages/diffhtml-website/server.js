const { readFile } = require('fs');
const { join } = require('path');
const combyne = require('combyne');
const express = require('express');
const favicon = require('serve-favicon');
const apiDox = require('diffhtml-dox');
const { watch, clientScript } = require('diffhtml-sync');

const app = express();
const port = process.env.PORT || 8000;
const path = join(__dirname, './template.html');

const renderResponse = version => res => {
  readFile(path, (err, result) => {
    apiDox.getApiState(version).then(api => {
      const template = combyne(String(result));
      const html = template.render({ api, clientScript });

      res.send(html);
    });
  });
};

if (process.env.NODE_ENV !== 'production') {
  app.use('/assets', express.static('./'));
  app.use(favicon(new Buffer(20)));
}

app.use('/api', apiDox.router);
app.get('/:version', (req, res) => renderResponse(req.params.version)(res));
app.get('/', (req, res) => renderResponse()(res));

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

watch(path, true, done => readFile(path, (err, result) => {
  apiDox.getApiState().then(api => {
    const template = combyne(String(result));
    const html = template.render({ api });

    done(html);
  });
}));

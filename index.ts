import * as http from 'http';
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';


const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public');
let cacheAge = 3600 * 24 * 365;

server.on('request', (request, response) => {
  const {method, url: path} = request;

  if (method !== 'GET') {
    response.statusCode = 405;
    response.end();
    return;
  }

  const {pathname} = url.parse(path as string);

  const filename = pathname?.substring(1) || 'index.html';
  fs.readFile(p.resolve(publicDir, filename as string), (err, data) => {
    if (err) {
      if (err.errno === -4058) {
        response.statusCode = 404;
        fs.readFile(p.resolve(publicDir, '404.html'), (err, data) => {
          response.end(data);
        });
      } else if (err.errno === -4068) {
        response.statusCode = 403;
        response.end('Forbidden');
      } else {
        response.statusCode = 500;
        response.write('Unknown Error');
        response.write('Please Retry Later');
        response.end();
      }
    } else {
      response.setHeader('Cache-Control', `public, max-age=${cacheAge}`);
      response.end(data);
    }
  });

});

server.listen(8888);


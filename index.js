var http = require('http');
var mime = require('mime');
var fs = require('fs');
var path = require('path');
var child = require('child_process');
var util = require('util');

function serve(options, callback) {
  var server = http.createServer(function(request, response) {    
    if (request.url == '/') {
      response.setHeader('content-type', 'text/html');
      response.end('<!doctype html><head><meta charset="utf-8"></head><body><script src="index.js"></script></body></html>');
    } 
    else {
      if (request.url == '/index.js') {
        var filename = options.outfile;
      } else {
        var filename = path.join(process.cwd(), request.url);
      }

      fs.exists(filename, function(exists) {
        if (exists) {
          response.setHeader('content-type', mime.lookup(filename));
          response.writeHead(200);
          
          var file = fs.createReadStream(filename);
          file.pipe(response);

        } else {
          response.writeHead(404);
          response.end('404');
        }
      });
    }
  });

  server.listen(options.port, options.host, callback);
  return server;
}

function bundle(options, callback) {
  var bundler = child.spawn(options.bundler, options.argv);
  var dirname = path.dirname(options.outfile);
  var basename = path.basename(options.outfile);

  var timeout = [];
  fs.watch(dirname, function(event, filename) {
    if (basename == filename) {
      if (!timeout[event]) {
        bundler.emit(event, filename);

        timeout[event] = setTimeout(function() {
          timeout[event] = null;
        }, 600);
      }

    }
  });

  return bundler;
}

function browse(options, callback) {
  console.log(options.browser);
  var browser = child.spawn(options.browser, [util.format('http://%s:%d', options.host, options.port)]);

  return browser;
}

module.exports.serve = serve;
module.exports.bundle = bundle;
module.exports.browse = browse;

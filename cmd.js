#!/usr/bin/env node

var cmd = require('commander');
var temp = require('temp');
var wrlc = require('./');

cmd.usage('[OPTION] ... [FILE]...');
cmd.option('-p, --port <PORT>', '', 9966);
cmd.option('-p, --host <HOST>', '', 'localhost');
cmd.option('-b, --bundler <CMD>', '', 'watchify');
cmd.option('-c, --browser <CMD>', '', process.env['BROWSER']);
cmd.option('-o, --outfile <PATH>', '', temp.path({prefix: 'wrlc', suffix: '.js'}));

cmd.allowUnknownOption();

cmd.parse(process.argv);
var server = wrlc.serve(cmd, function(error) {
  if (error) {
    return console.error(error);
  }

  var address = server.address();
});

cmd.argv = (function() {
  var argv = process.argv;
  
  if (argv.indexOf('-o') > -1 || argv.indexOf('--outfile') > -1) {
    return argv;
  }
  
  argv.push('--outfile');
  argv.push(cmd.outfile);
  
  return argv;
}());

var bundler = wrlc.bundle(cmd, function(error) {
  if (error) {
    return console.error(error);  
  }
});

bundler.on('change', function(filename) {
  console.log(JSON.stringify({
    time:new Date(),
    level: 'info',
    type: 'change',
    url: 'index.js'
  }));
});

var browser = wrlc.browse(cmd, function(error) {
  if (error) {
    return console.error(error);
  }
});

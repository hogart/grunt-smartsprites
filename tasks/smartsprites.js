'use strict';

module.exports = function(grunt) {

    var path = require('path');
    var cp = require('child_process');
    var _ = grunt.util._;
    var f = require('util').format;
    var log = grunt.log;
    var verbose = grunt.verbose;
    var camelize = require('underscore.string').camelize;

    var isWin = /^win/.test(process.platform);
    var binPath = path.join(
        __dirname,
        '..',
        'smartsprites-0.2.10/smartsprites.' + (isWin ? 'cmd' : 'sh')
    );

    var availableOptions = [
        'root-dir-path',
        'css-files',
        'output-dir-path',
        'document-root-dir-path',
        'log-level',
        'sprite-png-depth',
        'sprite-png-ie6',
        'css-file-encoding',
        'css-file-suffix'
    ];

    grunt.registerMultiTask('smartsprites', 'Run smartsprites', function () {
        var data = _.extend({
            stdout: true,
            stderr: true,
            smartspritePath: binPath,
            callback: function () {}
        }, this.data);

        // Provide arguments
        var args = [];
        availableOptions.forEach(function (opt) {
            var camelized = camelize(opt);

            if (data[camelized]) {
                args.push('--' + opt + ' ' + data[camelized]);
            }
        });

        var done = this.async();

        var cmd = data.smartspritePath + ' ' + args.join(' ');
        verbose.writeln(f('Execute %s', cmd));

        var child = cp.exec(cmd);

        // Pipe std if needed
        if (data.stdout) {
            child.stdout.on('data', log.ok.bind(log));
        }
        if (data.stderr) {
            child.stderr.on('data', log.error.bind(log));
        }

        child.on('exit', function (code) {
            if (code !== 0) {
                log.error(f('Exited with code: %d.', code));
                return done(false);
            }
            log.ok(f('Exited with code: %d.', code));
            data.callback();
            done();
        });
    });
};

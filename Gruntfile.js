// # grunt build file
'use strict';

// js-hint options. See the complete list of options [here](http://jshint.com/docs/options/)
var jshintOptions = {
    nonew: true,
    plusplus: true,
    curly: true,
    latedef: true,
    maxdepth: 6,
    unused: true,
    noarg: true,
    trailing: true,
    indent: 4,
    forin: true,
    noempty: true,
    quotmark: true,
    maxparams: 6,
    node: true,
    eqeqeq: true,
    strict: true,
    undef: true,
    bitwise: true,
    newcap: true,
    immed: true,
    camelcase: true,
    maxcomplexity: 10,
    maxlen: 120,
    nonbsp: true,
    freeze: true
};

module.exports = function(grunt) {
    // loading the npm task
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        clean: [
            '.cache',
            '.test'
        ],
        jshint: {
            lib: {
                src: [
                    'lib/**/*.js',
                    'Gruntfile.js',
                    'package.json'
                ],
                options: jshintOptions
            }
        },
        karma: {
            test: {
                files: [
                    {
                        src: [
                            'test/**/*.js'
                        ]
                    }
                ],
                reporters: [
                    'mocha'
                ],
                lasso: {
                    minify: false,
                    bundlingEnabled: false,
                    resolveCssUrls: true,
                    cacheProfile: 'development',
                    tempdir: '.test'
                }
            },
            options: {
                browserNoActivityTimeout: 20000,
                captureTimeout: 120000,
                hostname: 'localhost',
                browsers: grunt.option('browsers') ? grunt.option('browsers').split(',') : [
                    'Firefox', 'Chrome', 'Opera'
                ],
                frameworks: [
                    'lasso',
                    'mocha',
                    'chai'
                ],
                plugins: [
                    'karma-chai',
                    'karma-mocha',
                    'karma-lasso',
                    'karma-mocha-reporter',
                    'karma-phantomjs-launcher',
                    'karma-chrome-launcher',
                    'karma-firefox-launcher',
                    'karma-safari-launcher',
                    'karma-opera-launcher',
                    'karma-ie-launcher',
                    'karma-webdriver-launcher'
                ],
                colors: false,
                autoWatch: grunt.option('watch') || false,
                singleRun: !grunt.option('watch'),
                client: {
                    mocha: {
                        // set test-case timeout in milliseconds [2000]
                        timeout: 4000,
                        // check for global variable leaks. FIXME
                        ignoreLeaks: true,
                        // specify user-interface (bdd|tdd|exports).
                        ui: 'bdd',
                        // "slow" test threshold in milliseconds [75].
                        slow: 500
                    }
                },
                logLevel: grunt.option('debug') ? 'DEBUG' : 'WARN'
            }
        }
    });

    // ### test task
    grunt.registerTask('test', [
        'jshint',
        'karma'
    ]);
};

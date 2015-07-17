'use strict';
module.exports = function(grunt) {
    // karma configuration starts here
    grunt.loadNpmTasks('grunt-karma');

    return {
        test: {
            files: [
                {
                    src: [
                        'test/data-store/indexed-db/*.js',
                        'test/data-store/heap/*.js'
                    ]
                }
            ],
            reporters: [
                'mocha'
            ],
            lasso: {
                plugins: [
                    'lasso-less',
                    'lasso-dust'
                ],
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
            browsers: ['Chrome', 'PhantomJS', 'Firefox'],
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
                'karma-webdriver-launcher',
                // plugins for fitment.plugin
                'karma-sinon',
                'karma-sinon-expect',
                'karma-coverage'
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
    };
};

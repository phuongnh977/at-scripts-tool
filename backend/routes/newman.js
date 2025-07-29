const express = require('express');
const router = express.Router();
const newman = require('newman');
const path = require('path');
const fs = require('fs').promises;

const collectionsPath = path.join(__dirname, '../collections');
const environmentsPath = path.join(__dirname, '../environments');

router.post('/run', async (req, res) => {
    try {
        const { collectionFile, environmentFile, iterationCount = 1 } = req.body;

        if (!collectionFile) {
            return res.status(400).json({ error: 'Collection file is required' });
        }

        const collectionPath = path.join(collectionsPath, collectionFile);
        const collectionData = await fs.readFile(collectionPath, 'utf8');
        const collection = JSON.parse(collectionData);

        const options = {
            collection: collection,
            iterationCount: parseInt(iterationCount),
            reporters: ['cli', 'json'],
            reporter: {
                json: {
                    export: null
                }
            }
        };

        if (environmentFile) {
            const environmentPath = path.join(environmentsPath, environmentFile);
            const environmentData = await fs.readFile(environmentPath, 'utf8');
            options.environment = JSON.parse(environmentData);
        }

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        const startTime = Date.now();
        let testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            assertions: []
        };

        newman.run(options)
            .on('start', () => {
                res.write(`data: ${JSON.stringify({ type: 'start', message: 'Starting collection run...' })}\n\n`);
            })
            .on('beforeRequest', (err, args) => {
                const request = args.request;
                res.write(`data: ${JSON.stringify({ 
                    type: 'request', 
                    name: args.item.name,
                    method: request.method,
                    url: request.url.toString()
                })}\n\n`);
            })
            .on('request', (err, args) => {
                if (err) {
                    res.write(`data: ${JSON.stringify({ 
                        type: 'error', 
                        message: err.message 
                    })}\n\n`);
                }
            })
            .on('assertion', (err, args) => {
                testResults.total++;
                if (err) {
                    testResults.failed++;
                } else {
                    testResults.passed++;
                }

                testResults.assertions.push({
                    name: args.assertion,
                    passed: !err,
                    error: err ? err.message : null
                });

                res.write(`data: ${JSON.stringify({ 
                    type: 'assertion',
                    assertion: args.assertion,
                    passed: !err,
                    error: err ? err.message : null
                })}\n\n`);
            })
            .on('done', (err, summary) => {
                const duration = Date.now() - startTime;
                
                const result = {
                    type: 'complete',
                    duration: duration,
                    stats: {
                        iterations: summary.run.stats.iterations,
                        requests: summary.run.stats.requests,
                        tests: summary.run.stats.tests,
                        assertions: summary.run.stats.assertions,
                        testScripts: summary.run.stats.testScripts,
                        prerequestScripts: summary.run.stats.prerequestScripts
                    },
                    failures: summary.run.failures,
                    testResults: testResults
                };

                res.write(`data: ${JSON.stringify(result)}\n\n`);
                res.end();
            });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
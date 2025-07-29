const express = require('express');
const router = express.Router();
const newman = require('newman');
const path = require('path');
const fs = require('fs').promises;

const collectionsPath = path.join(__dirname, '../collections');
const environmentsPath = path.join(__dirname, '../environments');
const resultsPath = path.join(__dirname, '../results');

// Ensure results directory exists
(async () => {
    try {
        await fs.mkdir(resultsPath, { recursive: true });
    } catch (error) {
        console.error('Error creating results directory:', error);
    }
})();

router.post('/run', async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { collectionFile, environmentFile, iterationCount = 1 } = req.body;

        if (!collectionFile) {
            return res.status(400).json({ error: 'Collection file is required' });
        }

        const collectionFilePath = path.join(collectionsPath, collectionFile);
        
        // Check if collection file exists
        try {
            await fs.access(collectionFilePath);
        } catch (error) {
            console.error('Collection file not found:', collectionFilePath);
            return res.status(404).json({ error: 'Collection file not found' });
        }
        
        const collectionData = await fs.readFile(collectionFilePath, 'utf8');
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
            const environmentFilePath = path.join(environmentsPath, environmentFile);
            
            // Check if environment file exists
            try {
                await fs.access(environmentFilePath);
                const environmentData = await fs.readFile(environmentFilePath, 'utf8');
                options.environment = JSON.parse(environmentData);
            } catch (error) {
                console.error('Environment file not found:', environmentFilePath);
                // Continue without environment file
            }
        }

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // Send initial response
        res.write(':ok\n\n');
        
        // Keep connection alive
        const heartbeat = setInterval(() => {
            res.write(':heartbeat\n\n');
        }, 30000);

        const startTime = Date.now();
        const resultId = `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        let testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            assertions: []
        };
        let executions = [];

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
                if (!err && args.response) {
                    const execution = {
                        item: {
                            name: args.item.name,
                            request: {
                                method: args.request.method,
                                url: args.request.url.toString(),
                                headers: args.request.headers.toJSON()
                            }
                        },
                        response: {
                            code: args.response.code,
                            status: args.response.status,
                            responseTime: args.response.responseTime,
                            headers: args.response.headers.toJSON(),
                            body: args.response.stream.toString()
                        },
                        assertions: []
                    };
                    executions.push(execution);
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
                
                // Add assertion to the latest execution
                if (executions.length > 0) {
                    const currentExecution = executions[executions.length - 1];
                    currentExecution.assertions.push({
                        assertion: args.assertion,
                        error: err ? { message: err.message, name: err.name } : null
                    });
                }

                res.write(`data: ${JSON.stringify({ 
                    type: 'assertion',
                    assertion: args.assertion,
                    passed: !err,
                    error: err ? err.message : null
                })}\n\n`);
            })
            .on('done', async (err, summary) => {
                const duration = Date.now() - startTime;
                
                // Save detailed result to file
                const fullResult = {
                    id: resultId,
                    collection: collectionFile,
                    environment: environmentFile || null,
                    timestamp: new Date().toISOString(),
                    stats: {
                        duration: duration,
                        iterations: summary.run.stats.iterations,
                        requests: summary.run.stats.requests,
                        tests: summary.run.stats.tests,
                        assertions: summary.run.stats.assertions,
                        testScripts: summary.run.stats.testScripts,
                        prerequestScripts: summary.run.stats.prerequestScripts
                    },
                    failures: summary.run.failures,
                    executions: executions
                };
                
                try {
                    const resultFile = path.join(resultsPath, `${resultId}.json`);
                    const tempFile = `${resultFile}.tmp`;
                    
                    // Write to temporary file first
                    await fs.writeFile(tempFile, JSON.stringify(fullResult, null, 2));
                    
                    // Rename temp file to final file (atomic operation)
                    await fs.rename(tempFile, resultFile);
                    
                    console.log('Result saved successfully:', resultId);
                } catch (saveError) {
                    console.error('Error saving result:', saveError);
                    // Clean up temp file if exists
                    try {
                        const tempFile = path.join(resultsPath, `${resultId}.json.tmp`);
                        await fs.unlink(tempFile);
                    } catch (cleanupError) {
                        // Ignore cleanup errors
                    }
                }
                
                const result = {
                    type: 'complete',
                    resultId: resultId,
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
                clearInterval(heartbeat);
                res.end();
            });

    } catch (error) {
        console.error('Error in newman run:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        } else {
            res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
            res.end();
        }
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const environmentsPath = path.join(__dirname, '../environments');

router.get('/', async (req, res) => {
    try {
        const files = await fs.readdir(environmentsPath);
        const environments = files.filter(file => file.endsWith('.json'));
        
        const environmentsData = await Promise.all(
            environments.map(async (file) => {
                const content = await fs.readFile(path.join(environmentsPath, file), 'utf8');
                const data = JSON.parse(content);
                return {
                    filename: file,
                    name: data.name || file,
                    values: data.values?.length || 0,
                    updatedAt: (await fs.stat(path.join(environmentsPath, file))).mtime
                };
            })
        );
        
        res.json(environmentsData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:filename', async (req, res) => {
    try {
        const filePath = path.join(environmentsPath, req.params.filename);
        const content = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(content));
    } catch (error) {
        res.status(404).json({ error: 'Environment not found' });
    }
});

router.post('/upload', async (req, res) => {
    try {
        if (!req.files || !req.files.environment) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.files.environment;
        const filename = `${Date.now()}-${file.name}`;
        const filePath = path.join(environmentsPath, filename);

        await file.mv(filePath);
        res.json({ message: 'Environment uploaded successfully', filename });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:filename', async (req, res) => {
    try {
        const filePath = path.join(environmentsPath, req.params.filename);
        await fs.writeFile(filePath, JSON.stringify(req.body, null, 2));
        res.json({ message: 'Environment updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:filename', async (req, res) => {
    try {
        const filePath = path.join(environmentsPath, req.params.filename);
        await fs.unlink(filePath);
        res.json({ message: 'Environment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:filename/clone', async (req, res) => {
    try {
        const sourceFilePath = path.join(environmentsPath, req.params.filename);
        const content = await fs.readFile(sourceFilePath, 'utf8');
        const environment = JSON.parse(content);
        
        // Update environment info
        const originalName = environment.name || 'Environment';
        environment.name = `${originalName} - Copy`;
        environment.id = `cloned-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate new filename
        const timestamp = Date.now();
        const newFilename = `${timestamp}-cloned-environment.json`;
        const newFilePath = path.join(environmentsPath, newFilename);
        
        // Write the cloned environment
        await fs.writeFile(newFilePath, JSON.stringify(environment, null, 2));
        
        res.json({ 
            message: 'Environment cloned successfully', 
            filename: newFilename,
            name: environment.name
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Environment not found' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

module.exports = router;
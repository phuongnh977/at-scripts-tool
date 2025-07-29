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

module.exports = router;
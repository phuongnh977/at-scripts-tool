const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const collectionsPath = path.join(__dirname, '../collections');

router.get('/', async (req, res) => {
    try {
        const files = await fs.readdir(collectionsPath);
        const collections = files.filter(file => file.endsWith('.json'));
        
        const collectionsData = await Promise.all(
            collections.map(async (file) => {
                const content = await fs.readFile(path.join(collectionsPath, file), 'utf8');
                const data = JSON.parse(content);
                return {
                    filename: file,
                    name: data.info?.name || file,
                    description: data.info?.description || '',
                    updatedAt: (await fs.stat(path.join(collectionsPath, file))).mtime
                };
            })
        );
        
        res.json(collectionsData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:filename', async (req, res) => {
    try {
        const filePath = path.join(collectionsPath, req.params.filename);
        const content = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(content));
    } catch (error) {
        res.status(404).json({ error: 'Collection not found' });
    }
});

router.post('/upload', async (req, res) => {
    try {
        if (!req.files || !req.files.collection) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.files.collection;
        const filename = `${Date.now()}-${file.name}`;
        const filePath = path.join(collectionsPath, filename);

        await file.mv(filePath);
        res.json({ message: 'Collection uploaded successfully', filename });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:filename', async (req, res) => {
    try {
        const filePath = path.join(collectionsPath, req.params.filename);
        await fs.writeFile(filePath, JSON.stringify(req.body, null, 2));
        res.json({ message: 'Collection updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:filename', async (req, res) => {
    try {
        const filePath = path.join(collectionsPath, req.params.filename);
        await fs.unlink(filePath);
        res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:filename/clone', async (req, res) => {
    try {
        const sourceFilePath = path.join(collectionsPath, req.params.filename);
        const content = await fs.readFile(sourceFilePath, 'utf8');
        const collection = JSON.parse(content);
        
        // Update collection info
        const originalName = collection.info?.name || 'Collection';
        collection.info = collection.info || {};
        collection.info.name = `${originalName} - Copy`;
        collection.info._postman_id = `cloned-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate new filename
        const timestamp = Date.now();
        const newFilename = `${timestamp}-cloned-collection.json`;
        const newFilePath = path.join(collectionsPath, newFilename);
        
        // Write the cloned collection
        await fs.writeFile(newFilePath, JSON.stringify(collection, null, 2));
        
        res.json({ 
            message: 'Collection cloned successfully', 
            filename: newFilename,
            name: collection.info.name
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Collection not found' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

module.exports = router;
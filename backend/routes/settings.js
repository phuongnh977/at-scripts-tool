const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const settingsFile = path.join(__dirname, '../settings.json');

// Initialize settings file if it doesn't exist
(async () => {
  try {
    await fs.access(settingsFile);
  } catch (error) {
    await fs.writeFile(settingsFile, JSON.stringify({ defaultCollection: null }, null, 2));
  }
})();

// Get settings
router.get('/', async (req, res) => {
  try {
    const content = await fs.readFile(settingsFile, 'utf8');
    const settings = JSON.parse(content);
    res.json(settings);
  } catch (error) {
    res.json({ defaultCollection: null });
  }
});

// Update default collection
router.put('/default-collection', async (req, res) => {
  try {
    const { collectionFile } = req.body;
    
    // Read current settings
    let settings = {};
    try {
      const content = await fs.readFile(settingsFile, 'utf8');
      settings = JSON.parse(content);
    } catch (error) {
      // Use default if file doesn't exist
    }
    
    // Update default collection
    settings.defaultCollection = collectionFile;
    
    // Save settings
    await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2));
    
    res.json({ message: 'Default collection updated', defaultCollection: collectionFile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
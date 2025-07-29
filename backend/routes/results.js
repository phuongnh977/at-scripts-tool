const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const resultsDir = path.join(__dirname, '../results');

// Ensure results directory exists
(async () => {
  try {
    await fs.mkdir(resultsDir, { recursive: true });
  } catch (error) {
    console.error('Error creating results directory:', error);
  }
})();

// Get all results
router.get('/', async (req, res) => {
  try {
    const files = await fs.readdir(resultsDir);
    const results = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(resultsDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          
          // Skip empty files
          if (!content || content.trim().length === 0) {
            console.warn(`Skipping empty result file: ${file}`);
            continue;
          }
          
          let result;
          try {
            result = JSON.parse(content);
          } catch (parseError) {
            console.error(`Error parsing result file ${file}:`, parseError);
            // Try to delete corrupted file
            try {
              await fs.unlink(filePath);
              console.log(`Deleted corrupted result file: ${file}`);
            } catch (unlinkError) {
              console.error(`Failed to delete corrupted file: ${file}`);
            }
            continue;
          }
          
          // Validate required fields
          if (!result.id || !result.stats) {
            console.warn(`Invalid result file format: ${file}`);
            continue;
          }
          
          // Add summary info without full execution details
          results.push({
            id: result.id,
            collection: result.collection || 'Unknown',
            environment: result.environment || null,
            stats: result.stats,
            timestamp: result.timestamp || new Date().toISOString()
          });
        } catch (err) {
          console.error(`Error reading result file ${file}:`, err);
        }
      }
    }
    
    // Sort by timestamp descending (newest first)
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read results' });
  }
});

// Get specific result with full details
router.get('/:id', async (req, res) => {
  try {
    const resultFile = `${req.params.id}.json`;
    const filePath = path.join(resultsDir, resultFile);
    
    const content = await fs.readFile(filePath, 'utf8');
    const result = JSON.parse(content);
    
    res.json(result);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Result not found' });
    } else {
      res.status(500).json({ error: 'Failed to read result' });
    }
  }
});

// Delete specific result
router.delete('/:id', async (req, res) => {
  try {
    const resultFile = `${req.params.id}.json`;
    const filePath = path.join(resultsDir, resultFile);
    
    await fs.unlink(filePath);
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Result not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete result' });
    }
  }
});

// Delete all results
router.delete('/', async (req, res) => {
  try {
    const files = await fs.readdir(resultsDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(resultsDir, file);
        await fs.unlink(filePath);
      }
    }
    
    res.json({ message: 'All results deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete results' });
  }
});

module.exports = router;
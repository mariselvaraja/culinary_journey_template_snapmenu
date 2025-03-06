import express from 'express';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { WebSocket } from 'ws';
import * as imageManager from './image-manager.js';

const execAsync = promisify(exec);
const router = express.Router();
// Use absolute paths for consistency
const PROJECT_ROOT = path.resolve(process.cwd(), '..');

class ContentManager {
  static async ensureBackupDirExists() {
    const backupDir = path.resolve(PROJECT_ROOT, 'server/content-backup');
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }
    return backupDir;
  }

  static async updateContentAndCommit(content) {
    const contentPath = path.resolve(PROJECT_ROOT, 'src', 'data', 'site-content.json');
    console.log('Writing content to:', contentPath);

    try {
      // Create backup first
      await this.createBackup();

      // Write content to a temporary file
      const tempPath = `${contentPath}.tmp`;
      const contentJson = JSON.stringify(content, null, 2);
      await fs.writeFile(tempPath, contentJson);
      console.log('Temporary file written:', tempPath);

      // Verify the temporary file
      const writtenContent = await fs.readFile(tempPath, 'utf-8');
      const parsedContent = JSON.parse(writtenContent);
      
      // Validate content structure
      const validationError = this.validateContent(parsedContent);
      if (validationError) {
        throw new Error(`Content validation failed: ${validationError}`);
      }

      // Verify content matches what we tried to write
      if (JSON.stringify(parsedContent) !== JSON.stringify(content)) {
        throw new Error('Content verification failed: written content does not match original');
      }

      // Rename temp file to actual file (atomic operation)
      await fs.rename(tempPath, contentPath);
      console.log('Content file updated successfully');

      // Verify the final file
      const finalContent = await fs.readFile(contentPath, 'utf-8');
      const finalParsed = JSON.parse(finalContent);
      if (JSON.stringify(finalParsed) !== JSON.stringify(content)) {
        throw new Error('Final content verification failed');
      }

      console.log('Content file verified successfully');

      if (process.env.ENABLE_GIT_INTEGRATION?.toLowerCase() === 'true') {
        try {
          await execAsync(`git add ${contentPath}`);
          await execAsync('git commit -m "content: update site content"');
          await execAsync('git push');
        } catch (error) {
          console.error('Git operation failed:', error);
          // Don't throw here - git failure shouldn't prevent content update
          console.warn('Git integration failed but content was saved successfully');
        }
      }
    } catch (error) {
      console.error('Error updating content file:', error);
      // Try to restore from backup if update fails
      try {
        const backupDir = await this.ensureBackupDirExists();
        const backups = await fs.readdir(backupDir);
        if (backups.length > 0) {
          const latestBackup = path.join(backupDir, backups[backups.length - 1]);
          const backupContent = await fs.readFile(latestBackup, 'utf-8');
          await fs.writeFile(contentPath, backupContent);
          console.log('Restored content from backup:', latestBackup);
        }
      } catch (backupError) {
        console.error('Failed to restore from backup:', backupError);
      }
      throw new Error(`Failed to update content file: ${error.message}`);
    }
  }

  static async createBackup() {
    const backupDir = await this.ensureBackupDirExists();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const content = await fs.readFile(
      path.resolve(PROJECT_ROOT, 'src', 'data', 'site-content.json'),
      'utf-8'
    );
    const backupPath = path.join(backupDir, `${timestamp}.json`);
    await fs.writeFile(backupPath, content);
    return backupPath;
  }

  static async cleanupBackups() {
    try {
      const backupDir = await this.ensureBackupDirExists();
      const backupsToKeep = parseInt(process.env.NUMBER_OF_BACKUPS_TO_KEEP, 10) || 10;
      
      // Get and validate backup files
      const backups = await fs.readdir(backupDir);
      const validBackups = [];
      
      for (const backup of backups) {
        const backupPath = path.resolve(backupDir, backup);
        try {
          const stats = await fs.stat(backupPath);
          if (stats.isFile()) {
            validBackups.push({ name: backup, path: backupPath });
          }
        } catch (error) {
          console.warn(`Invalid backup file ${backup}:`, error.message);
        }
      }
      
      // Sort backups by name (which includes timestamp)
      validBackups.sort((a, b) => a.name.localeCompare(b.name));
      
      if (validBackups.length > backupsToKeep) {
        const toDelete = validBackups.slice(0, validBackups.length - backupsToKeep);
        
        // Delete files one by one and ignore errors
        for (const backup of toDelete) {
          try {
            await fs.unlink(backup.path);
            console.log(`Deleted old backup: ${backup.name}`);
          } catch (error) {
            console.warn(`Failed to delete backup file ${backup.name}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.warn('Error during backup cleanup:', error.message);
    }
  }

  static validateContent(content) {
    if (typeof content !== 'object' || content === null) {
      return 'Content must be an object';
    }

    // For partial updates, we don't require all properties
    // Just validate that the provided properties have the correct structure
    if (content.brand && typeof content.brand !== 'object') {
      return 'Brand must be an object';
    }
    if (content.navigation && typeof content.navigation !== 'object') {
      return 'Navigation must be an object';
    }
    if (content.navigation && content.navigation.links && !Array.isArray(content.navigation.links)) {
      return 'Navigation links must be an array';
    }

    return null; // No error
  }

  static updateNestedValue(obj, path, value) {
    if (!Array.isArray(path)) {
      path = [path];
    }

    let current = obj;
    const pathCopy = [...path];
    const lastKey = pathCopy.pop();

    for (const key of pathCopy) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
    return obj;
  }

  static collectImageUrls(obj) {
    const urls = new Set();
    
    const traverse = (value) => {
      if (!value) return;
      
      if (typeof value === 'string') {
        // Only collect local image URLs
        if (value.startsWith('/uploads/images/')) {
          urls.add(value);
        }
      } else if (typeof value === 'object') {
        if (value.type === 'image' && value.value && value.value.startsWith('/uploads/images/')) {
          urls.add(value.value);
        }
        Object.values(value).forEach(traverse);
      }
    };

    traverse(obj);
    return Array.from(urls);
  }

  static async validateImageUrls(obj) {
    const invalidUrls = [];
    
    const traverse = async (value, path = []) => {
      if (!value) return;
      
      if (typeof value === 'string') {
        // Skip validation for external URLs
        if (value.startsWith('http://') || value.startsWith('https://')) {
          console.log('Skipping validation for external URL:', value);
        } else if (value.startsWith('/uploads/images/')) {
          console.log('Validating local image:', value);
          console.log('Path:', path.join('.'));
          const isValid = await imageManager.isValidImageUrl(value);
          if (!isValid) {
            invalidUrls.push({ path: path.join('.'), url: value });
          }
        }
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        if (value.type === 'image' && value.value) {
          // Handle image objects the same way
          if (value.value.startsWith('http://') || value.value.startsWith('https://')) {
            console.log('Skipping validation for external URL in image object:', value.value);
          } else if (value.value.startsWith('/uploads/images/')) {
            console.log('Validating local image in object:', value.value);
            console.log('Path:', [...path, 'value'].join('.'));
            const isValid = await imageManager.isValidImageUrl(value.value);
            if (!isValid) {
              invalidUrls.push({ path: [...path, 'value'].join('.'), url: value.value });
            }
          }
        }
        for (const [key, val] of Object.entries(value)) {
          await traverse(val, [...path, key]);
        }
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          await traverse(value[i], [...path, i]);
        }
      }
    };

    await traverse(obj);
    return invalidUrls;
  }
}

// Initialize backup directory
ContentManager.ensureBackupDirExists().catch(console.error);

// Routes
// Save entire site content
// Base API path is /api/content, so this handles both /api/content and /api/content/
router.post(['/', '/*'], async (req, res) => {
  try {
    const content = req.body;
    
    // Validate content
    const validationError = ContentManager.validateContent(content);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    // Validate image URLs
    const invalidUrls = await ContentManager.validateImageUrls(content);
    if (invalidUrls.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image URLs detected',
        details: invalidUrls
      });
    }

    // Save and commit changes
    await ContentManager.updateContentAndCommit(content);

    // Send update to all connected clients
    if (req.app.locals.wss) {
      req.app.locals.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'CONTENT_UPDATE', content }));
        }
      });
    }

    res.json({ 
      success: true, 
      message: 'Site content saved successfully',
      content 
    });
  } catch (error) {
    console.error('Error saving content:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to save content',
      details: error.stack
    });
  }
});

// Get menu data
router.get(['/menu', '/menu/*'], async (req, res) => {
  try {
    const menuData = {};
    const menuCategories = ['mains', 'starters', 'desserts', 'drinks'];

    // Read each category file
    for (const category of menuCategories) {
      const filePath = path.resolve(PROJECT_ROOT, 'src', 'data', 'menu', 'json', `${category}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      menuData[category] = data[category];
    }

    res.json({ 
      success: true,
      message: 'Menu data loaded successfully',
      data: menuData 
    });
  } catch (error) {
    console.error('Error loading menu data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to load menu data',
      details: error.stack
    });
  }
});

// Save menu data
router.post(['/menu', '/menu/*'], async (req, res) => {
  try {
    const menuData = req.body;
    const menuCategories = ['mains', 'starters', 'desserts', 'drinks'];

    // Validate menu data structure
    for (const category of menuCategories) {
      if (!menuData[category] || !Array.isArray(menuData[category])) {
        return res.status(400).json({
          success: false,
          error: `Invalid menu data: ${category} must be an array`
        });
      }
    }

    // Save each category to its respective file
    for (const category of menuCategories) {
      const filePath = path.resolve(PROJECT_ROOT, 'src', 'data', 'menu', 'json', `${category}.json`);
      const content = JSON.stringify({ [category]: menuData[category] }, null, 2);
      await fs.writeFile(filePath, content);
    }

    // Send back the updated menu data
    res.json({ 
      success: true,
      message: 'Menu data saved successfully',
      data: menuData 
    });
  } catch (error) {
    console.error('Error saving menu data:', error);
    const errorMessage = error.message || 'Failed to save menu data';
    console.error('Error saving menu data:', errorMessage);
    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: error.stack 
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const contentPath = path.resolve(PROJECT_ROOT, 'src', 'data', 'site-content.json');
    console.log('Reading content from:', contentPath);
    const contentRaw = await fs.readFile(contentPath, 'utf-8');
    const content = JSON.parse(contentRaw);
    console.log('Content loaded successfully');
    res.json({ 
      success: true, 
      message: 'Content loaded successfully',
      content 
    });
  } catch (error) {
    console.error('Error reading content:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to read content',
      details: error.stack
    });
  }
});

router.post('/update-section', async (req, res) => {
  try {
    const { section, path: updatePath, value } = req.body;
    
    const contentPath = path.resolve(PROJECT_ROOT, 'src', 'data', 'site-content.json');
    console.log('Update request:', {
      section,
      path: updatePath.join('.'),
      value
    });

    // Read current content
    const contentRaw = await fs.readFile(contentPath, 'utf-8');
    const content = JSON.parse(contentRaw);
    console.log('Current content state:', {
      section,
      beforeUpdate: content[section]
    });

    // Create backup
    await ContentManager.createBackup();

    // Update content using the helper method
    ContentManager.updateNestedValue(content, updatePath, value);
    console.log('Content after update:', {
      section,
      path: updatePath.join('.'),
      afterUpdate: content[section]
    });

    // Validate content
    const validationError = ContentManager.validateContent(content);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    try {
      // Validate image URLs
      const invalidUrls = await ContentManager.validateImageUrls(content);
      if (invalidUrls.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid image URLs detected',
          details: invalidUrls
        });
      }
    } catch (error) {
      console.error('Error validating image URLs:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to validate image URLs'
      });
    }

    // Save and commit changes
    await ContentManager.updateContentAndCommit(content);

    // Send update to all connected clients
    if (req.app.locals.wss) {
      req.app.locals.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'CONTENT_UPDATE',
            content: { [section]: content[section] }
          }));
        }
      });
    }

    // Clean up unused images
    try {
      // Collect all used images from the entire content
      const contentRaw = await fs.readFile(
        path.join(PROJECT_ROOT, 'src/data/site-content.json'),
        'utf-8'
      );
      const fullContent = JSON.parse(contentRaw);
      const usedImages = ContentManager.collectImageUrls(fullContent);
      
      // Call cleanup directly
      await imageManager.cleanupUnusedImages(usedImages);
    } catch (error) {
      console.warn('Failed to clean up unused images:', error);
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const backupDir = await ContentManager.ensureBackupDirExists();
    const backups = await fs.readdir(backupDir);
    const history = backups
      .sort()
      .reverse()
      .map(filename => ({
        timestamp: filename.replace('.json', ''),
        path: path.join(backupDir, filename)
      }));

    res.json({ success: true, history });
  } catch (error) {
    console.error('Error getting content history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/history/:timestamp', async (req, res) => {
  try {
    const { timestamp } = req.params;
    const backupDir = await ContentManager.ensureBackupDirExists();
    const backupPath = path.join(backupDir, `${timestamp}.json`);
    
    const contentRaw = await fs.readFile(backupPath, 'utf-8');
    const content = JSON.parse(contentRaw);

    res.json({ success: true, content });
  } catch (error) {
    console.error('Error getting content version:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/restore', async (req, res) => {
  try {
    const { timestamp } = req.body;
    const backupDir = await ContentManager.ensureBackupDirExists();
    const backupPath = path.join(backupDir, `${timestamp}.json`);
    
    const contentRaw = await fs.readFile(backupPath, 'utf-8');
    const content = JSON.parse(contentRaw);

    // Create backup of current state before restore
    await ContentManager.createBackup();
    
    // Restore and commit changes
    await ContentManager.updateContentAndCommit(content);

    // Send update to all connected clients
    if (req.app.locals.wss) {
      req.app.locals.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'CONTENT_UPDATE', content }));
        }
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error('Error restoring content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

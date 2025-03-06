import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// Configure multer for image upload
const getUploadPath = () => {
  // Use forward slashes for consistency across platforms
  const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'images').replace(/\\/g, '/');
  console.log('Upload path:', uploadPath);
  return uploadPath;
};

const ensureUploadDir = async () => {
  const uploadDir = getUploadPath();
  try {
    await fs.access(uploadDir);
    console.log('Upload directory exists:', uploadDir);
  } catch {
    console.log('Creating upload directory:', uploadDir);
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Initialize upload directory
ensureUploadDir().catch(console.error);

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      const uploadDir = await ensureUploadDir();
      console.log('Using upload directory:', uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error setting upload destination:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${random}${ext}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Track uploaded images
const uploadedImages = new Set();

// Initialize uploaded images from disk
async function initializeUploadedImages() {
  try {
    const uploadDir = await ensureUploadDir();
    console.log('Initializing images from:', uploadDir);
    
    const files = await fs.readdir(uploadDir);
    const validFiles = [];
    
    // Validate each file
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      try {
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          validFiles.push(file);
          const imageUrl = `/uploads/images/${file}`;
          uploadedImages.add(imageUrl);
          console.log('Added image to tracking:', imageUrl);
        }
      } catch (error) {
        console.warn(`Skipping invalid file ${file}:`, error.message);
      }
    }
    
    console.log(`Initialized ${validFiles.length} valid images from disk`);
  } catch (error) {
    console.error('Error initializing uploaded images:', error);
  }
}

// Initialize on startup
initializeUploadedImages().catch(console.error);

// Upload endpoint with error handling
router.post('/upload', (req, res) => {
  upload.single('image')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size limit exceeded. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message
      });
    } else if (err) {
      // An unknown error occurred
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    // Everything went fine
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    try {
      // Verify file was written successfully with retries
      const maxRetries = 3;
      const baseDelay = 100; // 100ms
      let retryCount = 0;
      let lastError = null;
      let filePath = null;

      while (retryCount < maxRetries) {
        try {
          const uploadDir = await ensureUploadDir();
          filePath = path.join(uploadDir, req.file.filename).replace(/\\/g, '/');
          console.log(`Verification attempt ${retryCount + 1}:`, filePath);

          // Check file exists and is accessible
          const stats = await fs.stat(filePath);
          if (!stats.isFile()) {
            throw new Error('Not a regular file');
          }

          // Verify file permissions
          const fd = await fs.open(filePath, 'r');
          await fd.close();

          console.log('File verified:', {
            size: stats.size,
            mode: stats.mode,
            created: stats.birthtime,
            modified: stats.mtime
          });

          // Success - break out of retry loop
          break;

        } catch (error) {
          lastError = error;
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount - 1);
            console.log(`Retry ${retryCount} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (retryCount === maxRetries) {
        throw new Error(`Failed to verify file after ${maxRetries} attempts: ${lastError?.message}`);
      }

      const imageUrl = `/uploads/images/${req.file.filename}`;
      uploadedImages.add(imageUrl);
      console.log('Upload successful:', imageUrl);

      res.json({
        success: true,
        url: imageUrl,
        filename: req.file.filename
      });
    } catch (error) {
      console.error('Error verifying upload:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify uploaded file'
      });
    }
  });
});

// Verify image exists
router.get('/verify', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }

    const isValid = await isValidImageUrl(url);
    if (!isValid) {
      return res.status(404).json({
        success: false,
        error: 'Image not found or invalid'
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify image'
    });
  }
});

// Get list of tracked images
router.get('/images', (req, res) => {
  res.json({
    success: true,
    images: Array.from(uploadedImages)
  });
});

// Clean up unused images
async function cleanupUnusedImages(usedImages) {
  if (!Array.isArray(usedImages)) {
    throw new Error('usedImages must be an array');
  }

  try {
    const uploadDir = await ensureUploadDir();
    console.log('Cleaning up unused images in:', uploadDir);
    console.log('Currently used images:', usedImages);

    // Get current files and validate they exist
    const files = await fs.readdir(uploadDir);
    const validFiles = [];
    
    // Validate each file
    for (const file of files) {
      const filePath = path.join(uploadDir, file).replace(/\\/g, '/');
      try {
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          validFiles.push({ name: file, path: filePath });
        }
      } catch (error) {
        console.warn(`Failed to stat file ${file}:`, error.message);
      }
    }

    console.log(`Found ${validFiles.length} valid files`);

    // Update uploadedImages Set to match actual files
    uploadedImages.clear();
    for (const file of validFiles) {
      const imageUrl = `/uploads/images/${file.name}`;
      uploadedImages.add(imageUrl);
    }

    // Delete unused files
    let deletedCount = 0;
    for (const file of validFiles) {
      const imageUrl = `/uploads/images/${file.name}`;
      if (!usedImages.includes(imageUrl)) {
        try {
          await fs.unlink(file.path);
          uploadedImages.delete(imageUrl);
          deletedCount++;
          console.log('Deleted unused file:', file.name);
        } catch (error) {
          console.warn(`Failed to delete unused image ${file.name}:`, error.message);
        }
      }
    }

    console.log(`Cleanup complete. Deleted ${deletedCount} unused files`);
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

// Clean up unused images endpoint
router.post('/cleanup', async (req, res) => {
  try {
    const { usedImages } = req.body;
    await cleanupUnusedImages(usedImages);
    res.json({ success: true });
  } catch (error) {
    console.error('Error cleaning up images:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clean up images'
    });
  }
});

// Validate image URL
async function isValidImageUrl(url) {
  if (!url.startsWith('/uploads/images/')) {
    console.warn('Invalid URL format:', url);
    return false;
  }

  console.log('Validating image URL:', url);
  
  try {
    // Get the filename from the URL
    const filename = path.basename(url);
    console.log('Filename:', filename);

    // Get the uploads directory path
    const uploadDir = await ensureUploadDir();
    console.log('Upload directory:', uploadDir);

    // Construct the full file path
    const filePath = path.join(uploadDir, filename).replace(/\\/g, '/');
    console.log('Full file path:', filePath);

    // Check if file exists
    try {
      await fs.access(filePath);
      console.log('File is accessible');
    } catch (error) {
      console.warn('File access error:', error.message);
      return false;
    }

    // Get file stats
    const stats = await fs.stat(filePath);
    console.log('File stats:', {
      size: stats.size,
      mode: stats.mode,
      created: stats.birthtime,
      modified: stats.mtime
    });

    // Verify it's a file
    if (!stats.isFile()) {
      console.warn('Path exists but is not a file');
      return false;
    }

    // Verify file permissions (should be readable)
    try {
      const fd = await fs.open(filePath, 'r');
      await fd.close();
      console.log('File is readable');
    } catch (error) {
      console.warn('File permission error:', error.message);
      return false;
    }

    return true;

  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

export {
  router,
  isValidImageUrl,
  cleanupUnusedImages
};

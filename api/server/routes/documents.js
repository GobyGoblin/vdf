import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  },
});

const router = express.Router();

// Upload document
router.post(['/', '/upload'], authenticate, authorize('candidate'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Document type is required' });
    }

    const document = await Document.create({
      userId: req.user.id,
      type,
      name: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileUrl: `/uploads/${req.file.filename}`,
      isVerified: false,
    });

    res.status(201).json({ document });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get user's documents
router.get('/my-documents', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    const enrichedDocuments = documents.map(doc => doc.toJSON());
    res.json({ documents: enrichedDocuments });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete document
router.delete('/:id', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await document.destroy();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify document (staff only)
router.patch('/:id/verify', authenticate, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { isVerified } = req.body;

    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await document.update({
      isVerified: isVerified !== undefined ? isVerified : true,
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
    });

    res.json({ document });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

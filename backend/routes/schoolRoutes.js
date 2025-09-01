const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool
} = require('../controllers/schoolController');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/schoolImages');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `school-${uniqueSuffix}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed!'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Routes
router.get('/', getSchools);
router.get('/:id', getSchoolById);
router.post('/', upload.single('image'), createSchool);
router.put('/:id', upload.single('image'), updateSchool);
router.delete('/:id', deleteSchool);

module.exports = router;

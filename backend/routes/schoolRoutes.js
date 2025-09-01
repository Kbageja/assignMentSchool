const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/schoolImages');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `school-${uniqueSuffix}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /api/schools - Get all schools
router.get('/', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Add full image URL to each school
    const schoolsWithImageUrls = schools.map(school => ({
      ...school,
      imageUrl: school.image ? `${req.protocol}://${req.get('host')}/uploads/schoolImages/${school.image}` : null
    }));
    
    res.json({
      success: true,
      data: schoolsWithImageUrls,
      count: schools.length
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schools',
      message: error.message
    });
  }
});

// GET /api/schools/:id - Get single school
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const school = await prisma.school.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!school) {
      return res.status(404).json({
        success: false,
        error: 'School not found'
      });
    }
    
    // Add full image URL
    const schoolWithImageUrl = {
      ...school,
      imageUrl: school.image ? `${req.protocol}://${req.get('host')}/uploads/schoolImages/${school.image}` : null
    };
    
    res.json({
      success: true,
      data: schoolWithImageUrl
    });
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch school',
      message: error.message
    });
  }
});

// POST /api/schools - Create new school
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, address, city, state, contact, email_id } = req.body;
    
    // Validation
    if (!name || !address || !city || !state || !contact || !email_id) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_id)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Contact validation (10-15 digits)
    const contactRegex = /^[0-9]{10,15}$/;
    if (!contactRegex.test(contact)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: 'Contact number must be 10-15 digits'
      });
    }
    
    // Check if email already exists
    const existingSchool = await prisma.school.findFirst({
      where: { email_id }
    });
    
    if (existingSchool) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: 'School with this email already exists'
      });
    }
    
    const schoolData = {
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      contact: contact.trim(),
      email_id: email_id.trim().toLowerCase(),
      image: req.file ? req.file.filename : null
    };
    
    const newSchool = await prisma.school.create({
      data: schoolData
    });
    
    // Add full image URL to response
    const schoolWithImageUrl = {
      ...newSchool,
      imageUrl: newSchool.image ? `${req.protocol}://${req.get('host')}/uploads/schoolImages/${newSchool.image}` : null
    };
    
    res.status(201).json({
      success: true,
      message: 'School created successfully',
      data: schoolWithImageUrl
    });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error creating school:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create school',
      message: error.message
    });
  }
});

// PUT /api/schools/:id - Update school
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city, state, contact, email_id } = req.body;
    
    // Check if school exists
    const existingSchool = await prisma.school.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingSchool) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        error: 'School not found'
      });
    }
    
    // Validation
    if (!name || !address || !city || !state || !contact || !email_id) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_id)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Contact validation
    const contactRegex = /^[0-9]{10,15}$/;
    if (!contactRegex.test(contact)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: 'Contact number must be 10-15 digits'
      });
    }
    
    // Check if email exists for other schools
    const emailConflict = await prisma.school.findFirst({
      where: { 
        email_id,
        NOT: { id: parseInt(id) }
      }
    });
    
    if (emailConflict) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: 'Another school with this email already exists'
      });
    }
    
    const updateData = {
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      contact: contact.trim(),
      email_id: email_id.trim().toLowerCase(),
    };
    
    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (existingSchool.image) {
        const oldImagePath = path.join(__dirname, '../uploads/schoolImages', existingSchool.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = req.file.filename;
    }
    
    const updatedSchool = await prisma.school.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    // Add full image URL to response
    const schoolWithImageUrl = {
      ...updatedSchool,
      imageUrl: updatedSchool.image ? `${req.protocol}://${req.get('host')}/uploads/schoolImages/${updatedSchool.image}` : null
    };
    
    res.json({
      success: true,
      message: 'School updated successfully',
      data: schoolWithImageUrl
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error updating school:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update school',
      message: error.message
    });
  }
});

// DELETE /api/schools/:id - Delete school
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const school = await prisma.school.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!school) {
      return res.status(404).json({
        success: false,
        error: 'School not found'
      });
    }
    
    // Delete image file if exists
    if (school.image) {
      const imagePath = path.join(__dirname, '../uploads/schoolImages', school.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await prisma.school.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({
      success: true,
      message: 'School deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete school',
      message: error.message
    });
  }
});

module.exports = router;
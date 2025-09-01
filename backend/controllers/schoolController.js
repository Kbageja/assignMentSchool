const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ✅ Get all schools
exports.getSchools = async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const schoolsWithImageUrls = schools.map(school => ({
      ...school,
      imageUrl: school.image
        ? `${req.protocol}://${req.get('host')}/uploads/schoolImages/${school.image}`
        : null
    }));

    res.json({ success: true, data: schoolsWithImageUrls, count: schools.length });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch schools', message: error.message });
  }
};

// ✅ Get single school
exports.getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;
    const school = await prisma.school.findUnique({ where: { id: parseInt(id) } });

    if (!school) return res.status(404).json({ success: false, error: 'School not found' });

    res.json({
      success: true,
      data: {
        ...school,
        imageUrl: school.image
          ? `${req.protocol}://${req.get('host')}/uploads/schoolImages/${school.image}`
          : null
      }
    });
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch school', message: error.message });
  }
};

// ✅ Create school
exports.createSchool = async (req, res) => {
  try {
    const { name, address, city, state, contact, email_id } = req.body;

    if (!name || !address || !city || !state || !contact || !email_id) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_id)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const contactRegex = /^[0-9]{10,15}$/;
    if (!contactRegex.test(contact)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Contact number must be 10-15 digits' });
    }

    const existingSchool = await prisma.school.findFirst({ where: { email_id } });
    if (existingSchool) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'School with this email already exists' });
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

    const newSchool = await prisma.school.create({ data: schoolData });

    res.status(201).json({
      success: true,
      message: 'School created successfully',
      data: {
        ...newSchool,
        imageUrl: newSchool.image
          ? `${req.protocol}://${req.get('host')}/uploads/schoolImages/${newSchool.image}`
          : null
      }
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Error creating school:', error);
    res.status(500).json({ success: false, error: 'Failed to create school', message: error.message });
  }
};

// ✅ Update school
exports.updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city, state, contact, email_id } = req.body;

    const existingSchool = await prisma.school.findUnique({ where: { id: parseInt(id) } });
    if (!existingSchool) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, error: 'School not found' });
    }

    if (!name || !address || !city || !state || !contact || !email_id) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_id)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const contactRegex = /^[0-9]{10,15}$/;
    if (!contactRegex.test(contact)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Contact number must be 10-15 digits' });
    }

    const emailConflict = await prisma.school.findFirst({
      where: { email_id, NOT: { id: parseInt(id) } }
    });
    if (emailConflict) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Another school with this email already exists' });
    }

    const updateData = {
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      contact: contact.trim(),
      email_id: email_id.trim().toLowerCase(),
    };

    if (req.file) {
      if (existingSchool.image) {
        const oldImagePath = path.join(__dirname, '../uploads/schoolImages', existingSchool.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      updateData.image = req.file.filename;
    }

    const updatedSchool = await prisma.school.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      message: 'School updated successfully',
      data: {
        ...updatedSchool,
        imageUrl: updatedSchool.image
          ? `${req.protocol}://${req.get('host')}/uploads/schoolImages/${updatedSchool.image}`
          : null
      }
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Error updating school:', error);
    res.status(500).json({ success: false, error: 'Failed to update school', message: error.message });
  }
};

// ✅ Delete school
exports.deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;

    const school = await prisma.school.findUnique({ where: { id: parseInt(id) } });
    if (!school) return res.status(404).json({ success: false, error: 'School not found' });

    if (school.image) {
      const imagePath = path.join(__dirname, '../uploads/schoolImages', school.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await prisma.school.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: 'School deleted successfully' });
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ success: false, error: 'Failed to delete school', message: error.message });
  }
};

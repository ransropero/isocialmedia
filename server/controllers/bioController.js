const BioPage = require('../models/BioPage');

const { uploadToSupabase } = require('../services/storage');

exports.getBioPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const bioPage = await BioPage.findOne({ where: { slug } });

        if (!bioPage) {
            return res.status(404).json({ message: 'Page not found' });
        }

        res.json(bioPage);
    } catch (error) {
        console.error('Error fetching bio page by slug:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyBioPages = async (req, res) => {
    try {
        const bioPages = await BioPage.findAll({ where: { userId: req.user.id } });
        res.json(bioPages);
    } catch (error) {
        console.error('Error fetching user bio pages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createBioPage = async (req, res) => {
    try {
        const { slug, title, description, backgroundColor, textColor, links } = req.body;

        // Validar limite de 5 links
        if (links && Array.isArray(links) && links.length > 5) {
            return res.status(400).json({ message: 'Maximum 5 links allowed initially' });
        }

        const bioPage = await BioPage.create({
            slug,
            title,
            description,
            backgroundColor,
            textColor,
            links: links || [],
            userId: req.user.id
        });

        res.status(201).json(bioPage);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Slug already in use' });
        }
        console.error('Error creating bio page:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateBioPage = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, backgroundColor, textColor, links, slug } = req.body;

        const bioPage = await BioPage.findOne({ where: { id, userId: req.user.id } });

        if (!bioPage) {
            return res.status(404).json({ message: 'Page not found or unauthorized' });
        }

        if (links && Array.isArray(links) && links.length > 5) {
            return res.status(400).json({ message: 'Maximum 5 links allowed' });
        }

        bioPage.title = title || bioPage.title;
        bioPage.description = description || bioPage.description;
        bioPage.backgroundColor = backgroundColor || bioPage.backgroundColor;
        bioPage.textColor = textColor || bioPage.textColor;
        bioPage.links = links || bioPage.links;
        if (slug) bioPage.slug = slug;

        await bioPage.save();
        res.json(bioPage);
    } catch (error) {
        console.error('Error updating bio page:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteBioPage = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await BioPage.destroy({ where: { id, userId: req.user.id } });

        if (!deleted) {
            return res.status(404).json({ message: 'Page not found or unauthorized' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting bio page:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const publicUrl = await uploadToSupabase(req.file);
        res.json({ url: publicUrl });
    } catch (error) {
        console.error('Error uploading bio image:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

import express from 'express';
import { Insight, User } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all insights (public)
router.get('/', async (req, res) => {
  try {
    const { category, featured, published = true } = req.query;

    const where = {};
    if (published === 'true' || published === true) {
      where.published = true;
    }
    if (category && category !== 'All') {
      where.category = category;
    }
    if (featured === 'true' || featured === true) {
      where.featured = true;
    }

    const insights = await Insight.findAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ insights });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single insight (public)
router.get('/:slug', async (req, res) => {
  try {
    const insight = await Insight.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!insight) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    res.json({ insight });
  } catch (error) {
    console.error('Get insight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create insight (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { slug, title, excerpt, category, content, readTime, featured, published, imageUrl } = req.body;

    if (!slug || !title || !excerpt || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if slug exists
    const existingInsight = await Insight.findOne({ where: { slug } });
    if (existingInsight) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const insight = await Insight.create({
      slug,
      title,
      excerpt,
      category,
      content: content || [],
      readTime,
      featured: featured || false,
      published: published || false,
      publishedAt: published ? new Date() : null,
      authorId: req.user.id,
      imageUrl,
    });

    const insightWithAuthor = await Insight.findByPk(insight.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    res.status(201).json({ insight: insightWithAuthor });
  } catch (error) {
    console.error('Create insight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update insight (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const insight = await Insight.findByPk(req.params.id);

    if (!insight) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    const { slug, title, excerpt, category, content, readTime, featured, published, imageUrl } = req.body;

    // Check if slug is being changed and if it already exists
    if (slug && slug !== insight.slug) {
      const existingInsight = await Insight.findOne({ where: { slug } });
      if (existingInsight) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }

    const updateData = {};
    if (slug) updateData.slug = slug;
    if (title) updateData.title = title;
    if (excerpt) updateData.excerpt = excerpt;
    if (category) updateData.category = category;
    if (content) updateData.content = content;
    if (readTime !== undefined) updateData.readTime = readTime;
    if (featured !== undefined) updateData.featured = featured;
    if (published !== undefined) {
      updateData.published = published;
      if (published && !insight.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    await insight.update(updateData);

    const updatedInsight = await Insight.findByPk(insight.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    res.json({ insight: updatedInsight });
  } catch (error) {
    console.error('Update insight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete insight (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const insight = await Insight.findByPk(req.params.id);

    if (!insight) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    await insight.destroy();

    res.json({ message: 'Insight deleted successfully' });
  } catch (error) {
    console.error('Delete insight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

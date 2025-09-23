import Component from '../models/Component.js';
import { cache } from '../utils/cache.js';
import { AppError } from '../utils/appError.js';

// Get all components with pagination and filtering
export const getAllComponents = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      type, 
      tags, 
      sort = 'name' 
    } = req.query;

    const cacheKey = `components:${page}:${limit}:${type}:${tags}:${sort}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const query = {};
    if (type) query.type = type;
    if (tags) query.tags = { $in: tags.split(',') };

    const components = await Component
      .find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Component.countDocuments(query);

    const response = {
      components,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    };

    cache.set(cacheKey, response);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Get component by ID
export const getComponentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const cacheKey = `component:${id}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const component = await Component.findById(id);
    
    if (!component) {
      throw new AppError('Component not found', 404);
    }

    // Increment view count
    component.views = (component.views || 0) + 1;
    await component.save();

    cache.set(cacheKey, component);
    res.json(component);
  } catch (error) {
    next(error);
  }
};

// Search components
export const searchComponents = async (req, res, next) => {
  try {
    const { q, type, tags, limit = 10 } = req.query;

    if (!q) {
      return res.json({ results: [] });
    }

    const searchQuery = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    if (type) searchQuery.type = type;
    if (tags) searchQuery.tags = { $all: tags.split(',') };

    const results = await Component
      .find(searchQuery)
      .limit(limit)
      .select('id name type description tags image')
      .exec();

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

// Create new component
export const createComponent = async (req, res, next) => {
  try {
    const component = new Component({
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date()
    });

    await component.save();
    cache.clear(); // Clear cache when data changes
    
    res.status(201).json({
      success: true,
      data: component
    });
  } catch (error) {
    next(error);
  }
};

// Update component
export const updateComponent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const component = await Component.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!component) {
      throw new AppError('Component not found', 404);
    }

    cache.clear();
    
    res.json({
      success: true,
      data: component
    });
  } catch (error) {
    next(error);
  }
};

// Delete component
export const deleteComponent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const component = await Component.findByIdAndDelete(id);

    if (!component) {
      throw new AppError('Component not found', 404);
    }

    cache.clear();
    
    res.json({
      success: true,
      message: 'Component deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
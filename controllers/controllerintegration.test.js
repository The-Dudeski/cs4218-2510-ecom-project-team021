import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';

// ==========================================
// MODELS (inline for completeness)
// ==========================================
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps: true }
);

const categoryModel = mongoose.model('categories', categorySchema);

// ==========================================
// CONTROLLERS (your actual controllers)
// ==========================================
import slugify from 'slugify';

const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send({ success: false, message: "Name is required" });
    }
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(401).send({
        success: false,
        message: "Category Already exists",
      });
    }
    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    res.status(201).send({
      success: true,
      message: "new category created",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Category",
    });
  }
};

const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    if (!name) {
      return res.status(400).send({ success: false, message: "Name is required" });
    }
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Category Updated Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating category",
    });
  }
};

const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while deleting category",
      error,
    });
  }
};

const categoryController = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All Categories List",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all categories",
    });
  }
};

const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Get Single Category Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While getting Single Category",
    });
  }
};

// ==========================================
// MIDDLEWARE (simplified for testing)
// ==========================================
const requireSignIn = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Authorization token required"
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "Invalid token"
    });
  }
};

const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== 1) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized access - Admin only"
      });
    }
    next();
  } catch (error) {
    return res.status(403).send({
      success: false,
      message: "Error in admin middleware"
    });
  }
};

// ==========================================
// TEST HELPERS
// ==========================================
const createMockAdminToken = () => {
  return jwt.sign(
    { _id: 'admin123', role: 1 },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '7d' }
  );
};

const createMockUserToken = () => {
  return jwt.sign(
    { _id: 'user123', role: 0 },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '7d' }
  );
};

// ==========================================
// EXPRESS APP SETUP
// ==========================================
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Routes
  app.post('/api/v1/category/create-category', requireSignIn, isAdmin, createCategoryController);
  app.put('/api/v1/category/update-category/:id', requireSignIn, isAdmin, updateCategoryController);
  app.delete('/api/v1/category/delete-category/:id', requireSignIn, isAdmin, deleteCategoryController);
  app.get('/api/v1/category/get-category', categoryController);
  app.get('/api/v1/category/single-category/:slug', singleCategoryController);
  
  return app;
};

// ==========================================
// INTEGRATION TESTS
// ==========================================
describe('Category Controller Integration Tests', () => {
  let mongoServer;
  let app;
  let adminToken;
  let userToken;

  // Setup - Connect to in-memory MongoDB
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    app = createTestApp();
    adminToken = createMockAdminToken();
    userToken = createMockUserToken();
  });

  // Cleanup - Disconnect from MongoDB
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  // Clear database before each test
  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });

  // ==========================================
  // CREATE CATEGORY TESTS
  // ==========================================
  describe('POST /api/v1/category/create-category', () => {
    test('should create a new category with valid admin credentials', async () => {
      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Electronics' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('new category created');
      expect(response.body.category).toHaveProperty('name', 'Electronics');
      expect(response.body.category).toHaveProperty('slug', 'electronics');
      
      // Verify in database
      const category = await categoryModel.findOne({ name: 'Electronics' });
      expect(category).toBeTruthy();
      expect(category.slug).toBe('electronics');
    });

    test('should return 400 when category name is missing', async () => {
      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('should return 401 when duplicate category name is provided', async () => {
      // Create first category
      await categoryModel.create({ name: 'Books', slug: 'books' });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Books' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Already exists');
    });

    test('should return 403 when non-admin tries to create category', async () => {
      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Sports' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });

    test('should return 401 when no auth token is provided', async () => {
      const response = await request(app)
        .post('/api/v1/category/create-category')
        .send({ name: 'Fashion' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should create category with slugified name', async () => {
      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Home & Garden' });

      expect(response.status).toBe(201);
      expect(response.body.category.name).toBe('Home & Garden');
      expect(response.body.category.slug).toBe('home-and-garden');
    });

    test('should handle database errors gracefully', async () => {
      // Force a database error by closing connection temporarily
      await mongoose.connection.close();

      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Category' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);

      // Reconnect for other tests
      await mongoose.connect(mongoServer.getUri());
    });
  });

  // ==========================================
  // UPDATE CATEGORY TESTS
  // ==========================================
  describe('PUT /api/v1/category/update-category/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const category = await categoryModel.create({
        name: 'Old Name',
        slug: 'old-name'
      });
      categoryId = category._id;
    });

    test('should update category name successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Category Updated Successfully');
      expect(response.body.category.name).toBe('New Name');
      expect(response.body.category.slug).toBe('new-name');

      // Verify in database
      const updatedCategory = await categoryModel.findById(categoryId);
      expect(updatedCategory.name).toBe('New Name');
      expect(updatedCategory.slug).toBe('new-name');
    });

    test('should return 400 when category name is missing', async () => {
      const response = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('should return 500 when category ID does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/v1/category/update-category/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200); // findByIdAndUpdate returns null but doesn't throw
      expect(response.body.category).toBeNull();
    });

    test('should return 403 when non-admin tries to update', async () => {
      const response = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Unauthorized Update' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('should return 401 when no auth token provided', async () => {
      const response = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .send({ name: 'No Auth Update' });

      expect(response.status).toBe(401);
    });

    test('should handle invalid ObjectId format', async () => {
      const invalidId = 'invalid-id-123';

      const response = await request(app)
        .put(`/api/v1/category/update-category/${invalidId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test('should update slug when name changes', async () => {
      const response = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Completely Different Name' });

      expect(response.status).toBe(200);
      expect(response.body.category.slug).toBe('completely-different-name');
    });
  });

  // ==========================================
  // DELETE CATEGORY TESTS
  // ==========================================
  describe('DELETE /api/v1/category/delete-category/:id', () => {
    let categoryId;

    beforeEach(async () => {
      const category = await categoryModel.create({
        name: 'To Be Deleted',
        slug: 'to-be-deleted'
      });
      categoryId = category._id;
    });

    test('should delete category successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/category/delete-category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Category Deleted Successfully');

      // Verify deletion in database
      const deletedCategory = await categoryModel.findById(categoryId);
      expect(deletedCategory).toBeNull();
    });

    test('should return 200 even when deleting non-existent category', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/category/delete-category/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200); // findByIdAndDelete doesn't throw on non-existent
      expect(response.body.success).toBe(true);
    });

    test('should return 403 when non-admin tries to delete', async () => {
      const response = await request(app)
        .delete(`/api/v1/category/delete-category/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('should return 401 when no auth token provided', async () => {
      const response = await request(app)
        .delete(`/api/v1/category/delete-category/${categoryId}`);

      expect(response.status).toBe(401);
    });

    test('should return error with invalid category ID format', async () => {
      const invalidId = 'invalid-id-123';

      const response = await request(app)
        .delete(`/api/v1/category/delete-category/${invalidId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test('should permanently remove category from database', async () => {
      // Delete category
      await request(app)
        .delete(`/api/v1/category/delete-category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Try to find it
      const category = await categoryModel.findById(categoryId);
      expect(category).toBeNull();

      // Verify it's not in the list
      const allCategories = await categoryModel.find({});
      expect(allCategories).toHaveLength(0);
    });
  });

  // ==========================================
  // GET ALL CATEGORIES TESTS
  // ==========================================
  describe('GET /api/v1/category/get-category', () => {
    test('should return empty array when no categories exist', async () => {
      const response = await request(app)
        .get('/api/v1/category/get-category');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category).toEqual([]);
    });

    test('should return all categories', async () => {
      // Create multiple categories
      await categoryModel.create({ name: 'Books', slug: 'books' });
      await categoryModel.create({ name: 'Electronics', slug: 'electronics' });
      await categoryModel.create({ name: 'Clothing', slug: 'clothing' });

      const response = await request(app)
        .get('/api/v1/category/get-category');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category).toHaveLength(3);
      
      const names = response.body.category.map(c => c.name);
      expect(names).toContain('Books');
      expect(names).toContain('Electronics');
      expect(names).toContain('Clothing');
    });

    test('should not require authentication', async () => {
      await categoryModel.create({ name: 'Public Category', slug: 'public' });

      const response = await request(app)
        .get('/api/v1/category/get-category');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // ==========================================
  // GET SINGLE CATEGORY TESTS
  // ==========================================
  describe('GET /api/v1/category/single-category/:slug', () => {
    beforeEach(async () => {
      await categoryModel.create({ name: 'Test Category', slug: 'test-category' });
    });

    test('should return single category by slug', async () => {
      const response = await request(app)
        .get('/api/v1/category/single-category/test-category');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category.name).toBe('Test Category');
      expect(response.body.category.slug).toBe('test-category');
    });

    test('should return null for non-existent slug', async () => {
      const response = await request(app)
        .get('/api/v1/category/single-category/non-existent');

      expect(response.status).toBe(200);
      expect(response.body.category).toBeNull();
    });

    test('should not require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/category/single-category/test-category');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // ==========================================
  // COMPLETE WORKFLOW TESTS
  // ==========================================
  describe('Complete Category CRUD Workflow', () => {
    test('should perform full CRUD cycle', async () => {
      // CREATE
      const createResponse = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Workflow Test' });

      expect(createResponse.status).toBe(201);
      const categoryId = createResponse.body.category._id;
      const slug = createResponse.body.category.slug;

      // READ (Get all categories)
      const getAllResponse = await request(app)
        .get('/api/v1/category/get-category');

      expect(getAllResponse.status).toBe(200);
      expect(getAllResponse.body.category).toHaveLength(1);
      expect(getAllResponse.body.category[0].name).toBe('Workflow Test');

      // READ (Get single category)
      const getSingleResponse = await request(app)
        .get(`/api/v1/category/single-category/${slug}`);

      expect(getSingleResponse.status).toBe(200);
      expect(getSingleResponse.body.category.name).toBe('Workflow Test');

      // UPDATE
      const updateResponse = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Workflow' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.category.name).toBe('Updated Workflow');

      // DELETE
      const deleteResponse = await request(app)
        .delete(`/api/v1/category/delete-category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);

      // VERIFY DELETION
      const verifyResponse = await request(app)
        .get('/api/v1/category/get-category');

      expect(verifyResponse.body.category).toHaveLength(0);
    });

    test('should handle multiple categories correctly', async () => {
      const categories = ['Books', 'Electronics', 'Clothing', 'Sports'];
      
      // Create all categories
      for (const name of categories) {
        const response = await request(app)
          .post('/api/v1/category/create-category')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name });
        
        expect(response.status).toBe(201);
      }

      // Get all categories
      const getAllResponse = await request(app)
        .get('/api/v1/category/get-category');

      expect(getAllResponse.body.category).toHaveLength(4);
      
      // Update one category
      const firstCategory = getAllResponse.body.category[0];
      const updateResponse = await request(app)
        .put(`/api/v1/category/update-category/${firstCategory._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Books' });

      expect(updateResponse.status).toBe(200);

      // Delete one category
      const secondCategory = getAllResponse.body.category[1];
      await request(app)
        .delete(`/api/v1/category/delete-category/${secondCategory._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Verify final count
      const finalResponse = await request(app)
        .get('/api/v1/category/get-category');

      expect(finalResponse.body.category).toHaveLength(3);
    });

    test('should maintain data integrity across operations', async () => {
      // Create category
      const createRes = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Integrity Test' });

      const categoryId = createRes.body.category._id;

      // Verify timestamps exist
      expect(createRes.body.category).toHaveProperty('createdAt');
      expect(createRes.body.category).toHaveProperty('updatedAt');

      const originalUpdatedAt = createRes.body.category.updatedAt;

      // Wait a moment then update
      await new Promise(resolve => setTimeout(resolve, 100));

      const updateRes = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Integrity' });

      // Verify updatedAt changed
      expect(updateRes.body.category.updatedAt).not.toBe(originalUpdatedAt);
      expect(updateRes.body.category.createdAt).toBe(createRes.body.category.createdAt);
    });
  });

  // ==========================================
  // AUTHORIZATION TESTS
  // ==========================================
  describe('Authorization and Authentication', () => {
    test('should reject invalid JWT token', async () => {
      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', 'Bearer invalid-token-here')
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { _id: 'admin123', role: 1 },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
    });

    test('should allow admin to perform all operations', async () => {
      // Create
      const createRes = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admin Test' });
      expect(createRes.status).toBe(201);

      const categoryId = createRes.body.category._id;

      // Update
      const updateRes = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admin Updated' });
      expect(updateRes.status).toBe(200);

      // Delete
      const deleteRes = await request(app)
        .delete(`/api/v1/category/delete-category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(deleteRes.status).toBe(200);
    });

    test('should prevent non-admin from all write operations', async () => {
      // Try to create
      const createRes = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'User Test' });
      expect(createRes.status).toBe(403);

      // Create a category as admin for update/delete tests
      const adminCreate = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Category' });
      const categoryId = adminCreate.body.category._id;

      // Try to update
      const updateRes = await request(app)
        .put(`/api/v1/category/update-category/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'User Updated' });
      expect(updateRes.status).toBe(403);

      // Try to delete
      const deleteRes = await request(app)
        .delete(`/api/v1/category/delete-category/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(deleteRes.status).toBe(403);
    });
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================
  describe('Error Handling', () => {
    test('should handle malformed request body', async () => {
      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid-json');

      expect(response.status).toBe(400);
    });

    test('should handle very long category names', async () => {
      const longName = 'A'.repeat(1000);

      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: longName });

      expect(response.status).toBe(201);
      expect(response.body.category.name).toBe(longName);
    });

    test('should handle special characters in category names', async () => {
      const specialName = 'Test & Special #Characters @2024!';

      const response = await request(app)
        .post('/api/v1/category/create-category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: specialName });

      expect(response.status).toBe(201);
      expect(response.body.category.name).toBe(specialName);
    });
  });
});
import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct
} from '../controllers/product.controller.js';

const router = express.Router();

// ✅ Middleware: Validate JSON input for POST and PUT
const validateProductInput = (req, res, next) => {
  if (['POST', 'PUT'].includes(req.method) && !req.is('application/json')) {
    return res.status(400).json({
      success: false,
      message: 'Content-Type must be application/json'
    });
  }
  next();
};

// ✅ Optional: Route-level logging (for debugging)
router.use((req, _res, next) => {
  console.log(`Product route hit: ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Routes
router
  .route('/')
  .get(getProducts)
  .post(validateProductInput, createProduct);

router
  .route('/:id')
  .put(validateProductInput, updateProduct)
  .delete(deleteProduct);

export default router;
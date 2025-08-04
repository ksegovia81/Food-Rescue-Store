import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct
} from '../controllers/product.controller.js';

const router = express.Router();

// Input validation middleware
const validateProductInput = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    if (!req.is('application/json')) {
      return res.status(400).json({
        success: false,
        message: "Content-Type must be application/json"
      });
    }
  }
  next();
};

router.get('/', getProducts);
router.post('/', validateProductInput, createProduct);
router.put('/:id', validateProductInput, updateProduct);
router.delete('/:id', deleteProduct);

export default router;
import mongoose from 'mongoose';
import Product from '../models/product.model.js';

// ✅ Centralized error handler
const handleServerError = (res, error, message = "Internal server error") => {
  console.error('Controller error:', error);
  res.status(500).json({
    success: false,
    message,
    error: error.message
  });
};

// ✅ Helper: Validate required product fields
const isValidProductData = ({ name, originalPrice, discountPrice, image, category, quantity }) => {
  return (
    typeof name === 'string' && name.trim() &&
    !isNaN(originalPrice) &&
    !isNaN(discountPrice) &&
    typeof image === 'string' && image.trim() &&
    typeof category === 'string' && category.trim() &&
    !isNaN(quantity)
  );
};

// ✅ GET /api/products
export const getProducts = async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

// ✅ POST /api/products
export const createProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      originalPrice,
      discountPrice,
      image,
      category,
      quantity,
      expirationDate,
      description
    } = req.body;

    if (!isValidProductData(req.body)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid product data"
      });
    }

    const newProduct = new Product({
      name: name.trim(),
      originalPrice: parseFloat(originalPrice),
      discountPrice: parseFloat(discountPrice),
      image: image.trim(),
      category: category.trim(),
      quantity: parseInt(quantity),
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      description: description?.trim() || ""
    });

    const savedProduct = await newProduct.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      product: savedProduct
    });
  } catch (error) {
    await session.abortTransaction();
    handleServerError(res, error, "Product creation failed");
  } finally {
    session.endSession();
  }
};

// ✅ PUT /api/products/:id
export const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  const allowedFields = [
    'name',
    'originalPrice',
    'discountPrice',
    'image',
    'category',
    'quantity',
    'expirationDate',
    'description'
  ];

  const updateData = {};
  for (const field of allowedFields) {
    const value = req.body[field];
    if (value !== undefined) {
      updateData[field] =
        field === 'expirationDate' ? new Date(value) :
        typeof value === 'string' ? value.trim() :
        value;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one field to update"
    });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    handleServerError(res, error, "Product update failed");
  }
};

// ✅ DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing product ID"
    });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct
    });
  } catch (error) {
    handleServerError(res, error, "Failed to delete product");
  }
};
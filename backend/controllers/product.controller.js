import mongoose from 'mongoose';
import Product from '../models/product.model.js';

// Helper function for error handling
const handleServerError = (res, error) => {
  console.error('Controller error:', error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message
  });
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    handleServerError(res, error);
  }
};

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
    console.log('Incoming product data:', req.body);


    // Basic validation
    if (
      !name?.trim() ||
      isNaN(originalPrice) ||
      isNaN(discountPrice) ||
      !image?.trim() ||
      !category?.trim() ||
      isNaN(quantity)
    ) {
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

    return res.status(201).json({
      success: true,
      product: savedProduct
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Create product failed:', error);
    return res.status(500).json({
      success: false,
      message: "Product creation failed",
      error: error.message
    });
  } finally {
    session.endSession();
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
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

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    // Check if at least one field is provided
    if (
      !name &&
      !originalPrice &&
      !discountPrice &&
      !image &&
      !category &&
      !quantity &&
      !expirationDate &&
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update"
      });
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (originalPrice) updateData.originalPrice = parseFloat(originalPrice);
    if (discountPrice) updateData.discountPrice = parseFloat(discountPrice);
    if (image) updateData.image = image.trim();
    if (category) updateData.category = category.trim();
    if (quantity) updateData.quantity = parseInt(quantity);
    if (expirationDate) updateData.expirationDate = new Date(expirationDate);
    if (description) updateData.description = description.trim();

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

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    handleServerError(res, error);
  }
};


export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    // Validate ID exists and is valid
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
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

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            deletedProduct // Optional: return deleted document
        });
    } catch (error) {
        console.error('Delete error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message
        });
    }
};
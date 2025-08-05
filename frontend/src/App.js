import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ShoppingBag } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/products';

const FoodRescueApp = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    discountPrice: '',
    originalPrice: '',
    category: '',
    description: '',
    expirationDate: '',
    quantity: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products || data.data || []);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new product
  const createProduct = async (productData) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProducts([...products, data.product || data.data]);
        resetForm();
        setShowAddForm(false);
      } else {
        setError(data.message || 'Failed to create product');
      }
    } catch (err) {
      setError('Error creating product');
      console.error('Create error:', err);
    }
  };

  // Update product
  const updateProduct = async (id, productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(products.map(p => p._id === id ? (data.product || data.data) : p));
        setEditingProduct(null);
        resetForm();
      } else {
        setError(data.message || 'Failed to update product');
      }
    } catch (err) {
      setError('Error updating product');
      console.error('Update error:', err);
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(products.filter(p => p._id !== id));
      } else {
        setError(data.message || 'Failed to delete product');
      }
    } catch (err) {
      setError('Error deleting product');
      console.error('Delete error:', err);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const productData = {
      ...formData,
      discountPrice: parseFloat(formData.discountPrice),
      originalPrice: parseFloat(formData.originalPrice),
      quantity: parseInt(formData.quantity)
    };

    if (editingProduct) {
      updateProduct(editingProduct._id, productData);
    } else {
      createProduct(productData);
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      discountPrice: product.discountPrice?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category || '',
      description: product.description || '',
      expirationDate: product.expirationDate ? product.expirationDate.split('T')[0] : '',
      quantity: product.quantity?.toString() || '',
      image: product.image || ''
    });
    setImagePreview(product.image || '');
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      discountPrice: '',
      originalPrice: '',
      category: '',
      description: '',
      expirationDate: '',
      quantity: '',
      image: ''
    });
    setImagePreview('');
    setEditingProduct(null);
    setError('');
  };

  const cancelForm = () => {
    resetForm();
    setShowAddForm(false);
  };

  const calculateDiscount = (originalPrice, discountPrice) => {
    if (!originalPrice || !discountPrice) return 0;
    return Math.round((1 - discountPrice / originalPrice) * 100);
  };

  const isExpiringSoon = (expirationDate) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      backgroundColor: '#059669',
      color: 'white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    title: {
      fontSize: '30px',
      fontWeight: 'bold',
      margin: 0
    },
    subtitle: {
      color: '#d1fae5',
      margin: 0
    },
    addButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      transition: 'background-color 0.2s'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 16px'
    },
    errorBox: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    errorClose: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#dc2626',
      cursor: 'pointer',
      fontSize: '16px'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '4px'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    select: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: 'white'
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      minHeight: '80px',
      resize: 'vertical'
    },
    buttonRow: {
      display: 'flex',
      gap: '12px',
      paddingTop: '16px'
    },
    primaryButton: {
      flex: 1,
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '14px'
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: '#d1d5db',
      color: '#374151',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '14px'
    },
    loading: {
      textAlign: 'center',
      padding: '48px 0'
    },
    spinner: {
      display: 'inline-block',
      width: '32px',
      height: '32px',
      border: '3px solid #f3f4f6',
      borderTop: '3px solid #059669',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 0'
    },
    emptyIcon: {
      color: '#9ca3af',
      marginBottom: '16px'
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '500',
      color: '#111827',
      marginBottom: '8px'
    },
    emptyText: {
      color: '#6b7280',
      marginBottom: '16px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s'
    },
    cardContent: {
      padding: '24px'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: 0,
      flex: 1
    },
    cardActions: {
      display: 'flex',
      gap: '4px',
      marginLeft: '8px'
    },
    iconButton: {
      padding: '8px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      transition: 'background-color 0.2s'
    },
    editButton: {
      color: '#2563eb'
    },
    deleteButton: {
      color: '#dc2626'
    },
    badge: {
      display: 'inline-block',
      backgroundColor: '#d1fae5',
      color: '#065f46',
      fontSize: '12px',
      padding: '2px 8px',
      borderRadius: '12px',
      marginBottom: '12px'
    },
    priceRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    currentPrice: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#059669'
    },
    priceInfo: {
      textAlign: 'right'
    },
    originalPrice: {
      fontSize: '14px',
      color: '#6b7280',
      textDecoration: 'line-through'
    },
    discount: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#dc2626',
      marginLeft: '8px'
    },
    productDetail: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    expiringText: {
      color: '#dc2626',
      fontWeight: '500'
    },
    expiringSoon: {
      fontSize: '12px',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      padding: '1px 4px',
      borderRadius: '4px',
      marginLeft: '4px'
    },
    fileInput: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: 'white'
    },
    imagePreview: {
      width: '100%',
      maxWidth: '200px',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '6px',
      border: '2px solid #e5e7eb',
      marginTop: '8px'
    },
    noImagePlaceholder: {
      width: '100%',
      maxWidth: '200px',
      height: '150px',
      backgroundColor: '#f3f4f6',
      borderRadius: '6px',
      border: '2px dashed #d1d5db',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6b7280',
      fontSize: '14px',
      marginTop: '8px'
    },
    productImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      borderRadius: '6px 6px 0 0'
    },
    cardImagePlaceholder: {
      width: '100%',
      height: '200px',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: '14px',
      borderRadius: '6px 6px 0 0'
    },
  };

  // Add CSS animation for spinner
  const spinnerCSS = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{spinnerCSS}</style>
      
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <ShoppingBag size={32} />
            <div>
              <h1 style={styles.title}>Food Rescue Store</h1>
              <p style={styles.subtitle}>Manage your discounted products</p>
            </div>
          </div>
          <button
            style={styles.addButton}
            onClick={() => setShowAddForm(true)}
            onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>
        </div>
      </header>

      <div style={styles.main}>
        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <span>{error}</span>
            <button 
              style={styles.errorClose}
              onClick={() => setError('')}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Name *</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Fresh Bread"
                    onFocus={(e) => e.target.style.borderColor = '#059669'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>Original Price *</label>
                    <input
                      style={styles.input}
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      onFocus={(e) => e.target.style.borderColor = '#059669'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Discount Price *</label>
                    <input
                      style={styles.input}
                      type="number"
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      onFocus={(e) => e.target.style.borderColor = '#059669'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Image</label>
                  <input
                    style={styles.fileInput}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={styles.imagePreview}
                    />
                  ) : (
                    <div style={styles.noImagePlaceholder}>
                      No image selected
                    </div>
                  )}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.select}
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    <option value="Bakery">Bakery & Bread</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Meals">Entire Meals</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Drinks">Drinks & Beverages</option>
                    <option value="Sandwiches">Sandwiches</option>
                    <option value="Burgers">Burgers</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Meat">Meat</option>
                    <option value="Prepared Food">Prepared Food</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>Quantity</label>
                    <input
                      style={styles.input}
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="1"
                      onFocus={(e) => e.target.style.borderColor = '#059669'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Expiration Date</label>
                    <input
                      style={styles.input}
                      type="date"
                      name="expirationDate"
                      value={formData.expirationDate}
                      onChange={handleInputChange}
                      onFocus={(e) => e.target.style.borderColor = '#059669'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={styles.textarea}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Product description..."
                    onFocus={(e) => e.target.style.borderColor = '#059669'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div style={styles.buttonRow}>
                  <button
                    style={styles.primaryButton}
                    onClick={handleSubmit}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                  >
                    <Save size={16} />
                    <span>{editingProduct ? 'Update' : 'Create'}</span>
                  </button>
                  <button
                    style={styles.secondaryButton}
                    onClick={cancelForm}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#9ca3af'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#d1d5db'}
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Content */}
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p style={{marginTop: '8px', color: '#6b7280'}}>Loading products...</p>
          </div>
        ) : !products || products.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <ShoppingBag size={48} />
            </div>
            <h3 style={styles.emptyTitle}>No products yet</h3>
            <p style={styles.emptyText}>Add your first discounted product to get started</p>
            <button
              style={styles.primaryButton}
              onClick={() => setShowAddForm(true)}
              onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
            >
              Add Product
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {products && products.map((product) => (
              <div key={product._id} style={styles.card}>
                {/* Product Image */}
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    style={styles.productImage}
                  />
                ) : (
                  <div style={styles.cardImagePlaceholder}>
                    No Image
                  </div>
                )}
                
                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{product.name}</h3>
                    <div style={styles.cardActions}>
                      <button
                        style={{...styles.iconButton, ...styles.editButton}}
                        onClick={() => startEdit(product)}
                        title="Edit product"
                        onMouseOver={(e) => e.target.style.backgroundColor = '#dbeafe'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        style={{...styles.iconButton, ...styles.deleteButton}}
                        onClick={() => deleteProduct(product._id)}
                        title="Delete product"
                        onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {product.category && (
                    <span style={styles.badge}>{product.category}</span>
                  )}

                  <div style={{marginBottom: '16px'}}>
                    <div style={styles.priceRow}>
                      <span style={styles.currentPrice}>
                        ${product.discountPrice?.toFixed(2) || '0.00'}
                      </span>
                      {product.originalPrice && (
                        <div style={styles.priceInfo}>
                          <span style={styles.originalPrice}>
                            ${product.originalPrice.toFixed(2)}
                          </span>
                          <span style={styles.discount}>
                            {calculateDiscount(product.originalPrice, product.discountPrice)}% off
                          </span>
                        </div>
                      )}
                    </div>

                    {product.quantity && (
                      <p style={styles.productDetail}>
                        Quantity: {product.quantity}
                      </p>
                    )}

                    {product.expirationDate && (
                      <p style={{...styles.productDetail, ...(isExpiringSoon(product.expirationDate) ? styles.expiringText : {})}}>
                        Expires: {new Date(product.expirationDate).toLocaleDateString()}
                        {isExpiringSoon(product.expirationDate) && (
                          <span style={styles.expiringSoon}>Soon!</span>
                        )}
                      </p>
                    )}
                  </div>

                  {product.description && (
                    <p style={styles.description}>{product.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodRescueApp;

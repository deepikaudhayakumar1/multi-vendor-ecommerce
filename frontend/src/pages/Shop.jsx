import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Search, Filter, ShoppingCart, Heart, Check, Star } from 'lucide-react';

const Shop = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartSuccess, setCartSuccess] = useState('');

  useEffect(() => {
    API.get('/products?status=ACTIVE')
      .then((res) => setProducts(res.data))
      .catch(() => {});

    API.get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === Number(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((item) => item.productId === product.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.basePrice,
        mrp: product.mrp,
        quantity: 1,
        vendorId: product.vendorId,
        imageUrl: product.imageUrl,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartSuccess(`Added "${product.name}" to your shopping cart!`);
    setTimeout(() => setCartSuccess(''), 3000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Marketplace Catalogue</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Browse GST-compliant products from verified marketplace vendors</p>
        </div>
      </div>

      {cartSuccess && <div className="alert alert-success">{cartSuccess}</div>}

      {/* Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search products by title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '200px' }}>
          <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (GST {c.gstRate}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid-3">
        {filteredProducts.map((product) => (
          <div key={product.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ height: '180px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '1rem', background: '#000' }}>
                <img
                  src={product.imageUrl || 'https://picsum.photos/400/300'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
                Verified Vendor Product
              </span>

              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{product.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', height: '40px', overflow: 'hidden' }}>
                {product.description}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-light)' }}>
                    ₹{product.basePrice}
                  </span>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                    ₹{product.mrp}
                  </span>
                </div>
                <span className="badge badge-success">Stock: {product.stock}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedProduct(product)}
                >
                  View Details
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1rem' }}>{selectedProduct.name}</h2>
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.name}
              style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
            />
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{selectedProduct.description}</p>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selling Price</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-light)' }}>₹{selectedProduct.basePrice}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MRP</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, textDecoration: 'line-through' }}>₹{selectedProduct.mrp}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Applicable GST</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedProduct.gstRate}%</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Close</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;

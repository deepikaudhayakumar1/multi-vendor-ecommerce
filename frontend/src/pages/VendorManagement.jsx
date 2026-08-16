import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import AddProduct from '../components/AddProduct';// AddProduct component import
import { PlusCircle, Upload } from 'lucide-react';

const VendorManagement = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      loadVendorProducts();
    }
  }, [user]);

  const loadVendorProducts = () => {
    API.get(`/products/vendor/${user.id}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error loading products:", err));
  };

  const handleSuccess = () => {
    setSuccess('Product submitted successfully with images!');
    setShowModal(false);
    loadVendorProducts();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Vendor Product & Inventory Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            GSTIN Verified Business: <span className="badge badge-success">{user?.gstin || '27AAAAA0000A1Z5'}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary">
            <Upload size={16} /> Bulk CSV Upload
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <PlusCircle size={16} /> Add Product Listing
          </button>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>My Product Catalogue</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Title</th>
                <th>Selling Price</th>
                <th>MRP</th>
                <th>Stock</th>
                <th>GST Rate</th>
                <th>Approval Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>₹{p.basePrice || p.sellingPrice}</td>
                  <td>₹{p.mrp}</td>
                  <td>
                    <span className={`badge ${p.stock < 10 ? 'badge-warning' : 'badge-success'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td>{p.gstRate}%</td>
                  <td>
                    <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Triggering AddProduct modal that supports real file uploads */}
      {showModal && (
        <AddProduct 
          onClose={() => setShowModal(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
};

export default VendorManagement;

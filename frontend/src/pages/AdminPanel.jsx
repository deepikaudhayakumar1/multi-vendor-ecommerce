import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Shield, Check, X, UserCheck, AlertTriangle } from 'lucide-react';

const AdminPanel = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('PRODUCTS');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    API.get('/products')
      .then((res) => {
        setPendingProducts(res.data.filter((p) => p.status === 'PENDING_REVIEW' || p.status === 'ACTIVE'));
      })
      .catch(() => {});

    API.get('/admin/users')
      .then((res) => setUsers(res.data))
      .catch(() => {});
  };

  const approveProduct = async (id) => {
    try {
      await API.put(`/products/${id}/status`, { status: 'ACTIVE' });
      loadData();
    } catch (err) {
      alert('Failed to approve product');
    }
  };

  const suspendProduct = async (id) => {
    try {
      await API.put(`/products/${id}/status`, { status: 'SUSPENDED' });
      loadData();
    } catch (err) {
      alert('Failed to suspend product');
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await API.put(`/admin/users/${id}/status`, { status: nextStatus });
      loadData();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Administrator & Category Manager Panel</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Marketplace Quality Review Queue & User Lifecycle Governance</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeTab === 'PRODUCTS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('PRODUCTS')}
        >
          Category Manager Product Review Queue ({pendingProducts.filter((p) => p.status === 'PENDING_REVIEW').length})
        </button>
        <button
          className={`btn ${activeTab === 'USERS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('USERS')}
        >
          User Accounts & Role RBAC Controls ({users.length})
        </button>
      </div>

      {activeTab === 'PRODUCTS' && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Product Listings Review Queue</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Title</th>
                  <th>Vendor ID</th>
                  <th>MRP</th>
                  <th>Selling Price</th>
                  <th>Status</th>
                  <th>Governance Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingProducts.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>Vendor #{p.vendorId}</td>
                    <td>₹{p.mrp}</td>
                    <td>₹{p.basePrice}</td>
                    <td>
                      <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {p.status !== 'ACTIVE' && (
                          <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => approveProduct(p.id)}>
                            <Check size={14} /> Approve Listing
                          </button>
                        )}
                        {p.status === 'ACTIVE' && (
                          <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => suspendProduct(p.id)}>
                            <X size={14} /> Suspend Listing
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Registered Users & Role Matrix</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Account Controls</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td><span className="badge badge-primary">{u.role}</span></td>
                    <td>
                      <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn ${u.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        onClick={() => toggleUserStatus(u.id, u.status)}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

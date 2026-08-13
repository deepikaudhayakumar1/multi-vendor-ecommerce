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

// import React, { useState, useEffect, useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import API from '../services/api';
// import { PlusCircle, Upload, Package, AlertCircle } from 'lucide-react';

// const VendorManagement = () => {
//   const { user } = useContext(AuthContext);
//   const [products, setProducts] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [basePrice, setBasePrice] = useState('');
//   const [mrp, setMrp] = useState('');
//   const [stock, setStock] = useState('');
//   const [categoryId, setCategoryId] = useState(1);

//   useEffect(() => {
//     if (user) {
//       loadVendorProducts();
//     }
//   }, [user]);

//   const loadVendorProducts = () => {
//     API.get(`/products/vendor/${user.id}`)
//       .then((res) => setProducts(res.data))
//       .catch(() => {});
//   };

//   const handleCreateProduct = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     const bp = parseFloat(basePrice);
//     const m = parseFloat(mrp);
//     const s = parseInt(stock);

//     if (isNaN(bp) || isNaN(m) || bp <= 0 || bp > m) {
//       setError('Selling price must be a positive number not exceeding MRP');
//       return;
//     }

//     if (isNaN(s) || s < 0) {
//       setError('Stock quantity cannot be negative');
//       return;
//     }

//     try {
//       const payload = {
//         vendorId: user.id,
//         name,
//         description,
//         basePrice: bp,
//         mrp: m,
//         stock: s,
//         categoryId: Number(categoryId),
//       };

//       await API.post('/products', payload);
//       setSuccess('Product submitted! Sent to Category Manager for quality review queue approval.');
//       setShowModal(false);
//       setName('');
//       setDescription('');
//       setBasePrice('');
//       setMrp('');
//       setStock('');
//       loadVendorProducts();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Product creation failed');
//     }
//   };

//   return (
//     <div>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
//         <div>
//           <h1 style={{ fontSize: '2rem' }}>Vendor Product & Inventory Management</h1>
//           <p style={{ color: 'var(--text-secondary)' }}>
//             GSTIN Verified Business: <span className="badge badge-success">{user?.gstin || '27AAAAA0000A1Z5'}</span>
//           </p>
//         </div>
//         <div style={{ display: 'flex', gap: '1rem' }}>
//           <button className="btn btn-secondary">
//             <Upload size={16} /> Bulk CSV Upload
//           </button>
//           <button className="btn btn-primary" onClick={() => setShowModal(true)}>
//             <PlusCircle size={16} /> Add Product Listing
//           </button>
//         </div>
//       </div>

//       {success && <div className="alert alert-success">{success}</div>}
//       {error && <div className="alert alert-danger">{error}</div>}

//       <div className="glass-card">
//         <h3 style={{ marginBottom: '1rem' }}>My Product Catalogue</h3>
//         <div className="table-container">
//           <table className="custom-table">
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Product Title</th>
//                 <th>Selling Price</th>
//                 <th>MRP</th>
//                 <th>Stock</th>
//                 <th>GST Rate</th>
//                 <th>Approval Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {products.map((p) => (
//                 <tr key={p.id}>
//                   <td>#{p.id}</td>
//                   <td><strong>{p.name}</strong></td>
//                   <td>₹{p.basePrice}</td>
//                   <td>₹{p.mrp}</td>
//                   <td>
//                     <span className={`badge ${p.stock < 10 ? 'badge-warning' : 'badge-success'}`}>
//                       {p.stock} units
//                     </span>
//                   </td>
//                   <td>{p.gstRate}%</td>
//                   <td>
//                     <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
//                       {p.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginBottom: '1rem' }}>Add Product Listing</h2>
//             <form onSubmit={handleCreateProduct}>
//               <div className="form-group">
//                 <label className="form-label">Product Name / Title</label>
//                 <input
//                   type="text"
//                   className="form-input"
//                   placeholder="e.g. Wireless Ergonomic Mouse"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Category</label>
//                 <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
//                   <option value="1">Electronics (GST 18%)</option>
//                   <option value="2">Fashion (GST 12%)</option>
//                   <option value="3">Home & Kitchen (GST 18%)</option>
//                 </select>
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Description</label>
//                 <textarea
//                   className="form-textarea"
//                   rows="3"
//                   placeholder="Detailed product specifications..."
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                 />
//               </div>

//               <div className="grid-2">
//                 <div className="form-group">
//                   <label className="form-label">Maximum Retail Price (MRP)</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     className="form-input"
//                     placeholder="1999.00"
//                     value={mrp}
//                     onChange={(e) => setMrp(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Selling Base Price (≤ MRP)</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     className="form-input"
//                     placeholder="1499.00"
//                     value={basePrice}
//                     onChange={(e) => setBasePrice(e.target.value)}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Initial Stock Quantity (≥ 0)</label>
//                 <input
//                   type="number"
//                   className="form-input"
//                   placeholder="50"
//                   value={stock}
//                   onChange={(e) => setStock(e.target.value)}
//                   required
//                 />
//               </div>

//               <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
//                 <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-primary">
//                   Submit Listing for Review
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VendorManagement;

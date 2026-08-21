import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import AddProduct from '../components/AddProduct';
import {
  PlusCircle,
  Upload,
  Pencil,
  Trash2,
  X,
  Save
} from 'lucide-react';

const VendorManagement = () => {

  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);

  const [showModal, setShowModal] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);


  // ============================================================
  // LOAD VENDOR PRODUCTS
  // ============================================================

  useEffect(() => {

    if (user) {
      loadVendorProducts();
    }

  }, [user]);


  const loadVendorProducts = () => {

    if (!user?.id) return;

    API.get(`/products/vendor/${user.id}`)
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {

        console.error(
          "Error loading products:",
          err
        );

        setError(
          'Failed to load your products'
        );
      });
  };


  // ============================================================
  // ADD PRODUCT SUCCESS
  // ============================================================

  const handleSuccess = () => {

    setSuccess(
      'Product submitted successfully with images!'
    );

    setError('');

    setShowModal(false);

    loadVendorProducts();

    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };


  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const handleEdit = (product) => {

    setError('');
    setSuccess('');

    setEditingProduct({
      id: product.id,
      vendorId: user.id,
      name: product.name || '',
      basePrice: product.basePrice || '',
      mrp: product.mrp || '',
      stock: product.stock ?? 0,
      description: product.description || '',
      categoryId: product.categoryId || null
    });

    setShowEditModal(true);
  };


  // ============================================================
  // HANDLE EDIT INPUT
  // ============================================================

  const handleEditChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setEditingProduct((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  // ============================================================
  // UPDATE PRODUCT
  // ============================================================

  const handleUpdate = async (e) => {

    e.preventDefault();

    setEditLoading(true);
    setError('');
    setSuccess('');

    try {

      const updateData = {
        vendorId: user.id,
        name: editingProduct.name,
        basePrice: Number(
          editingProduct.basePrice
        ),
        mrp: Number(
          editingProduct.mrp
        ),
        stock: Number(
          editingProduct.stock
        ),
        description:
          editingProduct.description
      };


      // Keep category if product already has one
      if (editingProduct.categoryId) {
        updateData.categoryId =
          editingProduct.categoryId;
      }


      const response = await API.put(
        `/products/${editingProduct.id}`,
        updateData
      );


      console.log(
        'Updated product:',
        response.data
      );


      setSuccess(
        'Product updated successfully!'
      );

      setShowEditModal(false);
      setEditingProduct(null);

      loadVendorProducts();


      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err) {

      console.error(
        'Update product error:',
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to update product'
      );

    } finally {

      setEditLoading(false);
    }
  };


  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  const handleDelete = async (product) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }


    setDeleteLoading(true);
    setError('');
    setSuccess('');

    try {

      await API.delete(
        `/products/${product.id}?vendorId=${user.id}`
      );


      setSuccess(
        `"${product.name}" deleted successfully!`
      );


      loadVendorProducts();


      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err) {

      console.error(
        'Delete product error:',
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to delete product'
      );

    } finally {

      setDeleteLoading(false);
    }
  };


  // ============================================================
  // CLOSE EDIT MODAL
  // ============================================================

  const closeEditModal = () => {

    if (editLoading) return;

    setShowEditModal(false);
    setEditingProduct(null);
  };


  return (

    <div>

      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}
      >

        <div>

          <h1 style={{ fontSize: '2rem' }}>
            Vendor Product & Inventory Management
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)'
            }}
          >
            GSTIN Verified Business:

            <span
              className="badge badge-success"
              style={{ marginLeft: '8px' }}
            >
              {user?.gstin ||
                '27AAAAA0000A1Z5'}
            </span>

          </p>

        </div>


        <div
          style={{
            display: 'flex',
            gap: '1rem'
          }}
        >

          <button
            className="btn btn-secondary"
          >
            <Upload size={16} />

            Bulk CSV Upload
          </button>


          <button
            className="btn btn-primary"
            onClick={() =>
              setShowModal(true)
            }
          >

            <PlusCircle size={16} />

            Add Product Listing

          </button>

        </div>

      </div>


      {/* ========================================================
          SUCCESS MESSAGE
      ======================================================== */}

      {success && (

        <div className="alert alert-success">

          {success}

        </div>

      )}


      {/* ========================================================
          ERROR MESSAGE
      ======================================================== */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {/* ========================================================
          PRODUCT TABLE
      ======================================================== */}

      <div className="glass-card">

        <h3
          style={{
            marginBottom: '1rem'
          }}
        >
          My Product Catalogue
        </h3>


        <div className="table-container">

          <table className="custom-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>
                  Product Title
                </th>

                <th>
                  Selling Price
                </th>

                <th>
                  MRP
                </th>

                <th>
                  Stock
                </th>

                <th>
                  GST Rate
                </th>

                <th>
                  Approval Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {products.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    style={{
                      textAlign: 'center',
                      padding: '2rem'
                    }}
                  >

                    No products found.

                  </td>

                </tr>

              ) : (

                products.map((p) => (

                  <tr key={p.id}>

                    {/* ID */}

                    <td>
                      #{p.id}
                    </td>


                    {/* NAME */}

                    <td>

                      <strong>
                        {p.name}
                      </strong>

                    </td>


                    {/* SELLING PRICE */}

                    <td>
                      ₹{p.basePrice || p.sellingPrice}
                    </td>


                    {/* MRP */}

                    <td>
                      ₹{p.mrp}
                    </td>


                    {/* STOCK */}

                    <td>

                      <span
                        className={`badge ${
                          p.stock < 10
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                      >

                        {p.stock} units

                      </span>

                    </td>


                    {/* GST */}

                    <td>
                      {p.gstRate}%
                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`badge ${
                          p.status === 'ACTIVE'
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}
                      >

                        {p.status}

                      </span>

                    </td>


                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <td>

                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'center'
                        }}
                      >

                        {/* EDIT */}

                        <button
                          className="btn btn-primary"
                          style={{
                            padding:
                              '0.4rem 0.7rem',
                            fontSize:
                              '0.8rem'
                          }}
                          onClick={() =>
                            handleEdit(p)
                          }
                          title="Edit Product"
                        >

                          <Pencil size={14} />

                          Edit

                        </button>


                        {/* DELETE */}

                        <button
                          className="btn btn-danger"
                          style={{
                            padding:
                              '0.4rem 0.7rem',
                            fontSize:
                              '0.8rem'
                          }}
                          onClick={() =>
                            handleDelete(p)
                          }
                          disabled={deleteLoading}
                          title="Delete Product"
                        >

                          <Trash2 size={14} />

                          Delete

                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ========================================================
          ADD PRODUCT MODAL
      ======================================================== */}

      {showModal && (

        <AddProduct

          onClose={() =>
            setShowModal(false)
          }

          onSuccess={handleSuccess}

        />

      )}


      {/* ========================================================
          EDIT PRODUCT MODAL
      ======================================================== */}

      {showEditModal &&
        editingProduct && (

        <div
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >

          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}
            >

              <div>

                <h2>
                  Edit Product
                </h2>

                <p
                  style={{
                    color:
                      'var(--text-secondary)',
                    marginTop: '5px'
                  }}
                >
                  Product ID #
                  {editingProduct.id}
                </p>

              </div>


              <button
                type="button"
                onClick={closeEditModal}
                disabled={editLoading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >

                <X size={24} />

              </button>

            </div>


            {/* EDIT FORM */}

            <form
              onSubmit={handleUpdate}
            >

              {/* PRODUCT NAME */}

              <div
                style={{
                  marginBottom: '1rem'
                }}
              >

                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.4rem'
                  }}
                >
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    editingProduct.name
                  }
                  onChange={
                    handleEditChange
                  }
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border:
                      '1px solid var(--border-color)',
                    background:
                      'var(--input-bg, #111827)',
                    color: 'inherit'
                  }}
                />

              </div>


              {/* PRICE + MRP */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}
              >

                {/* SELLING PRICE */}

                <div>

                  <label
                    style={{
                      display: 'block',
                      marginBottom:
                        '0.4rem'
                    }}
                  >
                    Selling Price
                  </label>

                  <input
                    type="number"
                    name="basePrice"
                    value={
                      editingProduct.basePrice
                    }
                    onChange={
                      handleEditChange
                    }
                    min="0.01"
                    step="0.01"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border:
                        '1px solid var(--border-color)',
                      background:
                        'var(--input-bg, #111827)',
                      color: 'inherit'
                    }}
                  />

                </div>


                {/* MRP */}

                <div>

                  <label
                    style={{
                      display: 'block',
                      marginBottom:
                        '0.4rem'
                    }}
                  >
                    MRP
                  </label>

                  <input
                    type="number"
                    name="mrp"
                    value={
                      editingProduct.mrp
                    }
                    onChange={
                      handleEditChange
                    }
                    min="0.01"
                    step="0.01"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border:
                        '1px solid var(--border-color)',
                      background:
                        'var(--input-bg, #111827)',
                      color: 'inherit'
                    }}
                  />

                </div>

              </div>


              {/* STOCK */}

              <div
                style={{
                  marginBottom: '1rem'
                }}
              >

                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.4rem'
                  }}
                >
                  Stock Quantity
                </label>

                <input
                  type="number"
                  name="stock"
                  value={
                    editingProduct.stock
                  }
                  onChange={
                    handleEditChange
                  }
                  min="0"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border:
                      '1px solid var(--border-color)',
                    background:
                      'var(--input-bg, #111827)',
                    color: 'inherit'
                  }}
                />

              </div>


              {/* DESCRIPTION */}

              <div
                style={{
                  marginBottom: '1.5rem'
                }}
              >

                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.4rem'
                  }}
                >
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    editingProduct.description
                  }
                  onChange={
                    handleEditChange
                  }
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border:
                      '1px solid var(--border-color)',
                    background:
                      'var(--input-bg, #111827)',
                    color: 'inherit',
                    resize: 'vertical'
                  }}
                />

              </div>


              {/* BUTTONS */}

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'flex-end',
                  gap: '1rem'
                }}
              >

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    closeEditModal
                  }
                  disabled={editLoading}
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >

                  <Save size={16} />

                  {editLoading
                    ? 'Updating...'
                    : 'Update Product'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default VendorManagement;







// import React, { useState, useEffect, useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import API from '../services/api';
// import AddProduct from '../components/AddProduct';// AddProduct component import
// import { PlusCircle, Upload } from 'lucide-react';

// const VendorManagement = () => {
//   const { user } = useContext(AuthContext);
//   const [products, setProducts] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     if (user) {
//       loadVendorProducts();
//     }
//   }, [user]);

//   const loadVendorProducts = () => {
//     API.get(`/products/vendor/${user.id}`)
//       .then((res) => setProducts(res.data))
//       .catch((err) => console.error("Error loading products:", err));
//   };

//   const handleSuccess = () => {
//     setSuccess('Product submitted successfully with images!');
//     setShowModal(false);
//     loadVendorProducts();
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
//                   <td>₹{p.basePrice || p.sellingPrice}</td>
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

//       {/* Triggering AddProduct modal that supports real file uploads */}
//       {showModal && (
//         <AddProduct 
//           onClose={() => setShowModal(false)} 
//           onSuccess={handleSuccess} 
//         />
//       )}
//     </div>
//   );
// };

// export default VendorManagement;

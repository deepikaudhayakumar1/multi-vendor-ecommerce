import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { RotateCcw } from 'lucide-react';

const Orders = () => {
  const { user } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [vendorItems, setVendorItems] = useState([]);
  const [shippingItemId, setShippingItemId] = useState(null);

  // =====================================================
  // LOAD CUSTOMER ORDERS
  // =====================================================
  const loadCustomerOrders = async () => {
    if (!user) return;

    const customerId = user.customerId ?? user.userId ?? user.id;

    console.log('CUSTOMER USER:', user);
    console.log('CUSTOMER ID:', customerId);

    if (!customerId) {
      console.error('Customer ID is missing');
      setOrders([]);
      return;
    }

    try {
      const res = await API.get(`/orders/customer/${customerId}`);

      console.log('CUSTOMER ORDERS:', res.data);

      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);

      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Response:', err.response.data);
      }

      setOrders([]);
    }
  };

  // =====================================================
  // LOAD VENDOR ORDER ITEMS
  // =====================================================
  const loadVendorItems = async () => {
    if (!user) return;

    const vendorId = user.vendorId ?? user.userId ?? user.id;

    console.log('VENDOR USER:', user);
    console.log('VENDOR ID:', vendorId);

    if (!vendorId) {
      console.error('Vendor ID is missing from logged-in user');
      setVendorItems([]);
      return;
    }

    try {
      const res = await API.get(`/orders/vendor/${vendorId}`);

      console.log('VENDOR ORDERS RESPONSE:', res.data);

      setVendorItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch vendor order items:', err);

      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Response:', err.response.data);
      }

      setVendorItems([]);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    if (!user) return;

    console.log('CURRENT LOGGED-IN USER:', user);
    console.log('CURRENT ROLE:', user.role);

    if (user.role === 'CUSTOMER') {
      loadCustomerOrders();
    } else if (user.role === 'VENDOR') {
      loadVendorItems();
    } else {
      loadCustomerOrders();
    }
  }, [user]);

  // =====================================================
  // RELOAD ORDERS AFTER ACTION
  // =====================================================
  const reloadOrders = async () => {
    if (!user) return;

    if (user.role === 'CUSTOMER') {
      await loadCustomerOrders();
    } else if (user.role === 'VENDOR') {
      await loadVendorItems();
    }
  };

  // =====================================================
  // CONFIRM ORDER
  // =====================================================
  const confirmOrder = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/confirm`);
      await reloadOrders();
    } catch (err) {
      console.error('Failed to confirm order:', err);
      alert('Failed to confirm order');
    }
  };

  // =====================================================
  // CUSTOMER - SHIP ORDER
  // =====================================================
  const shipOrder = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/ship`);
      await reloadOrders();
    } catch (err) {
      console.error('Failed to ship order:', err);

      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Response:', err.response.data);
      }

      alert('Failed to ship order');
    }
  };

  // =====================================================
  // VENDOR - SHIP SPECIFIC ORDER ITEM
  // =====================================================
  const shipVendorItem = async (itemId) => {
    if (!itemId) {
      console.error('Order item ID is missing');
      alert('Unable to ship this item: Item ID is missing');
      return;
    }

    try {
      setShippingItemId(itemId);

      console.log('MARKING ORDER ITEM AS SHIPPED');
      console.log('ITEM ID:', itemId);

      /*
       * IMPORTANT:
       *
       * This uses the ORDER ITEM ID, not the ORDER ID.
       *
       * Example:
       * Item ID = 5
       *
       * PUT:
       * /api/orders/items/5/ship
       *
       * This changes only:
       * order_items.id = 5
       *
       * PENDING -> SHIPPED
       */
      const response = await API.put(`/orders/items/${itemId}/ship`);

      console.log('SHIP ITEM RESPONSE:', response.data);

      // Reload vendor items so the new status is displayed
      await loadVendorItems();

      alert('Order item marked as shipped successfully');
    } catch (err) {
      console.error('Failed to mark order item as shipped:', err);

      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Response:', err.response.data);
      }

      alert(
        err.response?.data?.message ||
        'Failed to mark order item as shipped'
      );
    } finally {
      setShippingItemId(null);
    }
  };

  // =====================================================
  // DELIVER ORDER
  // =====================================================
  const deliverOrder = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/deliver`);
      await reloadOrders();
    } catch (err) {
      console.error('Failed to update delivery:', err);
      alert('Failed to update delivery');
    }
  };

  // =====================================================
  // RETURN ORDER
  // =====================================================
  const returnOrder = async (orderId) => {
    try {
      await API.post(`/orders/${orderId}/return`);
      await reloadOrders();
    } catch (err) {
      console.error('Failed to initiate return:', err);
      alert('Failed to initiate return');
    }
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>
          Order Lifecycle & Fulfilment Management
        </h1>

        <p style={{ color: 'var(--text-secondary)' }}>
          Track SLA timelines, shipment AWB numbers, and return workflows
        </p>
      </div>

      {/* =====================================================
          VENDOR VIEW
          ===================================================== */}
      {user?.role === 'VENDOR' ? (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>
            Vendor Order Fulfilment Items
          </h3>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Order ID</th>
                  <th>Product ID</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Commission (10%)</th>
                  <th>Item Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {vendorItems.length > 0 ? (
                  vendorItems.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>

                      <td>#{item.orderId}</td>

                      <td>#{item.productId}</td>

                      <td>{item.quantity}</td>

                      <td>₹{item.unitPrice}</td>

                      <td>₹{item.commissionAmount}</td>

                      <td>
                        <span
                          className={`badge ${
                            item.itemStatus === 'DELIVERED'
                              ? 'badge-success'
                              : item.itemStatus === 'SHIPPED'
                              ? 'badge-primary'
                              : item.itemStatus === 'RETURNED'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {item.itemStatus}
                        </span>
                      </td>

                      <td>
                        {item.itemStatus !== 'DELIVERED' &&
                        item.itemStatus !== 'RETURNED' &&
                        item.itemStatus !== 'SHIPPED' ? (
                          <button
                            className="btn btn-secondary"
                            style={{
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.8rem'
                            }}
                            onClick={() => shipVendorItem(item.id)}
                            disabled={shippingItemId === item.id}
                          >
                            {shippingItemId === item.id
                              ? 'Shipping...'
                              : 'Mark Shipped'}
                          </button>
                        ) : (
                          <span
                            style={{
                              color: 'var(--text-muted)',
                              fontSize: '0.8rem'
                            }}
                          >
                            {item.itemStatus === 'SHIPPED'
                              ? 'Shipped'
                              : 'No Action'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      No orders found for this vendor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* =====================================================
           CUSTOMER VIEW
           ===================================================== */
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>
            Customer Order History
          </h3>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Placed At</th>
                  <th>Total Amount</th>
                  <th>Payment Method</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>AWB Tracking</th>
                  <th>SLA Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                      </td>

                      <td>
                        {order.placedAt
                          ? new Date(order.placedAt).toLocaleDateString()
                          : '-'}
                      </td>

                      <td>₹{order.totalAmount}</td>

                      <td>{order.paymentMethod}</td>

                      <td>
                        <span className="badge badge-success">
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            order.orderStatus === 'DELIVERED'
                              ? 'badge-success'
                              : 'badge-primary'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      <td>
                        {order.awbNumber ? (
                          <span
                            style={{
                              fontFamily: 'monospace',
                              color: 'var(--accent-light)'
                            }}
                          >
                            {order.awbNumber}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>
                            Pending Dispatch
                          </span>
                        )}
                      </td>

                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem'
                          }}
                        >
                          {order.orderStatus === 'PLACED' && (
                            <button
                              className="btn btn-secondary"
                              style={{
                                padding: '0.3rem 0.5rem',
                                fontSize: '0.75rem'
                              }}
                              onClick={() => confirmOrder(order.id)}
                            >
                              Confirm (2h SLA)
                            </button>
                          )}

                          {order.orderStatus === 'CONFIRMED' && (
                            <button
                              className="btn btn-secondary"
                              style={{
                                padding: '0.3rem 0.5rem',
                                fontSize: '0.75rem'
                              }}
                              onClick={() => shipOrder(order.id)}
                            >
                              Dispatch & AWB
                            </button>
                          )}

                          {order.orderStatus === 'SHIPPED' && (
                            <button
                              className="btn btn-primary"
                              style={{
                                padding: '0.3rem 0.5rem',
                                fontSize: '0.75rem'
                              }}
                              onClick={() => deliverOrder(order.id)}
                            >
                              Confirm Delivery
                            </button>
                          )}

                          {order.orderStatus === 'DELIVERED' && (
                            <button
                              className="btn btn-danger"
                              style={{
                                padding: '0.3rem 0.5rem',
                                fontSize: '0.75rem'
                              }}
                              onClick={() => returnOrder(order.id)}
                            >
                              <RotateCcw size={12} />
                              Initiate Return
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;


// import React, { useEffect, useState, useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import API from '../services/api';
// import { RotateCcw } from 'lucide-react';

// const Orders = () => {
//   const { user } = useContext(AuthContext);

//   const [orders, setOrders] = useState([]);
//   const [vendorItems, setVendorItems] = useState([]);

//   // =====================================================
//   // LOAD CUSTOMER ORDERS
//   // =====================================================
//   const loadCustomerOrders = async () => {
//     if (!user) return;

//     const customerId = user.customerId ?? user.userId ?? user.id;

//     console.log('CUSTOMER USER:', user);
//     console.log('CUSTOMER ID:', customerId);

//     if (!customerId) {
//       console.error('Customer ID is missing');
//       setOrders([]);
//       return;
//     }

//     try {
//       const res = await API.get(`/orders/customer/${customerId}`);

//       console.log('CUSTOMER ORDERS:', res.data);

//       setOrders(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error('Failed to fetch customer orders:', err);

//       if (err.response) {
//         console.error('Status:', err.response.status);
//         console.error('Response:', err.response.data);
//       }

//       setOrders([]);
//     }
//   };

//   // =====================================================
//   // LOAD VENDOR ORDER ITEMS
//   // =====================================================
//   const loadVendorItems = async () => {
//     if (!user) return;

//     /*
//      * Different parts of the project may store the vendor ID
//      * under different property names.
//      *
//      * Prefer vendorId if available, otherwise userId,
//      * otherwise id.
//      */
//     const vendorId = user.vendorId ?? user.userId ?? user.id;

//     console.log('VENDOR USER:', user);
//     console.log('VENDOR ID:', vendorId);

//     if (!vendorId) {
//       console.error('Vendor ID is missing from logged-in user');
//       setVendorItems([]);
//       return;
//     }

//     try {
//       const res = await API.get(`/orders/vendor/${vendorId}`);

//       console.log('VENDOR ORDERS RESPONSE:', res.data);

//       setVendorItems(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error('Failed to fetch vendor order items:', err);

//       if (err.response) {
//         console.error('Status:', err.response.status);
//         console.error('Response:', err.response.data);
//       }

//       setVendorItems([]);
//     }
//   };

//   // =====================================================
//   // INITIAL LOAD
//   // =====================================================
//   useEffect(() => {
//     if (!user) return;

//     console.log('CURRENT LOGGED-IN USER:', user);
//     console.log('CURRENT ROLE:', user.role);

//     if (user.role === 'CUSTOMER') {
//       loadCustomerOrders();
//     } else if (user.role === 'VENDOR') {
//       loadVendorItems();
//     } else {
//       loadCustomerOrders();
//     }
//   }, [user]);

//   // =====================================================
//   // RELOAD ORDERS AFTER ACTION
//   // =====================================================
//   const reloadOrders = async () => {
//     if (!user) return;

//     if (user.role === 'CUSTOMER') {
//       await loadCustomerOrders();
//     } else if (user.role === 'VENDOR') {
//       await loadVendorItems();
//     }
//   };

//   // =====================================================
//   // CONFIRM ORDER
//   // =====================================================
//   const confirmOrder = async (orderId) => {
//     try {
//       await API.put(`/orders/${orderId}/confirm`);
//       await reloadOrders();
//     } catch (err) {
//       console.error('Failed to confirm order:', err);
//       alert('Failed to confirm order');
//     }
//   };

//   // =====================================================
//   // SHIP ORDER
//   // =====================================================
//   const shipOrder = async (orderId) => {
//     try {
//       await API.put(`/orders/${orderId}/ship`);
//       await reloadOrders();
//     } catch (err) {
//       console.error('Failed to ship order:', err);
//       alert('Failed to ship order');
//     }
//   };

//   // =====================================================
//   // DELIVER ORDER
//   // =====================================================
//   const deliverOrder = async (orderId) => {
//     try {
//       await API.put(`/orders/${orderId}/deliver`);
//       await reloadOrders();
//     } catch (err) {
//       console.error('Failed to update delivery:', err);
//       alert('Failed to update delivery');
//     }
//   };

//   // =====================================================
//   // RETURN ORDER
//   // =====================================================
//   const returnOrder = async (orderId) => {
//     try {
//       await API.post(`/orders/${orderId}/return`);
//       await reloadOrders();
//     } catch (err) {
//       console.error('Failed to initiate return:', err);
//       alert('Failed to initiate return');
//     }
//   };

//   // =====================================================
//   // UI
//   // =====================================================
//   return (
//     <div>
//       <div style={{ marginBottom: '2rem' }}>
//         <h1 style={{ fontSize: '2rem' }}>
//           Order Lifecycle & Fulfilment Management
//         </h1>

//         <p style={{ color: 'var(--text-secondary)' }}>
//           Track SLA timelines, shipment AWB numbers, and return workflows
//         </p>
//       </div>

//       {/* =====================================================
//           VENDOR VIEW
//           ===================================================== */}
//       {user?.role === 'VENDOR' ? (
//         <div className="glass-card">
//           <h3 style={{ marginBottom: '1rem' }}>
//             Vendor Order Fulfilment Items
//           </h3>

//           <div className="table-container">
//             <table className="custom-table">
//               <thead>
//                 <tr>
//                   <th>Item ID</th>
//                   <th>Order ID</th>
//                   <th>Product ID</th>
//                   <th>Quantity</th>
//                   <th>Unit Price</th>
//                   <th>Commission (10%)</th>
//                   <th>Item Status</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {vendorItems.length > 0 ? (
//                   vendorItems.map((item) => (
//                     <tr key={item.id}>
//                       <td>#{item.id}</td>

//                       <td>#{item.orderId}</td>

//                       <td>#{item.productId}</td>

//                       <td>{item.quantity}</td>

//                       <td>₹{item.unitPrice}</td>

//                       <td>₹{item.commissionAmount}</td>

//                       <td>
//                         <span className="badge badge-warning">
//                           {item.itemStatus}
//                         </span>
//                       </td>

//                       <td>
//                         {item.itemStatus !== 'DELIVERED' &&
//                         item.itemStatus !== 'RETURNED' ? (
//                           <button
//                             className="btn btn-secondary"
//                             style={{
//                               padding: '0.3rem 0.6rem',
//                               fontSize: '0.8rem'
//                             }}
//                             onClick={() => shipOrder(item.orderId)}
//                           >
//                             Mark Shipped
//                           </button>
//                         ) : (
//                           <span
//                             style={{
//                               color: 'var(--text-muted)',
//                               fontSize: '0.8rem'
//                             }}
//                           >
//                             No Action
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan="8"
//                       style={{
//                         textAlign: 'center',
//                         padding: '2rem',
//                         color: 'var(--text-muted)'
//                       }}
//                     >
//                       No orders found for this vendor.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ) : (
//         /* =====================================================
//            CUSTOMER VIEW
//            ===================================================== */
//         <div className="glass-card">
//           <h3 style={{ marginBottom: '1rem' }}>
//             Customer Order History
//           </h3>

//           <div className="table-container">
//             <table className="custom-table">
//               <thead>
//                 <tr>
//                   <th>Order ID</th>
//                   <th>Placed At</th>
//                   <th>Total Amount</th>
//                   <th>Payment Method</th>
//                   <th>Payment Status</th>
//                   <th>Order Status</th>
//                   <th>AWB Tracking</th>
//                   <th>SLA Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {orders.length > 0 ? (
//                   orders.map((order) => (
//                     <tr key={order.id}>
//                       <td>
//                         <strong>#{order.id}</strong>
//                       </td>

//                       <td>
//                         {order.placedAt
//                           ? new Date(order.placedAt).toLocaleDateString()
//                           : '-'}
//                       </td>

//                       <td>₹{order.totalAmount}</td>

//                       <td>{order.paymentMethod}</td>

//                       <td>
//                         <span className="badge badge-success">
//                           {order.paymentStatus}
//                         </span>
//                       </td>

//                       <td>
//                         <span
//                           className={`badge ${
//                             order.orderStatus === 'DELIVERED'
//                               ? 'badge-success'
//                               : 'badge-primary'
//                           }`}
//                         >
//                           {order.orderStatus}
//                         </span>
//                       </td>

//                       <td>
//                         {order.awbNumber ? (
//                           <span
//                             style={{
//                               fontFamily: 'monospace',
//                               color: 'var(--accent-light)'
//                             }}
//                           >
//                             {order.awbNumber}
//                           </span>
//                         ) : (
//                           <span style={{ color: 'var(--text-muted)' }}>
//                             Pending Dispatch
//                           </span>
//                         )}
//                       </td>

//                       <td>
//                         <div
//                           style={{
//                             display: 'flex',
//                             gap: '0.5rem'
//                           }}
//                         >
//                           {order.orderStatus === 'PLACED' && (
//                             <button
//                               className="btn btn-secondary"
//                               style={{
//                                 padding: '0.3rem 0.5rem',
//                                 fontSize: '0.75rem'
//                               }}
//                               onClick={() => confirmOrder(order.id)}
//                             >
//                               Confirm (2h SLA)
//                             </button>
//                           )}

//                           {order.orderStatus === 'CONFIRMED' && (
//                             <button
//                               className="btn btn-secondary"
//                               style={{
//                                 padding: '0.3rem 0.5rem',
//                                 fontSize: '0.75rem'
//                               }}
//                               onClick={() => shipOrder(order.id)}
//                             >
//                               Dispatch & AWB
//                             </button>
//                           )}

//                           {order.orderStatus === 'SHIPPED' && (
//                             <button
//                               className="btn btn-primary"
//                               style={{
//                                 padding: '0.3rem 0.5rem',
//                                 fontSize: '0.75rem'
//                               }}
//                               onClick={() => deliverOrder(order.id)}
//                             >
//                               Confirm Delivery
//                             </button>
//                           )}

//                           {order.orderStatus === 'DELIVERED' && (
//                             <button
//                               className="btn btn-danger"
//                               style={{
//                                 padding: '0.3rem 0.5rem',
//                                 fontSize: '0.75rem'
//                               }}
//                               onClick={() => returnOrder(order.id)}
//                             >
//                               <RotateCcw size={12} />
//                               Initiate Return
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan="8"
//                       style={{
//                         textAlign: 'center',
//                         padding: '2rem',
//                         color: 'var(--text-muted)'
//                       }}
//                     >
//                       No orders found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Orders;




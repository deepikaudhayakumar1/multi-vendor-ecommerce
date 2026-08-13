import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Package, Truck, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [vendorItems, setVendorItems] = useState([]);

  useEffect(() => {
    if (!user) return;

    // if (user.role === 'CUSTOMER') {
    //   API.get(`/orders/customer/${user.userId}`)
    //     .then((res) => setOrders(res.data))
    //     .catch(() => {});
    // }
   if (user.role === 'CUSTOMER') {
  const customerId = user.userId ?? user.id;

  console.log("CUSTOMER USER:", user);
  console.log("CUSTOMER ID:", customerId);

  if (!customerId) {
    console.error("Customer ID is missing");
    return;
  }

  API.get(`/orders/customer/${customerId}`)
    .then((res) => {
      console.log("CUSTOMER ORDERS:", res.data);
      setOrders(res.data);
    })
    .catch((err) => {
      console.error("Failed to fetch customer orders:", err);
    });
}
     else if (user.role === 'VENDOR') {
      API.get(`/orders/vendor/${user.userId}`)
        .then((res) => setVendorItems(res.data))
        .catch(() => {});
    } else {
      API.get(`/orders/customer/${user.id}`)
        .then((res) => setOrders(res.data))
        .catch(() => {});
    }
  }, [user]);

  const confirmOrder = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/confirm`);
      reloadOrders();
    } catch (err) {
      alert('Failed to confirm order');
    }
  };

  const shipOrder = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/ship`);
      reloadOrders();
    } catch (err) {
      alert('Failed to ship order');
    }
  };

  const deliverOrder = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/deliver`);
      reloadOrders();
    } catch (err) {
      alert('Failed to update delivery');
    }
  };

  const returnOrder = async (orderId) => {
    try {
      await API.post(`/orders/${orderId}/return`);
      reloadOrders();
    } catch (err) {
      alert('Failed to initiate return');
    }
  };

  // const reloadOrders = () => {
  //   if (user.role === 'CUSTOMER') {
  //     API.get(`/orders/customer/${user.id}`).then((res) => setOrders(res.data));
  //   }
  // };
  const reloadOrders = () => {
  if (user.role === 'CUSTOMER') {
    API.get(`/orders/customer/${user.userId}`)
      .then((res) => {
        console.log("RELOADED ORDERS:", res.data);
        setOrders(res.data);
      })
      .catch((err) => {
        console.error("Failed to reload orders:", err);
      });
  }
};

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Order Lifecycle & Fulfilment Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track SLA timelines, shipment AWB numbers, and return workflows</p>
      </div>

      {user?.role === 'VENDOR' ? (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Vendor Order Fulfilment Items</h3>
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
                {vendorItems.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>#{item.orderId}</td>
                    <td>#{item.productId}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unitPrice}</td>
                    <td>₹{item.commissionAmount}</td>
                    <td><span className="badge badge-warning">{item.itemStatus}</span></td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => shipOrder(item.orderId)}>
                        Mark Shipped
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Customer Order History</h3>
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
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{new Date(order.placedAt).toLocaleDateString()}</td>
                    <td>₹{order.totalAmount}</td>
                    <td>{order.paymentMethod}</td>
                    <td><span className="badge badge-success">{order.paymentStatus}</span></td>
                    <td>
                      <span className={`badge ${order.orderStatus === 'DELIVERED' ? 'badge-success' : 'badge-primary'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      {order.awbNumber ? (
                        <span style={{ fontFamily: 'monospace', color: 'var(--accent-light)' }}>{order.awbNumber}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Pending Dispatch</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {order.orderStatus === 'PLACED' && (
                          <button className="btn btn-secondary" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} onClick={() => confirmOrder(order.id)}>
                            Confirm (2h SLA)
                          </button>
                        )}
                        {order.orderStatus === 'CONFIRMED' && (
                          <button className="btn btn-secondary" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} onClick={() => shipOrder(order.id)}>
                            Dispatch & AWB
                          </button>
                        )}
                        {order.orderStatus === 'SHIPPED' && (
                          <button className="btn btn-primary" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} onClick={() => deliverOrder(order.id)}>
                            Confirm Delivery
                          </button>
                        )}
                        {order.orderStatus === 'DELIVERED' && (
                          <button className="btn btn-danger" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} onClick={() => returnOrder(order.id)}>
                            <RotateCcw size={12} /> Initiate Return
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
    </div>
  );
};

export default Orders;

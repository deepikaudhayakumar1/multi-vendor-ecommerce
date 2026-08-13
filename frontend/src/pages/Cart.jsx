import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Trash2, ShoppingBag, CreditCard, CheckCircle } from 'lucide-react';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('123 MG Road, Cyber City, Bangalore, Karnataka - 560001');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [orderCreated, setOrderCreated] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
  }, []);

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeItem(productId);
      return;
    }
    const updated = cartItems.map((item) => (item.productId === productId ? { ...item, quantity: newQty } : item));
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter((item) => item.productId !== productId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'FESTIVE10') {
      setDiscount(calculateSubtotal() * 0.1);
    } else {
      alert('Invalid promo coupon code. Try FESTIVE10');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      const orderPayload = {
        customerId: user.id,
        deliveryAddress,
        paymentMethod,
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };

      const res = await API.post('/orders', orderPayload);
      setOrderCreated(res.data);
      localStorage.removeItem('cart');
      setCartItems([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Order creation failed');
    } finally {
      setLoading(false);
    }
  };

  if (orderCreated) {
    return (
      <div className="glass-card" style={{ maxWidth: '650px', margin: '3rem auto', textAlign: 'center', padding: '3rem' }}>
        <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Order Confirmed Successfully!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Unique System Order ID: <strong style={{ color: 'var(--accent-light)' }}>#{orderCreated.id}</strong>
        </p>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '2rem' }}>
          <p><strong>Total Amount:</strong> ₹{orderCreated.totalAmount}</p>
          <p><strong>Payment Status:</strong> <span className="badge badge-success">{orderCreated.paymentStatus}</span></p>
          <p><strong>Payment Method:</strong> {orderCreated.paymentMethod}</p>
          <p><strong>Estimated Delivery:</strong> Within 3 Business Days</p>
          <p><strong>Delivery Address:</strong> {orderCreated.deliveryAddress}</p>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/orders')}>
          View Order History & Tracking SLA
        </button>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const grandTotal = Math.max(0, subtotal - discount);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Shopping Cart & Multi-Step Checkout</h1>

      {cartItems.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <ShoppingBag size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>Your cart is currently empty</h3>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/shop')}>
            Explore Marketplace Products
          </button>
        </div>
      ) : (
        <div className="grid-3">
          <div className="glass-card" style={{ gridColumn: 'span 2' }}>
            <h3 style={{ marginBottom: '1rem' }}>Cart Items</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.productId}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={item.imageUrl} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                        <span>{item.name}</span>
                      </td>
                      <td>₹{item.unitPrice}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          style={{ width: '60px', padding: '0.25rem 0.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px' }}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        />
                      </td>
                      <td>₹{item.unitPrice * item.quantity}</td>
                      <td>
                        <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem' }} onClick={() => removeItem(item.productId)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Delivery Address Selection</h3>
              <select className="form-select" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)}>
                <option value="123 MG Road, Cyber City, Bangalore, Karnataka - 560001">Address 1: 123 MG Road, Bangalore (Default)</option>
                <option value="45 Park Street, Connaught Place, New Delhi - 110001">Address 2: 45 Park Street, New Delhi</option>
                <option value="88 Marine Drive, Churchgate, Mumbai - 400020">Address 3: 88 Marine Drive, Mumbai</option>
              </select>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '1.25rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Promotional Coupon Code</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="FESTIVE10"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button className="btn btn-secondary" onClick={applyCoupon}>Apply</button>
              </div>
            </div>

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--success)' }}>
                <span>Coupon Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>
              <span>Grand Total</span>
              <span style={{ color: 'var(--accent-light)' }}>₹{grandTotal.toFixed(2)}</span>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Select Payment Method</label>
              <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="UPI">UPI Instant Payment (GPay / PhonePe / Paytm)</option>
                <option value="CARD">Credit / Debit Card (Visa / MasterCard / RuPay)</option>
                <option value="NET_BANKING">Net Banking (SBI / HDFC / ICICI)</option>
                <option value="COD">Cash on Delivery (COD with OTP Delivery Scan)</option>
                <option value="BNPL">Buy Now Pay Later (BNPL Credit)</option>
              </select>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }} onClick={handleCheckout} disabled={loading}>
              <CreditCard size={18} /> {loading ? 'Processing Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

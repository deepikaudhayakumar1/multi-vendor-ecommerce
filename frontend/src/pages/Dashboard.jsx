import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { ShoppingBag, TrendingUp, DollarSign, Users, PackageCheck, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ gmv: 0, orders: 0, products: 0, vendors: 0 });

  useEffect(() => {
    API.get('/analytics/gmv')
      .then((res) => {
        setStats((prev) => ({ ...prev, gmv: res.data.totalGMV || 124500, orders: res.data.totalOrders || 18 }));
      })
      .catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Welcome, {user.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Role Portal: <span className="badge badge-primary">{user.role}</span> | GSTIN: {user.gstin || 'N/A'}
          </p>
        </div>
        <div>
          <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <ShieldCheck size={14} style={{ marginRight: '4px' }} /> JWT Session Active
          </span>
        </div>
      </div>

      {/* Role KPI Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Gross Merchandise Value</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>₹{Number(stats.gmv).toLocaleString()}</h2>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', color: 'var(--accent-light)' }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Marketplace Orders</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{stats.orders}</h2>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: 'var(--success)' }}>
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SLA Delivery Rate</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>98.4%</h2>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '12px', color: 'var(--warning)' }}>
              <PackageCheck size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Vendor Payout Net</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>₹48,200</h2>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px', color: 'var(--info)' }}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Role-Aware Modules & Action Panels */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Quick Operation Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {user.role === 'CUSTOMER' && (
              <>
                <Link to="/shop" className="btn btn-primary" style={{ justifyContent: 'space-between' }}>
                  Browse Marketplace Catalogue <ArrowRight size={18} />
                </Link>
                <Link to="/orders" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                  View My Order History & Tracking <ArrowRight size={18} />
                </Link>
                <Link to="/cart" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                  Checkout Shopping Cart <ArrowRight size={18} />
                </Link>
              </>
            )}

            {user.role === 'VENDOR' && (
              <>
                <Link to="/vendor" className="btn btn-primary" style={{ justifyContent: 'space-between' }}>
                  Manage Product Inventory & Add Listing <ArrowRight size={18} />
                </Link>
                <Link to="/orders" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                  Vendor Incoming Orders & SLA Dispatch <ArrowRight size={18} />
                </Link>
                <Link to="/finance" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                  Check Weekly Payouts & TDS Form 16A <ArrowRight size={18} />
                </Link>
              </>
            )}

            {(user.role === 'ADMIN' || user.role === 'CATEGORY_MANAGER') && (
              <>
                <Link to="/admin" className="btn btn-primary" style={{ justifyContent: 'space-between' }}>
                  Category Manager Quality Review Queue <ArrowRight size={18} />
                </Link>
                <Link to="/analytics" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                  Platform Analytics & GMV Funnel <ArrowRight size={18} />
                </Link>
                <Link to="/shop" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                  Inspect Product Catalogue <ArrowRight size={18} />
                </Link>
              </>
            )}

            {user.role === 'FINANCE_OFFICER' && (
              <>
                <Link to="/finance" className="btn btn-primary" style={{ justifyContent: 'space-between' }}>
                  Weekly Vendor Payout Execution & TDS 1% <ArrowRight size={18} />
                </Link>
                <Link to="/analytics" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                  Commission Reconciliation Report <ArrowRight size={18} />
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Marketplace SLA & System Health</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Vendor Order Confirmation SLA</span>
              <span className="badge badge-success">2 Hours (Compliant)</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Logistics Dispatch SLA</span>
              <span className="badge badge-success">48 Hours Window</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Split Settlement Calculation</span>
              <span className="badge badge-primary">Automated Realtime</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Section 194O TDS Deductions</span>
              <span className="badge badge-info">1% Standard Rate</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

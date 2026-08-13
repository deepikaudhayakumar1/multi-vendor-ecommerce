import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, LogOut, User, LayoutDashboard, ShoppingCart, Package } from 'lucide-react';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand">
        <ShoppingBag className="w-6 h-6 text-indigo-400" />
        <span>Multi-Vendor E-Commerce Marketplace Platform</span>
      </NavLink>

      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link nav-active' : 'nav-link')}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/shop" className={({ isActive }) => (isActive ? 'nav-link nav-active' : 'nav-link')}>
            Shop
          </NavLink>
        </li>
        {user && (
          <>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link nav-active' : 'nav-link')}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-link nav-active' : 'nav-link')}>
                Orders
              </NavLink>
            </li>
            {user.role === 'CUSTOMER' && (
              <li>
                <NavLink to="/cart" className={({ isActive }) => (isActive ? 'nav-link nav-active' : 'nav-link')}>
                  Cart
                </NavLink>
              </li>
            )}
            {user.role === 'VENDOR' && (
              <li>
                <NavLink to="/vendor" className={({ isActive }) => (isActive ? 'nav-link nav-active' : 'nav-link')}>
                  My Catalogue
                </NavLink>
              </li>
            )}
            {(user.role === 'ADMIN' || user.role === 'CATEGORY_MANAGER') && (
              <li>
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link nav-active' : 'nav-link')}>
                  Admin Panel
                </NavLink>
              </li>
            )}
            {user.role === 'FINANCE_OFFICER' && (
              <li>
                <NavLink to="/finance" className={({ isActive }) => (isActive ? 'nav-link nav-active' : 'nav-link')}>
                  Finance Panel
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'nav-link nav-active' : 'nav-link')}>
                Analytics
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="nav-user">
        {user ? (
          <>
            <span className="badge badge-primary">{user.role}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-secondary">
              Login
            </NavLink>
            <NavLink to="/register" className="btn btn-primary">
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateStep1 = () => {
    setError('');

    // Name validation: alphabetic + spaces only
    const nameRegex = /^[a-zA-Z\s]{2,100}$/;
    if (!nameRegex.test(name.trim())) {
      setError('Name must not contain numbers or special characters');
      return false;
    }

    // Phone validation: exactly 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError('Phone Number must be exactly 10 digits long');
      return false;
    }

    if (password.length < 8) {
      setError('Password must meet security requirements (min 8 characters)');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      if (role === 'VENDOR') {
        setStep(2);
      } else {
        handleRegister();
      }
    }
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        gstin: role === 'VENDOR' ? gstin : null,
        pan: role === 'VENDOR' ? pan : null,
        bankAccountNo: role === 'VENDOR' ? bankAccountNo : null,
        ifscCode: role === 'VENDOR' ? ifscCode : null,
      };

      const res = await register(payload);
      setSuccess('Registration successful! Please verify your email.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed. Please verify fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 0' }}>
      <div className="glass-card" style={{ maxWidth: '550px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Multi-Vendor E-Commerce Marketplace Registration</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {step === 1 && (
          <div>
            <div className="form-group">
              <label className="form-label">Full Legal Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Deepika Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (10 Digits)</label>
              <input
                type="text"
                className="form-input"
                placeholder="9876543210"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (Min 8 Chars)</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="CUSTOMER">Customer (Shop & Order)</option>
                <option value="VENDOR">Vendor (Sell Products)</option>
                <option value="ADMIN">System Administrator</option>
                <option value="CATEGORY_MANAGER">Category Manager</option>
                <option value="FINANCE_OFFICER">Finance Officer</option>
                <option value="LOGISTICS_MANAGER">Logistics Manager</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
              onClick={handleNext}
              disabled={loading}
            >
              {role === 'VENDOR' ? 'Next: Business Details →' : 'Register Account'}
            </button>
          </div>
        )}

        {step === 2 && role === 'VENDOR' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-light)' }}>
              Vendor Verification & Payout Details
            </h3>

            <div className="form-group">
              <label className="form-label">GSTIN (GST Identification Number)</label>
              <input
                type="text"
                className="form-input"
                placeholder="27AAAAA0000A1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">PAN Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="ABCDE1234F"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank Account Number (Payouts)</label>
              <input
                type="text"
                className="form-input"
                placeholder="918273645012"
                value={bankAccountNo}
                onChange={(e) => setBankAccountNo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank IFSC Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="SBIN0001234"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleRegister} disabled={loading}>
                Submit Registration
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Login Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

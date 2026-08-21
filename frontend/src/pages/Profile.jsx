import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Building2,
  CreditCard,
  Landmark,
  FileText,
  ArrowLeft,
  Store,
  MapPin,
  Edit3,
  Save,
  X,
  MapPinned
} from 'lucide-react';

import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Profile = () => {

  const { user, loading } = useContext(AuthContext);

  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');

  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',

    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',

    gstin: '',
    pan: '',
    bankAccountNo: '',
    ifscCode: ''
  });


  // =========================================================
  // LOAD USER INTO FORM
  // =========================================================

  useEffect(() => {

    if (user) {

      setFormData({
        name: user.name || '',
        phone: user.phone || '',

        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        country: user.country || 'India',

        gstin: user.gstin || '',
        pan: user.pan || '',
        bankAccountNo: user.bankAccountNo || '',
        ifscCode: user.ifscCode || ''
      });

    }

  }, [user]);


  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

  };


  // =========================================================
  // EDIT PROFILE
  // =========================================================

  const handleEdit = () => {

    setMessage('');
    setError('');

    setEditing(true);

  };


  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const handleCancel = () => {

    setMessage('');
    setError('');

    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',

      addressLine1: user?.addressLine1 || '',
      addressLine2: user?.addressLine2 || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
      country: user?.country || 'India',

      gstin: user?.gstin || '',
      pan: user?.pan || '',
      bankAccountNo: user?.bankAccountNo || '',
      ifscCode: user?.ifscCode || ''
    });

    setEditing(false);

  };


  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setMessage('');
    setError('');

    if (!formData.name.trim()) {

      setError('Please enter your full name.');

      return;
    }

    if (!/^[a-zA-Z\s]{2,100}$/.test(formData.name.trim())) {

      setError(
        'Name must contain only letters and spaces.'
      );

      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {

      setError(
        'Phone number must be exactly 10 digits.'
      );

      return;
    }

    if (
      formData.pincode &&
      !/^[0-9]{6}$/.test(formData.pincode.trim())
    ) {

      setError(
        'Pincode must be exactly 6 digits.'
      );

      return;
    }


    try {

      setSaving(true);

      const response = await API.put(
        '/users/profile',
        formData
      );

      setMessage(
        'Profile updated successfully!'
      );

      setEditing(false);

      /*
       * Update the currently displayed user.
       *
       * AuthContext will be refreshed below by
       * reloading the profile endpoint.
       */

      window.location.reload();

    } catch (err) {

      console.error(
        'Profile update error:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Unable to update profile. Please try again.'
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {

    if (!date) {
      return 'Not available';
    }

    try {

      return new Date(date).toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }
      );

    } catch {

      return date;

    }

  };


  // =========================================================
  // ROLE LABEL
  // =========================================================

  const getRoleLabel = (role) => {

    if (!role) {
      return 'USER';
    }

    return role
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) => letter.toUpperCase()
      );

  };


  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {

    if (status === 'ACTIVE') {
      return 'badge badge-success';
    }

    if (status === 'SUSPENDED') {
      return 'badge badge-danger';
    }

    return 'badge badge-warning';

  };


  // =========================================================
  // ADDRESS CHECK
  // =========================================================

  const hasAddress =
    user?.addressLine1 ||
    user?.city ||
    user?.state ||
    user?.pincode;


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="profile-page">

        <div className="glass-card">

          <p>Loading profile...</p>

        </div>

      </div>
    );

  }


  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!user) {

    return (
      <div className="profile-page">

        <div className="glass-card">

          <h2>
            Please login to view your profile.
          </h2>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/login')}
            style={{ marginTop: '1rem' }}
          >
            Go to Login
          </button>

        </div>

      </div>
    );

  }


  // =========================================================
  // EDIT MODE
  // =========================================================

  if (editing) {

    return (

      <div className="profile-page">

        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          style={{
            marginBottom: '1.5rem'
          }}
        >
          <ArrowLeft size={17} />

          Back
        </button>


        <div className="profile-card">

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >

            <div>

              <h2>
                Edit Profile
              </h2>

              <p className="profile-section-subtitle">
                Update your personal and address information
              </p>

            </div>

            <button
              className="btn btn-secondary"
              onClick={handleCancel}
              type="button"
            >
              <X size={17} />

              Cancel
            </button>

          </div>


          {message && (

            <div
              style={{
                padding: '12px',
                marginBottom: '1rem',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.12)',
                color: 'var(--success)'
              }}
            >
              {message}
            </div>

          )}


          {error && (

            <div
              style={{
                padding: '12px',
                marginBottom: '1rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444'
              }}
            >
              {error}
            </div>

          )}


          <form onSubmit={handleSubmit}>

            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <h3>
              Personal Information
            </h3>

            <div className="profile-grid">

              <div className="profile-form-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  maxLength={100}
                  required
                />

              </div>


              <div className="profile-form-field">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                />

                <small>
                  Email cannot be changed from profile.
                </small>

              </div>


              <div className="profile-form-field">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="10 digit phone number"
                  required
                />

              </div>

            </div>


            {/* =================================================
                ADDRESS
            ================================================= */}

            <div
              style={{
                marginTop: '2rem'
              }}
            >

              <h3>
                <MapPin
                  size={20}
                  style={{
                    verticalAlign: 'middle',
                    marginRight: '8px'
                  }}
                />

                Address
              </h3>

            </div>


            <div className="profile-grid">

              <div
                className="profile-form-field"
                style={{
                  gridColumn: '1 / -1'
                }}
              >

                <label>
                  Address Line 1
                </label>

                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="House / Flat / Street"
                  maxLength={255}
                />

              </div>


              <div
                className="profile-form-field"
                style={{
                  gridColumn: '1 / -1'
                }}
              >

                <label>
                  Address Line 2
                </label>

                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Area / Landmark"
                  maxLength={255}
                />

              </div>


              <div className="profile-form-field">

                <label>
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  maxLength={100}
                />

              </div>


              <div className="profile-form-field">

                <label>
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  maxLength={100}
                />

              </div>


              <div className="profile-form-field">

                <label>
                  Pincode
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6 digit pincode"
                  maxLength={6}
                />

              </div>


              <div className="profile-form-field">

                <label>
                  Country
                </label>

                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  maxLength={100}
                />

              </div>

            </div>


            {/* =================================================
                VENDOR INFORMATION
            ================================================= */}

            {user.role === 'VENDOR' && (

              <>

                <div
                  style={{
                    marginTop: '2rem'
                  }}
                >

                  <h3>
                    Business & Payment Information
                  </h3>

                </div>


                <div className="profile-grid">

                  <div className="profile-form-field">

                    <label>
                      GSTIN
                    </label>

                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      placeholder="GSTIN"
                    />

                  </div>


                  <div className="profile-form-field">

                    <label>
                      PAN
                    </label>

                    <input
                      type="text"
                      name="pan"
                      value={formData.pan}
                      onChange={handleChange}
                      placeholder="PAN"
                    />

                  </div>


                  <div className="profile-form-field">

                    <label>
                      Bank Account Number
                    </label>

                    <input
                      type="text"
                      name="bankAccountNo"
                      value={formData.bankAccountNo}
                      onChange={handleChange}
                      placeholder="Bank account number"
                    />

                  </div>


                  <div className="profile-form-field">

                    <label>
                      IFSC Code
                    </label>

                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      placeholder="IFSC code"
                    />

                  </div>

                </div>

              </>

            )}


            {/* =================================================
                SAVE
            ================================================= */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem'
              }}
            >

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={17} />

                Cancel
              </button>


              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >

                <Save size={17} />

                {saving
                  ? 'Saving...'
                  : 'Save Changes'}

              </button>

            </div>

          </form>

        </div>

      </div>

    );

  }


  // =========================================================
  // NORMAL VIEW MODE
  // =========================================================

  return (

    <div className="profile-page">

      <button
        className="btn btn-secondary"
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '1.5rem'
        }}
      >

        <ArrowLeft size={17} />

        Back

      </button>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="profile-header-card">

        <div className="profile-avatar">

          <User size={52} />

        </div>


        <div className="profile-header-info">

          <h1>
            {user.name || 'User'}
          </h1>

          <p>
            {user.email || 'Email not available'}
          </p>


          <div className="profile-badges">

            <span className="badge badge-primary">

              <ShieldCheck
                size={14}
                style={{
                  marginRight: '5px'
                }}
              />

              {getRoleLabel(user.role)}

            </span>


            <span
              className={getStatusClass(
                user.status
              )}
            >
              {user.status || 'ACTIVE'}
            </span>

          </div>

        </div>


        {/* EDIT BUTTON */}

        <button
          className="btn btn-primary"
          onClick={handleEdit}
          style={{
            marginLeft: 'auto'
          }}
        >

          <Edit3 size={17} />

          Edit Profile

        </button>

      </div>


      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && (

        <div
          style={{
            padding: '12px',
            marginTop: '1rem',
            borderRadius: '8px',
            background: 'rgba(34, 197, 94, 0.12)',
            color: 'var(--success)'
          }}
        >
          {message}
        </div>

      )}


      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (

        <div
          style={{
            padding: '12px',
            marginTop: '1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444'
          }}
        >
          {error}
        </div>

      )}


      {/* =====================================================
          PERSONAL INFORMATION
      ===================================================== */}

      <div className="profile-card">

        <h2>
          Personal Information
        </h2>

        <p className="profile-section-subtitle">
          Your basic account information
        </p>


        <div className="profile-grid">

          <div className="profile-field">

            <div className="profile-field-icon">

              <User size={20} />

            </div>

            <div>

              <span>
                Full Name
              </span>

              <strong>
                {user.name || 'Not available'}
              </strong>

            </div>

          </div>


          <div className="profile-field">

            <div className="profile-field-icon">

              <Mail size={20} />

            </div>

            <div>

              <span>
                Email Address
              </span>

              <strong>
                {user.email || 'Not available'}
              </strong>

            </div>

          </div>


          <div className="profile-field">

            <div className="profile-field-icon">

              <Phone size={20} />

            </div>

            <div>

              <span>
                Phone Number
              </span>

              <strong>
                {user.phone || 'Not available'}
              </strong>

            </div>

          </div>


          <div className="profile-field">

            <div className="profile-field-icon">

              <CalendarDays size={20} />

            </div>

            <div>

              <span>
                Account Created
              </span>

              <strong>
                {formatDate(user.createdAt)}
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          ADDRESS
      ===================================================== */}

      <div className="profile-card">

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >

          <MapPinned size={24} />

          <div>

            <h2>
              Address
            </h2>

            <p className="profile-section-subtitle">
              Your default delivery and business address
            </p>

          </div>

        </div>


        {hasAddress ? (

          <div className="profile-grid">

            <div
              className="profile-field"
              style={{
                gridColumn: '1 / -1'
              }}
            >

              <div className="profile-field-icon">

                <MapPin size={20} />

              </div>

              <div>

                <span>
                  Address
                </span>

                <strong>
                  {user.addressLine1 || 'Not provided'}
                </strong>

                {user.addressLine2 && (

                  <strong>
                    {user.addressLine2}
                  </strong>

                )}

              </div>

            </div>


            <div className="profile-field">

              <div className="profile-field-icon">

                <MapPin size={20} />

              </div>

              <div>

                <span>
                  City
                </span>

                <strong>
                  {user.city || 'Not provided'}
                </strong>

              </div>

            </div>


            <div className="profile-field">

              <div className="profile-field-icon">

                <MapPin size={20} />

              </div>

              <div>

                <span>
                  State
                </span>

                <strong>
                  {user.state || 'Not provided'}
                </strong>

              </div>

            </div>


            <div className="profile-field">

              <div className="profile-field-icon">

                <MapPin size={20} />

              </div>

              <div>

                <span>
                  Pincode
                </span>

                <strong>
                  {user.pincode || 'Not provided'}
                </strong>

              </div>

            </div>


            <div className="profile-field">

              <div className="profile-field-icon">

                <MapPin size={20} />

              </div>

              <div>

                <span>
                  Country
                </span>

                <strong>
                  {user.country || 'India'}
                </strong>

              </div>

            </div>

          </div>

        ) : (

          <div
            style={{
              padding: '1.5rem',
              marginTop: '1rem',
              borderRadius: '10px',
              textAlign: 'center',
              background: 'rgba(139, 92, 246, 0.08)'
            }}
          >

            <MapPin
              size={32}
              style={{
                marginBottom: '8px'
              }}
            />

            <p>
              You haven't added an address yet.
            </p>

            <button
              className="btn btn-primary"
              onClick={handleEdit}
            >
              <MapPin size={17} />

              Add Address

            </button>

          </div>

        )}

      </div>


      {/* =====================================================
          ACCOUNT INFORMATION
      ===================================================== */}

      <div className="profile-card">

        <h2>
          Account Information
        </h2>

        <p className="profile-section-subtitle">
          Your marketplace role and account status
        </p>


        <div className="profile-grid">

          <div className="profile-field">

            <div className="profile-field-icon">

              <CreditCard size={20} />

            </div>

            <div>

              <span>
                User ID
              </span>

              <strong>
                #{user.id || 'N/A'}
              </strong>

            </div>

          </div>


          <div className="profile-field">

            <div className="profile-field-icon">

              <ShieldCheck size={20} />

            </div>

            <div>

              <span>
                Role
              </span>

              <strong>
                {getRoleLabel(user.role)}
              </strong>

            </div>

          </div>


          <div className="profile-field">

            <div className="profile-field-icon">

              <ShieldCheck size={20} />

            </div>

            <div>

              <span>
                Account Status
              </span>

              <strong>
                {user.status || 'ACTIVE'}
              </strong>

            </div>

          </div>


          <div className="profile-field">

            <div className="profile-field-icon">

              <Store size={20} />

            </div>

            <div>

              <span>
                Account Type
              </span>

              <strong>
                {getRoleLabel(user.role)}
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          VENDOR INFORMATION
      ===================================================== */}

      {user.role === 'VENDOR' && (

        <div className="profile-card">

          <h2>
            Vendor Information
          </h2>

          <p className="profile-section-subtitle">
            Business and payment information
          </p>


          <div className="profile-grid">

            <div className="profile-field">

              <div className="profile-field-icon">

                <Building2 size={20} />

              </div>

              <div>

                <span>
                  GSTIN
                </span>

                <strong>
                  {user.gstin || 'Not provided'}
                </strong>

              </div>

            </div>


            <div className="profile-field">

              <div className="profile-field-icon">

                <FileText size={20} />

              </div>

              <div>

                <span>
                  PAN
                </span>

                <strong>
                  {user.pan || 'Not provided'}
                </strong>

              </div>

            </div>


            <div className="profile-field">

              <div className="profile-field-icon">

                <Landmark size={20} />

              </div>

              <div>

                <span>
                  Bank Account
                </span>

                <strong>
                  {user.bankAccountNo || 'Not provided'}
                </strong>

              </div>

            </div>


            <div className="profile-field">

              <div className="profile-field-icon">

                <CreditCard size={20} />

              </div>

              <div>

                <span>
                  IFSC Code
                </span>

                <strong>
                  {user.ifscCode || 'Not provided'}
                </strong>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          SECURITY MESSAGE
      ===================================================== */}

      <div
        className="glass-card"
        style={{
          textAlign: 'center',
          marginTop: '1rem'
        }}
      >

        <ShieldCheck
          size={24}
          style={{
            color: 'var(--success)',
            marginBottom: '0.5rem'
          }}
        />

        <p
          style={{
            color: 'var(--text-secondary)'
          }}
        >
          Your profile information is securely
          loaded from your marketplace account.
        </p>

      </div>

    </div>

  );

};

export default Profile;






// import React, { useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   User,
//   Mail,
//   Phone,
//   ShieldCheck,
//   CalendarDays,
//   Building2,
//   CreditCard,
//   Landmark,
//   FileText,
//   ArrowLeft,
//   Store
// } from 'lucide-react';

// import { AuthContext } from '../context/AuthContext';

// const Profile = () => {
//   const { user, loading } = useContext(AuthContext);
//   const navigate = useNavigate();

//   if (loading) {
//     return (
//       <div className="profile-page">
//         <div className="glass-card">
//           <p>Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="profile-page">
//         <div className="glass-card">
//           <h2>Please login to view your profile.</h2>

//           <button
//             className="btn btn-primary"
//             onClick={() => navigate('/login')}
//             style={{ marginTop: '1rem' }}
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const formatDate = (date) => {
//     if (!date) return 'Not available';

//     try {
//       return new Date(date).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'long',
//         year: 'numeric'
//       });
//     } catch {
//       return date;
//     }
//   };

//   const getRoleLabel = (role) => {
//     if (!role) return 'USER';

//     return role
//       .replaceAll('_', ' ')
//       .toLowerCase()
//       .replace(/\b\w/g, (letter) => letter.toUpperCase());
//   };

//   const getStatusClass = (status) => {
//     if (status === 'ACTIVE') {
//       return 'badge badge-success';
//     }

//     if (status === 'SUSPENDED') {
//       return 'badge badge-danger';
//     }

//     return 'badge badge-warning';
//   };

//   return (
//     <div className="profile-page">

//       {/* =========================================
//           BACK BUTTON
//       ========================================= */}

//       <button
//         className="btn btn-secondary"
//         onClick={() => navigate(-1)}
//         style={{ marginBottom: '1.5rem' }}
//       >
//         <ArrowLeft size={17} />
//         Back
//       </button>


//       {/* =========================================
//           PROFILE HEADER
//       ========================================= */}

//       <div className="profile-header-card">

//         <div className="profile-avatar">
//           <User size={52} />
//         </div>

//         <div className="profile-header-info">

//           <h1>{user.name || 'User'}</h1>

//           <p>
//             {user.email || 'Email not available'}
//           </p>

//           <div className="profile-badges">

//             <span className="badge badge-primary">
//               <ShieldCheck size={14} style={{ marginRight: '5px' }} />
//               {getRoleLabel(user.role)}
//             </span>

//             <span className={getStatusClass(user.status)}>
//               {user.status || 'ACTIVE'}
//             </span>

//           </div>

//         </div>

//       </div>


//       {/* =========================================
//           PERSONAL INFORMATION
//       ========================================= */}

//       <div className="profile-card">

//         <h2>Personal Information</h2>

//         <p className="profile-section-subtitle">
//           Your basic account information
//         </p>

//         <div className="profile-grid">

//           {/* Name */}

//           <div className="profile-field">

//             <div className="profile-field-icon">
//               <User size={20} />
//             </div>

//             <div>
//               <span>Full Name</span>
//               <strong>{user.name || 'Not available'}</strong>
//             </div>

//           </div>


//           {/* Email */}

//           <div className="profile-field">

//             <div className="profile-field-icon">
//               <Mail size={20} />
//             </div>

//             <div>
//               <span>Email Address</span>
//               <strong>{user.email || 'Not available'}</strong>
//             </div>

//           </div>


//           {/* Phone */}

//           <div className="profile-field">

//             <div className="profile-field-icon">
//               <Phone size={20} />
//             </div>

//             <div>
//               <span>Phone Number</span>
//               <strong>{user.phone || 'Not available'}</strong>
//             </div>

//           </div>


//           {/* Account Created */}

//           <div className="profile-field">

//             <div className="profile-field-icon">
//               <CalendarDays size={20} />
//             </div>

//             <div>
//               <span>Account Created</span>
//               <strong>
//                 {formatDate(user.createdAt)}
//               </strong>
//             </div>

//           </div>

//         </div>

//       </div>


//       {/* =========================================
//           ACCOUNT INFORMATION
//       ========================================= */}

//       <div className="profile-card">

//         <h2>Account Information</h2>

//         <p className="profile-section-subtitle">
//           Your marketplace role and account status
//         </p>

//         <div className="profile-grid">

//           {/* User ID */}

//           <div className="profile-field">

//             <div className="profile-field-icon">
//               <CreditCard size={20} />
//             </div>

//             <div>
//               <span>User ID</span>
//               <strong>
//                 #{user.id || 'N/A'}
//               </strong>
//             </div>

//           </div>


//           {/* Role */}

//           <div className="profile-field">

//             <div className="profile-field-icon">
//               <ShieldCheck size={20} />
//             </div>

//             <div>
//               <span>Role</span>
//               <strong>
//                 {getRoleLabel(user.role)}
//               </strong>
//             </div>

//           </div>


//           {/* Status */}

//           <div className="profile-field">

//             <div className="profile-field-icon">
//               <ShieldCheck size={20} />
//             </div>

//             <div>
//               <span>Account Status</span>
//               <strong>
//                 {user.status || 'ACTIVE'}
//               </strong>
//             </div>

//           </div>


//           {/* Marketplace */}

//           <div className="profile-field">

//             <div className="profile-field-icon">
//               <Store size={20} />
//             </div>

//             <div>
//               <span>Account Type</span>
//               <strong>
//                 {getRoleLabel(user.role)}
//               </strong>
//             </div>

//           </div>

//         </div>

//       </div>


//       {/* =========================================
//           VENDOR INFORMATION
//           Only shown for VENDOR
//       ========================================= */}

//       {user.role === 'VENDOR' && (
//         <div className="profile-card">

//           <h2>Vendor Information</h2>

//           <p className="profile-section-subtitle">
//             Business and payment information
//           </p>

//           <div className="profile-grid">

//             {/* GSTIN */}

//             <div className="profile-field">

//               <div className="profile-field-icon">
//                 <Building2 size={20} />
//               </div>

//               <div>
//                 <span>GSTIN</span>

//                 <strong>
//                   {user.gstin || 'Not provided'}
//                 </strong>
//               </div>

//             </div>


//             {/* PAN */}

//             <div className="profile-field">

//               <div className="profile-field-icon">
//                 <FileText size={20} />
//               </div>

//               <div>
//                 <span>PAN</span>

//                 <strong>
//                   {user.pan || 'Not provided'}
//                 </strong>
//               </div>

//             </div>


//             {/* Bank Account */}

//             <div className="profile-field">

//               <div className="profile-field-icon">
//                 <Landmark size={20} />
//               </div>

//               <div>
//                 <span>Bank Account</span>

//                 <strong>
//                   {user.bankAccountNo || 'Not provided'}
//                 </strong>
//               </div>

//             </div>


//             {/* IFSC */}

//             <div className="profile-field">

//               <div className="profile-field-icon">
//                 <CreditCard size={20} />
//               </div>

//               <div>
//                 <span>IFSC Code</span>

//                 <strong>
//                   {user.ifscCode || 'Not provided'}
//                 </strong>
//               </div>

//             </div>

//           </div>

//         </div>
//       )}


//       {/* =========================================
//           FOOTER MESSAGE
//       ========================================= */}

//       <div
//         className="glass-card"
//         style={{
//           textAlign: 'center',
//           marginTop: '1rem'
//         }}
//       >

//         <ShieldCheck
//           size={24}
//           style={{
//             color: 'var(--success)',
//             marginBottom: '0.5rem'
//           }}
//         />

//         <p style={{ color: 'var(--text-secondary)' }}>
//           Your profile information is securely loaded
//           from your marketplace account.
//         </p>

//       </div>

//     </div>
//   );
// };

// export default Profile;



// import React, { useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import {
//   User,
//   Mail,
//   Phone,
//   Shield,
//   Building2,
//   CreditCard,
//   Landmark,
//   Calendar,
//   CheckCircle
// } from 'lucide-react';

// const Profile = () => {
//   const { user } = useContext(AuthContext);

//   if (!user) {
//     return (
//       <div className="profile-page">
//         <div className="profile-card">
//           <h2>Profile</h2>
//           <p>Please login to view your profile.</p>
//         </div>
//       </div>
//     );
//   }

//   const isVendor = user.role === 'VENDOR';

//   return (
//     <div className="profile-page">

//       {/* Profile Header */}
//       <div className="profile-header-card">

//         <div className="profile-avatar">
//           <User size={48} />
//         </div>

//         <div className="profile-header-info">
//           <h1>{user.name}</h1>
//           <p>{user.email}</p>

//           <div className="profile-badges">
//             <span className="badge badge-primary">
//               {user.role}
//             </span>

//             <span className="profile-status">
//               <CheckCircle size={15} />
//               {user.status || 'ACTIVE'}
//             </span>
//           </div>
//         </div>

//       </div>

//       {/* Personal Information */}
//       <div className="profile-card">

//         <h2>Personal Information</h2>
//         <p className="profile-section-subtitle">
//           Your basic account information
//         </p>

//         <div className="profile-grid">

//           <div className="profile-field">
//             <div className="profile-field-icon">
//               <User size={20} />
//             </div>
//             <div>
//               <span>Full Name</span>
//               <strong>{user.name || 'Not available'}</strong>
//             </div>
//           </div>

//           <div className="profile-field">
//             <div className="profile-field-icon">
//               <Mail size={20} />
//             </div>
//             <div>
//               <span>Email Address</span>
//               <strong>{user.email || 'Not available'}</strong>
//             </div>
//           </div>

//           <div className="profile-field">
//             <div className="profile-field-icon">
//               <Phone size={20} />
//             </div>
//             <div>
//               <span>Phone Number</span>
//               <strong>{user.phone || 'Not available'}</strong>
//             </div>
//           </div>

//           <div className="profile-field">
//             <div className="profile-field-icon">
//               <Shield size={20} />
//             </div>
//             <div>
//               <span>Account Role</span>
//               <strong>{user.role}</strong>
//             </div>
//           </div>

//         </div>

//       </div>

//       {/* Vendor / Business Information */}
//       {isVendor && (
//         <div className="profile-card">

//           <h2>Business Information</h2>
//           <p className="profile-section-subtitle">
//             Your vendor and business details
//           </p>

//           <div className="profile-grid">

//             <div className="profile-field">
//               <div className="profile-field-icon">
//                 <Building2 size={20} />
//               </div>
//               <div>
//                 <span>GSTIN</span>
//                 <strong>{user.gstin || 'Not provided'}</strong>
//               </div>
//             </div>

//             <div className="profile-field">
//               <div className="profile-field-icon">
//                 <CreditCard size={20} />
//               </div>
//               <div>
//                 <span>PAN</span>
//                 <strong>{user.pan || 'Not provided'}</strong>
//               </div>
//             </div>

//             <div className="profile-field">
//               <div className="profile-field-icon">
//                 <Landmark size={20} />
//               </div>
//               <div>
//                 <span>Bank Account</span>
//                 <strong>
//                   {user.bankAccountNo || 'Not provided'}
//                 </strong>
//               </div>
//             </div>

//             <div className="profile-field">
//               <div className="profile-field-icon">
//                 <Landmark size={20} />
//               </div>
//               <div>
//                 <span>IFSC Code</span>
//                 <strong>
//                   {user.ifscCode || 'Not provided'}
//                 </strong>
//               </div>
//             </div>

//           </div>

//         </div>
//       )}

//       {/* Account Information */}
//       <div className="profile-card">

//         <h2>Account Information</h2>

//         <div className="profile-grid">

//           <div className="profile-field">
//             <div className="profile-field-icon">
//               <CheckCircle size={20} />
//             </div>
//             <div>
//               <span>Account Status</span>
//               <strong>{user.status || 'ACTIVE'}</strong>
//             </div>
//           </div>

//           <div className="profile-field">
//             <div className="profile-field-icon">
//               <Calendar size={20} />
//             </div>
//             <div>
//               <span>Member Since</span>
//               <strong>
//                 {user.createdAt
//                   ? new Date(user.createdAt).toLocaleDateString()
//                   : 'Not available'}
//               </strong>
//             </div>
//           </div>

//         </div>

//       </div>

//     </div>
//   );
// };

// export default Profile;
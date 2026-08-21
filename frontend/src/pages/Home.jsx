import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // =====================================================
  // BACKEND IMAGE URL
  // =====================================================

  const getImageUrl = (imageUrl) => {
    // No image available
    if (!imageUrl) {
      return 'https://picsum.photos/400/300';
    }

    // If backend already returns complete URL
    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://')
    ) {
      return imageUrl;
    }

    // If backend returns relative path
    // Example: /uploads/products/image.jpg
    return `http://localhost:8080${imageUrl}`;
  };

  // =====================================================
  // LOAD CATEGORIES + PRODUCTS
  // =====================================================

  useEffect(() => {
    API.get('/categories')
      .then((res) => {
        console.log('CATEGORIES FROM BACKEND:', res.data);
        setCategories(res.data);
      })
      .catch((err) => {
        console.error('Error loading categories:', err);
      });

    API.get('/products?status=ACTIVE')
      .then((res) => {
        console.log('PRODUCTS FROM BACKEND:', res.data);

        // Show first 3 products
        setProducts(res.data.slice(0, 3));
      })
      .catch((err) => {
        console.error('Error loading products:', err);
      });
  }, []);

  return (
    <div>

      {/* =================================================
          HERO BANNER
      ================================================= */}

      <div
        className="glass-card"
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          marginBottom: '3rem',
          background:
            'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.25), transparent)'
        }}
      >

        <span
          className="badge badge-primary"
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem'
          }}
        >
          Multi-Vendor E-Commerce Marketplace Platform
        </span>

        <h1
          style={{
            fontSize: '3rem',
            lineHeight: '1.2',
            marginBottom: '1rem',
            maxWidth: '800px',
            margin: '0 auto 1rem auto'
          }}
        >
          Connect Vendors, Customers, & Logistics in One Seamless Ecosystem
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            maxWidth: '650px',
            margin: '0 auto 2rem auto'
          }}
        >
          GSTIN-verified onboarding, automated split settlement,
          Section 194O TDS compliance, and SLA-driven order lifecycle
          management.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem'
          }}
        >

          <Link
            to="/shop"
            className="btn btn-primary"
            style={{
              padding: '0.85rem 1.75rem',
              fontSize: '1rem'
            }}
          >
            Explore Catalogue
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/register"
            className="btn btn-secondary"
            style={{
              padding: '0.85rem 1.75rem',
              fontSize: '1rem'
            }}
          >
            Register as Vendor
          </Link>

        </div>

      </div>

      {/* =================================================
          FEATURE HIGHLIGHTS
      ================================================= */}

      <div
        className="grid-3"
        style={{
          marginBottom: '3rem'
        }}
      >

        <div
          className="glass-card"
          style={{
            textAlign: 'center'
          }}
        >

          <ShieldCheck
            size={36}
            color="var(--accent-light)"
            style={{
              marginBottom: '0.75rem'
            }}
          />

          <h3>
            Verified Vendor Onboarding
          </h3>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginTop: '0.5rem'
            }}
          >
            GSTIN & bank account penny-drop verification
            before products go live.
          </p>

        </div>

        <div
          className="glass-card"
          style={{
            textAlign: 'center'
          }}
        >

          <Truck
            size={36}
            color="var(--success)"
            style={{
              marginBottom: '0.75rem'
            }}
          />

          <h3>
            Automated Split Settlement
          </h3>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginTop: '0.5rem'
            }}
          >
            Real-time platform commission netting and
            1% TDS Form 16A calculations.
          </p>

        </div>

        <div
          className="glass-card"
          style={{
            textAlign: 'center'
          }}
        >

          <RefreshCw
            size={36}
            color="var(--warning)"
            style={{
              marginBottom: '0.75rem'
            }}
          />

          <h3>
            7/30-Day Return & Dispute Resolution
          </h3>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginTop: '0.5rem'
            }}
          >
            Automated reverse pickup booking and
            Category Manager arbitration.
          </p>

        </div>

      </div>

      {/* =================================================
          CATEGORY GRID
      ================================================= */}

      <div
        style={{
          marginBottom: '3rem'
        }}
      >

        <h2
          style={{
            marginBottom: '1.5rem'
          }}
        >
          Popular Categories
        </h2>

        <div className="grid-3">

          {categories.map((c) => (

            <div
              key={c.id}
              className="glass-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >

              <div>

                <h3>
                  {c.name}
                </h3>

                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem'
                  }}
                >
                  GST Rate: {c.gstRate}% | Commission: {c.commissionRate}%
                </p>

              </div>

              <span className="badge badge-info">
                {c.returnWindowDays}-Day Return
              </span>

            </div>

          ))}

        </div>

      </div>

      {/* =================================================
          FEATURED PRODUCTS
      ================================================= */}

      <div>

        <h2
          style={{
            marginBottom: '1.5rem'
          }}
        >
          Featured Marketplace Listings
        </h2>

        <div className="grid-3">

          {products.map((product) => {

            // IMPORTANT:
            // Convert backend image path into complete URL
            const imageUrl = getImageUrl(product.imageUrl);

            return (

              <div
                key={product.id}
                className="glass-card"
              >

                {/* =================================================
                    PRODUCT IMAGE
                ================================================= */}

                <div
                  style={{
                    width: '100%',
                    height: '160px',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1rem',
                    background: '#000'
                  }}
                >

                  <img
                    src={imageUrl}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}

                    // If image fails, show fallback image
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://picsum.photos/400/300';
                    }}
                  />

                </div>

                {/* =================================================
                    PRODUCT NAME
                ================================================= */}

                <h3>
                  {product.name}
                </h3>

                {/* =================================================
                    PRICE
                ================================================= */}

                <p
                  style={{
                    color: 'var(--accent-light)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    margin: '0.5rem 0'
                  }}
                >
                  ₹{product.basePrice}

                  <span
                    style={{
                      textDecoration: 'line-through',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      marginLeft: '0.5rem'
                    }}
                  >
                    ₹{product.mrp}
                  </span>

                </p>

                {/* =================================================
                    VIEW PRODUCT BUTTON
                ================================================= */}

                <Link
                  to="/shop"
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    marginTop: '0.5rem'
                  }}
                >
                  View Product Details
                </Link>

              </div>

            );

          })}

        </div>

      </div>

    </div>
  );
};

export default Home;


// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import API from '../services/api';
// import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Star, ArrowRight } from 'lucide-react';

// const Home = () => {
//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     API.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
//     API.get('/products?status=ACTIVE').then((res) => setProducts(res.data.slice(0, 3))).catch(() => {});
//   }, []);

//   return (
//     <div>
//       {/* Hero Banner */}
//       <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', marginBottom: '3rem', background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.25), transparent)' }}>
//         <span className="badge badge-primary" style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}>
//           Multi-Vendor E-Commerce Marketplace Platform
//         </span>
//         <h1 style={{ fontSize: '3rem', lineHeight: '1.2', marginBottom: '1rem', maxWidth: '800px', margin: '0 auto 1rem auto' }}>
//           Connect Vendors, Customers, & Logistics in One Seamless Ecosystem
//         </h1>
//         <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto 2rem auto' }}>
//           GSTIN-verified onboarding, automated split settlement, Section 194O TDS compliance, and SLA-driven order lifecycle management.
//         </p>
//         <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
//           <Link to="/shop" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
//             Explore Catalogue <ArrowRight size={18} />
//           </Link>
//           <Link to="/register" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
//             Register as Vendor
//           </Link>
//         </div>
//       </div>

//       {/* Feature Highlights */}
//       <div className="grid-3" style={{ marginBottom: '3rem' }}>
//         <div className="glass-card" style={{ textAlign: 'center' }}>
//           <ShieldCheck size={36} color="var(--accent-light)" style={{ marginBottom: '0.75rem' }} />
//           <h3>Verified Vendor Onboarding</h3>
//           <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
//             GSTIN & bank account penny-drop verification before products go live.
//           </p>
//         </div>

//         <div className="glass-card" style={{ textAlign: 'center' }}>
//           <Truck size={36} color="var(--success)" style={{ marginBottom: '0.75rem' }} />
//           <h3>Automated Split Settlement</h3>
//           <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
//             Real-time platform commission netting and 1% TDS Form 16A calculations.
//           </p>
//         </div>

//         <div className="glass-card" style={{ textAlign: 'center' }}>
//           <RefreshCw size={36} color="var(--warning)" style={{ marginBottom: '0.75rem' }} />
//           <h3>7/30-Day Return & Dispute Resolution</h3>
//           <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
//             Automated reverse pickup booking and Category Manager arbitration.
//           </p>
//         </div>
//       </div>

//       {/* Category Grid */}
//       <div style={{ marginBottom: '3rem' }}>
//         <h2 style={{ marginBottom: '1.5rem' }}>Popular Categories</h2>
//         <div className="grid-3">
//           {categories.map((c) => (
//             <div key={c.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <div>
//                 <h3>{c.name}</h3>
//                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
//                   GST Rate: {c.gstRate}% | Commission: {c.commissionRate}%
//                 </p>
//               </div>
//               <span className="badge badge-info">{c.returnWindowDays}-Day Return</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Featured Products */}
//       <div>
//         <h2 style={{ marginBottom: '1.5rem' }}>Featured Marketplace Listings</h2>
//         <div className="grid-3">
//           {products.map((product) => (
//             <div key={product.id} className="glass-card">
//               <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }} />
//               <h3>{product.name}</h3>
//               <p style={{ color: 'var(--accent-light)', fontSize: '1.25rem', fontWeight: 700, margin: '0.5rem 0' }}>
//                 ₹{product.basePrice} <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem' }}>₹{product.mrp}</span>
//               </p>
//               <Link to="/shop" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }}>
//                 View Product Details
//               </Link>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Wishlist from "./pages/Wishlist";
import { AuthProvider } from './context/AuthContext';

import ErrorBoundary from './components/ErrorBoundary';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import VendorManagement from './pages/VendorManagement';
import FinancePanel from './pages/FinancePanel';
import AdminPanel from './pages/AdminPanel';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>

          <div className="app-container">

            <NavBar />

            <main className="main-content">

              <Routes>

                {/* Public Routes */}
                <Route path="/" element={<Home />} />

                <Route
                  path="/login"
                  element={<Login />}
                />

                <Route
                  path="/register"
                  element={<Register />}
                />

                <Route
                  path="/shop"
                  element={<Shop />}
                />


                {/* Protected Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />


                {/* Customer Cart */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute allowedRoles={['CUSTOMER']}>
                      <Cart />
                    </ProtectedRoute>
                  }
                />


                {/* Orders */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />


                {/* Vendor Management */}
                <Route
                  path="/vendor"
                  element={
                    <ProtectedRoute
                      allowedRoles={['VENDOR', 'ADMIN']}
                    >
                      <VendorManagement />
                    </ProtectedRoute>
                  }
                />


                {/* Finance */}
                <Route
                  path="/finance"
                  element={
                    <ProtectedRoute
                      allowedRoles={[
                        'FINANCE_OFFICER',
                        'ADMIN',
                        'VENDOR'
                      ]}
                    >
                      <FinancePanel />
                    </ProtectedRoute>
                  }
                />


                {/* Admin */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute
                      allowedRoles={[
                        'ADMIN',
                        'CATEGORY_MANAGER'
                      ]}
                    >
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />


                {/* Analytics */}
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />


                {/* ================================
                    PROFILE
                   ================================ */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                   element={<Wishlist />}
                 />

              </Routes>

            </main>

            <Footer />

          </div>

        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;


// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import ErrorBoundary from './components/ErrorBoundary';
// import NavBar from './components/NavBar';
// import Footer from './components/Footer';
// import ProtectedRoute from './components/ProtectedRoute';

// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
// import Shop from './pages/Shop';
// import Cart from './pages/Cart';
// import Orders from './pages/Orders';
// import VendorManagement from './pages/VendorManagement';
// import FinancePanel from './pages/FinancePanel';
// import AdminPanel from './pages/AdminPanel';
// import Analytics from './pages/Analytics';

// function App() {
//   return (
//     <ErrorBoundary>
//       <AuthProvider>
//         <Router>
//           <div className="app-container">
//             <NavBar />
//             <main className="main-content">
//               <Routes>
//                 <Route path="/" element={<Home />} />
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/shop" element={<Shop />} />

//                 <Route
//                   path="/dashboard"
//                   element={
//                     <ProtectedRoute>
//                       <Dashboard />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/cart"
//                   element={
//                     <ProtectedRoute allowedRoles={['CUSTOMER']}>
//                       <Cart />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/orders"
//                   element={
//                     <ProtectedRoute>
//                       <Orders />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/vendor"
//                   element={
//                     <ProtectedRoute allowedRoles={['VENDOR', 'ADMIN']}>
//                       <VendorManagement />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/finance"
//                   element={
//                     <ProtectedRoute allowedRoles={['FINANCE_OFFICER', 'ADMIN', 'VENDOR']}>
//                       <FinancePanel />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/admin"
//                   element={
//                     <ProtectedRoute allowedRoles={['ADMIN', 'CATEGORY_MANAGER']}>
//                       <AdminPanel />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/analytics"
//                   element={
//                     <ProtectedRoute>
//                       <Analytics />
//                     </ProtectedRoute>
//                   }
//                 />
//               </Routes>
//             </main>
//             <Footer />
//           </div>
//         </Router>
//       </AuthProvider>
//     </ErrorBoundary>
//   );
// }

// export default App;

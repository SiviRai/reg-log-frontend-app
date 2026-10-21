import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import { useAuth } from './context/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

function App() {
  const { currentUser } = useAuth();

  // Shopping Cart state with localStorage persistence
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('luxecart_cart_items');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 101,
              title: 'Minimalist Chronograph Mesh Watch',
              category: 'Watches',
              price: '₹2,199',
              emoji: '⌚',
              quantity: 1
            }
          ];
    } catch {
      return [];
    }
  });

  // Recent Orders State with localStorage persistence
  const [userOrders, setUserOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('luxecart_user_orders');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'ord_1',
              orderId: '#LX-9482',
              itemTitle: 'Minimalist Chronograph Mesh Watch',
              carrier: 'BlueDart Air Express',
              status: 'Shipped',
              statusText: 'Shipped via BlueDart • Arriving Tomorrow',
              badgeIcon: '🚚',
              badgeColor: '#4F46E5',
              badgeBg: '#EEF2FF',
              address: 'Flat 402, Royal Palms Residency, Sector 62, Noida, UP - 201309',
              recipient: 'Sivi Rai',
              mobile: '9876543210',
              paymentMode: 'Cash on Delivery',
              totalPaid: '₹2,199',
              orderDate: '16 Oct 2025'
            },
            {
              id: 'ord_2',
              orderId: '#LX-8910',
              itemTitle: 'Rose Gold Luxury Crystal Watch',
              carrier: 'Delhivery Surface',
              status: 'Delivered',
              statusText: 'Delivered on Oct 14 • Return window active',
              badgeIcon: '✅',
              badgeColor: '#059669',
              badgeBg: '#ECFDF5',
              address: 'Flat 402, Royal Palms Residency, Sector 62, Noida, UP - 201309',
              recipient: 'Sivi Rai',
              mobile: '9876543210',
              paymentMode: 'UPI (Google Pay)',
              totalPaid: '₹3,499',
              orderDate: '14 Oct 2025'
            }
          ];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Persist cart changes
  useEffect(() => {
    try {
      localStorage.setItem('luxecart_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Persist orders changes
  useEffect(() => {
    try {
      localStorage.setItem('luxecart_user_orders', JSON.stringify(userOrders));
    } catch (e) {
      console.error(e);
    }
  }, [userOrders]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added ${product.title} to your bag! 🛍️`);
  };

  const handleUpdateQuantity = (productId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    showToast('Item removed from your bag.');
  };

  // Called when order is successfully placed in CheckoutModal
  const handleOrderPlaced = (newOrder) => {
    setUserOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    showToast(`Order ${newOrder.orderId} placed successfully! 🎉`);
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="app-container">
      {/* Ambient Floating Glow Orbs for Real Glassmorphism Effect */}
      <div className="glass-orb glass-orb-1" aria-hidden="true" />
      <div className="glass-orb glass-orb-2" aria-hidden="true" />
      <div className="glass-orb glass-orb-3" aria-hidden="true" />

      {/* Floating Modern Toast Notification */}
      {toastMessage && (
        <div className="glass-toast-notification">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout & Delivery Address Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        onOrderPlaced={handleOrderPlaced}
      />

      <main className="main-content">
        <Routes>
          {/* Public Customer Authentication Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Customer Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home
                  onAddToCart={handleAddToCart}
                  onOpenCart={() => setIsCartOpen(true)}
                  showToast={showToast}
                  userOrders={userOrders}
                  onBuyNow={(product) => {
                    handleAddToCart(product);
                    setIsCheckoutOpen(true);
                  }}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} <strong>LuxeCart</strong> — Minimalist Glassmorphic E-Commerce Authentication & Ordering Platform
        </p>
      </footer>
    </div>
  );
}

export default App;

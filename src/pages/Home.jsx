import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { decodeJWT } from '../utils/crypto';
import OrderTrackingModal from '../components/OrderTrackingModal';
import { ALL_PRODUCTS, CATEGORIES, CATEGORY_LABELS } from '../data/products';

const Home = ({ onAddToCart, onOpenCart, showToast, userOrders = [], onBuyNow }) => {
  const { currentUser, jwtToken, logout } = useAuth();
  const navigate = useNavigate();

  const [copiedToken, setCopiedToken] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Quick View Product Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || 'Free Size');
    setSelectedColor(product.colors?.[0] || '');
  };

  // Order tracking modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userName = currentUser?.name || 'Valued Customer';
  const userEmail = currentUser?.email || 'customer@luxecart.com';
  const userMobile = currentUser?.mobile || '9876543210';
  const initial = userName.charAt(0).toUpperCase();

  const decodedTokenData = decodeJWT(jwtToken);

  const handleCopyJWT = () => {
    if (jwtToken) {
      navigator.clipboard.writeText(jwtToken);
      setCopiedToken(true);
      if (showToast) showToast('JWT Access Token copied to clipboard! 📋');
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  // Comprehensive Product Catalogue loaded from data/products.js (44 Items)
  const allProducts = ALL_PRODUCTS;

  // Filter & Sort Logic
  const filteredProducts = allProducts
    .filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.numericPrice - b.numericPrice;
      if (sortBy === 'price-high') return b.numericPrice - a.numericPrice;
      if (sortBy === 'rating') return parseFloat(b.rating) - parseFloat(a.rating);
      return 0;
    });

  const categories = CATEGORIES;

  const handleOpenTracking = (order) => {
    setSelectedOrder(order);
    setIsTrackingModalOpen(true);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        order={selectedOrder}
      />

      {/* Quick View Product Details Modal */}
      {selectedProduct && (
        <div className="tracking-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="tracking-modal" style={{ maxWidth: '580px', maxHeight: '92vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="tracking-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{selectedProduct.emoji}</span>
                <div>
                  <span className="tracking-badge">{selectedProduct.category}</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                    {selectedProduct.title}
                  </h3>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedProduct(null)} className="cart-close-btn">
                ✕
              </button>
            </div>

            <div style={{ margin: '0.85rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4F46E5' }}>
                  {selectedProduct.price}
                </span>
                <span style={{ fontSize: '0.95rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                  {selectedProduct.originalPrice}
                </span>
                <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem' }}>
                  (Save {Math.round((1 - selectedProduct.numericPrice / parseInt(selectedProduct.originalPrice.replace(/[^0-9]/g, ''))) * 100)}% OFF)
                </span>
              </div>
              <div style={{ fontSize: '0.825rem', color: '#F59E0B', fontWeight: 700, marginTop: '0.25rem' }}>
                {selectedProduct.rating} ({selectedProduct.reviews || 95} verified customer reviews)
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, background: 'rgba(241, 245, 249, 0.7)', padding: '0.75rem 0.9rem', borderRadius: '10px' }}>
              {selectedProduct.desc}
            </p>

            {/* Product Specifications & Pattern Attributes */}
            <div style={{
              margin: '0.85rem 0',
              padding: '0.75rem 0.9rem',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontSize: '0.825rem'
            }}>
              {selectedProduct.pattern && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>🎨 Pattern / Print:</span>
                  <span style={{ fontWeight: 700, color: '#4F46E5' }}>{selectedProduct.pattern}</span>
                </div>
              )}
              {selectedProduct.fabric && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>🧵 Fabric / Material:</span>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{selectedProduct.fabric}</span>
                </div>
              )}
              {selectedProduct.fit && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>📐 Cut & Fit:</span>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{selectedProduct.fit}</span>
                </div>
              )}
              {selectedProduct.strap && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>⌚ Strap Type:</span>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{selectedProduct.strap}</span>
                </div>
              )}
            </div>

            {/* Interactive Size Selector */}
            {selectedProduct.sizes && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.825rem', color: '#1E293B', fontWeight: 700 }}>
                    Select Size: <span style={{ color: '#4F46E5' }}>{selectedSize}</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>True to Size</span>
                </div>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {selectedProduct.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: selectedSize === s ? '2px solid #4F46E5' : '1px solid #CBD5E1',
                        background: selectedSize === s ? '#EEF2FF' : '#ffffff',
                        color: selectedSize === s ? '#4F46E5' : '#334155',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Color Selector */}
            {selectedProduct.colors && (
              <div style={{ marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.825rem', color: '#1E293B', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  Available Colors: <span style={{ color: '#4F46E5' }}>{selectedColor}</span>
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {selectedProduct.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      style={{
                        fontSize: '0.75rem',
                        background: selectedColor === c ? '#EEF2FF' : '#ffffff',
                        border: selectedColor === c ? '2px solid #4F46E5' : '1px solid #CBD5E1',
                        color: selectedColor === c ? '#4F46E5' : '#475569',
                        padding: '0.3rem 0.7rem',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {selectedColor === c ? `✓ ${c}` : c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  const itemWithAttributes = {
                    ...selectedProduct,
                    title: selectedSize && selectedSize !== 'Free Size' ? `${selectedProduct.title} (${selectedSize})` : selectedProduct.title,
                    selectedSize,
                    selectedColor
                  };
                  onAddToCart && onAddToCart(itemWithAttributes);
                  setSelectedProduct(null);
                }}
                className="btn btn-primary"
                style={{ flex: 1.4, padding: '0.75rem' }}
              >
                Add to Bag 🛍️
              </button>
              <button
                type="button"
                onClick={() => {
                  const itemWithAttributes = {
                    ...selectedProduct,
                    title: selectedSize && selectedSize !== 'Free Size' ? `${selectedProduct.title} (${selectedSize})` : selectedProduct.title,
                    selectedSize,
                    selectedColor
                  };
                  setSelectedProduct(null);
                  if (onBuyNow) {
                    onBuyNow(itemWithAttributes);
                  } else {
                    onAddToCart && onAddToCart(itemWithAttributes);
                    if (onOpenCart) onOpenCart();
                  }
                }}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-tag">LuxeCart Member Portal</span>
          <h1 className="hero-title">Welcome back, {userName}!</h1>
          <p className="hero-subtitle">
            Authenticated via secure JWT Access Token. Explore our vast collections of Designer Tops, Denim Jeans, Casual & Formal Shirts, Graphic Tees, and Luxury Watches with live tracking.
          </p>
        </div>
        <div className="hero-actions">
          <Link
            to="/change-password"
            className="btn-hero-logout"
            style={{ textDecoration: 'none', background: 'rgba(255, 255, 255, 0.25)' }}
          >
            Change Password
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-hero-logout"
            title="Log out of your account"
          >
            Logout
          </button>
        </div>
      </section>

      {/* Customer Spotlight Card */}
      <section className="profile-spotlight">
        <div className="profile-info">
          <div className="profile-avatar">{initial}</div>
          <div>
            <h2 className="profile-name">{userName}</h2>
            <div className="profile-email">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>{userEmail}</span>
              <span style={{ margin: '0 0.4rem', opacity: 0.5 }}>•</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>+91 {userMobile}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="profile-status">
            <span className="status-dot"></span>
            <span>VIP Gold Member</span>
          </div>
          <button
            type="button"
            onClick={onOpenCart}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            View Bag 🛍️
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            Logout
          </button>
        </div>
      </section>

      {/* Quick E-Commerce Stat Cards */}
      <section className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Orders</span>
            <div className="stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
              📦
            </div>
          </div>
          <div className="stat-value">{userOrders.length} Orders</div>
          <div className="stat-footer" style={{ color: '#059669', fontWeight: 600 }}>
            Live Tracking Active
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Saved Wishlist</span>
            <div className="stat-icon" style={{ background: '#FFF1F2', color: '#E11D48' }}>
              ❤️
            </div>
          </div>
          <div className="stat-value">8 Items</div>
          <div className="stat-footer">2 Items on Discount</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Reward Coins</span>
            <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
              🪙
            </div>
          </div>
          <div className="stat-value">1,450 Pts</div>
          <div className="stat-footer">₹500 Discount Eligible</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Authentication</span>
            <div className="stat-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
              🔐
            </div>
          </div>
          <div className="stat-value">JWT HS256</div>
          <div className="stat-footer" style={{ color: '#059669', fontWeight: 600 }}>
            Token Verified & Secure
          </div>
        </div>
      </section>

      {/* Product Showcase with Extensive Watches Catalogue, Filters, Search & Sort */}
      <section className="content-box">
        <div className="content-box-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{selectedCategory === 'All' ? '🛍️ LuxeCart Complete Fashion & Lifestyle Store' : `${CATEGORY_LABELS[selectedCategory] || selectedCategory}`}</span>
            <span style={{ fontSize: '0.75rem', background: '#EEF2FF', color: '#4F46E5', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '9999px' }}>
              {filteredProducts.length} Items Available
            </span>
          </div>
          <span style={{ fontSize: '0.8125rem', color: '#6366F1', fontWeight: 600 }}>
            Member Exclusive Pricing
          </span>
        </div>

        {/* Filter, Search & Sort Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' }}>
          {/* Category Filter Pills */}
          <div className="filter-pills-container" style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.3rem', maxWidth: '100%' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                style={{ whiteSpace: 'nowrap' }}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
              style={{ padding: '0.42rem 0.75rem', fontSize: '0.82rem', width: 'auto', background: 'rgba(255, 255, 255, 0.75)' }}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated (Stars)</option>
            </select>

            {/* Search Box */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="form-input"
              style={{ padding: '0.42rem 0.75rem', fontSize: '0.82rem', minWidth: '180px' }}
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
            <span style={{ fontSize: '2.5rem' }}>🔍</span>
            <p style={{ fontWeight: 700, marginTop: '0.5rem' }}>No products match your search or filter.</p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="btn-quick-fill"
              style={{ marginTop: '0.5rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card-glass"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '2.4rem' }}>{product.emoji}</span>
                  <span
                    style={{
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: '#4F46E5',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}
                  >
                    {product.badge}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                      {product.category}
                    </span>
                    {product.sizes && (
                      <span style={{ fontSize: '0.68rem', color: '#059669', background: '#ECFDF5', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                        {product.sizes.length} Sizes
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#1E293B', marginTop: '0.15rem', minHeight: '2.4rem', lineHeight: 1.3 }}>
                    {product.title}
                  </h4>
                  {product.pattern && (
                    <div style={{ fontSize: '0.75rem', color: '#4F46E5', fontWeight: 600, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>🎨</span> <span>{product.pattern}</span>
                    </div>
                  )}
                  {product.fit && (
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem' }}>
                      📐 {product.fit}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.4rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    {product.price}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                    {product.originalPrice}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B' }}>
                    {product.rating}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                    onClick={() => handleOpenProduct(product)}
                    title="View item specifications, pattern, and size chart"
                  >
                    Quick View
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1.2, padding: '0.5rem', fontSize: '0.8rem' }}
                    onClick={() => onAddToCart && onAddToCart(product)}
                  >
                    Add to Bag 🛍️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Two Column Section: Live Placed Orders & Account Details */}
      <section className="dashboard-details-row">
        {/* Recent Orders with Clickable Live Tracking */}
        <div className="content-box">
          <div className="content-box-title">
            <span>Recent Orders ({userOrders.length})</span>
            <span style={{ fontSize: '0.8125rem', color: '#6366F1', fontWeight: 600 }}>
              Click to Track Package
            </span>
          </div>

          <div className="activity-list">
            {userOrders.map((ord) => (
              <div
                key={ord.id}
                className="activity-item order-clickable-row"
                onClick={() => handleOpenTracking(ord)}
                title="Click to view delivery tracking stepper"
              >
                <div className="activity-badge" style={{ background: ord.badgeBg || '#EEF2FF', color: ord.badgeColor || '#4F46E5' }}>
                  {ord.badgeIcon || '📦'}
                </div>
                <div className="activity-details">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div className="activity-heading">
                      Order {ord.orderId}: {ord.itemTitle}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4F46E5' }}>
                      Track ➔
                    </span>
                  </div>
                  <div className="activity-time">{ord.statusText || 'In Transit'}</div>
                  {ord.address && (
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                      📍 Deliver to: {ord.recipient} • {ord.address}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Details Box */}
        <div className="content-box">
          <h3 className="content-box-title">Account Security Details</h3>

          <div className="security-item">
            <span className="security-label">Customer Name:</span>
            <span className="security-val">{userName}</span>
          </div>

          <div className="security-item">
            <span className="security-label">Registered Email:</span>
            <span className="security-val" style={{ wordBreak: 'break-all' }}>
              {userEmail}
            </span>
          </div>

          <div className="security-item">
            <span className="security-label">Registered Mobile:</span>
            <span className="security-val">+91 {userMobile}</span>
          </div>

          <div className="security-item">
            <span className="security-label">Password Encryption:</span>
            <span className="security-val" style={{ color: '#059669' }}>SHA-256 Crypto Hashed</span>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <Link
              to="/change-password"
              className="btn btn-secondary"
              style={{ padding: '0.65rem 1rem', fontSize: '0.875rem', width: '100%', textAlign: 'center' }}
            >
              Change Password
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-danger btn-block"
              style={{ padding: '0.65rem 1rem', fontSize: '0.875rem' }}
            >
              Logout Securely
            </button>
          </div>
        </div>
      </section>

      {/* JWT Security & Session Inspector Box */}
      <section className="content-box">
        <div className="content-box-title">
          <span>JWT Authentication & Session Inspector</span>
          <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
            Verified Token
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.55)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase' }}>
                Bearer JWT Access Token
              </span>
              <button
                type="button"
                onClick={handleCopyJWT}
                className="btn-quick-fill"
                style={{ fontSize: '0.7rem' }}
              >
                {copiedToken ? 'Copied!' : 'Copy Token'}
              </button>
            </div>
            <p style={{
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              color: '#334155',
              wordBreak: 'break-all',
              lineHeight: 1.4,
              maxHeight: '65px',
              overflowY: 'auto',
              background: 'rgba(241, 245, 249, 0.7)',
              padding: '0.5rem',
              borderRadius: '6px'
            }}>
              {jwtToken || 'No active JWT token found'}
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.55)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Decoded Claims & Payload
            </span>
            <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div><strong>Subject (sub):</strong> {decodedTokenData?.payload?.sub || userEmail}</div>
              <div><strong>Customer ID:</strong> {decodedTokenData?.payload?.id || currentUser?.id}</div>
              <div><strong>Mobile:</strong> {decodedTokenData?.payload?.mobile || userMobile}</div>
              <div><strong>Role:</strong> {decodedTokenData?.payload?.role || 'customer'}</div>
              <div><strong>Algorithm:</strong> {decodedTokenData?.header?.alg || 'HS256'}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

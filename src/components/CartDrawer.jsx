import React from 'react';

/**
 * Glassmorphic Cart Drawer Component
 * Slides in from the right with frosted blur, item list, quantity controls, and checkout trigger
 */
const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onProceedToCheckout }) => {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => {
    const num = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
    return acc + num * item.quantity;
  }, 0);

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🛍️</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
              Your Shopping Bag
            </h3>
            <span className="cart-badge-count">{cartItems.length}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cart-close-btn"
            aria-label="Close cart drawer"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body: Items List */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <span style={{ fontSize: '3.5rem', opacity: 0.6 }}>🛒</span>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', marginTop: '0.75rem' }}>
                Your bag is empty
              </p>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
                Explore the watch gallery or trending items and add them to your shopping bag.
              </p>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="cart-item-emoji">{item.emoji}</div>
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.title}</h4>
                    <span className="cart-item-price">{item.price}</span>

                    <div className="cart-quantity-controls">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="btn-qty"
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="btn-qty"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="cart-remove-btn"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer: Total & Checkout Button */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Delivery:</span>
              <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem' }}>
                FREE (VIP Member)
              </span>
            </div>
            <div className="cart-summary-row" style={{ marginTop: '0.25rem', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                Estimated Total:
              </span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#4F46E5' }}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="btn btn-primary btn-block"
              style={{ padding: '0.85rem', fontSize: '1rem' }}
            >
              Enter Address & Checkout ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;

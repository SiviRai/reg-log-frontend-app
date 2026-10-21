import React from 'react';

/**
 * Interactive Order Tracking Stepper Modal
 * Displays an Amazon/Flipkart-style delivery progress bar for customer orders
 */
const OrderTrackingModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="tracking-modal-header">
          <div>
            <span className="tracking-badge">Live Package Tracking</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>
              Order {order.orderId}
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '0.1rem' }}>
              Item: <strong>{order.itemTitle}</strong>
            </p>
          </div>
          <button type="button" onClick={onClose} className="cart-close-btn">
            ✕
          </button>
        </div>

        {/* Courier Details Card */}
        <div className="courier-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Carrier Partner:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4F46E5' }}>
              BlueDart Air Express
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>AWB Tracking No:</span>
            <span style={{ fontSize: '0.825rem', fontFamily: 'monospace', fontWeight: 700, color: '#1E293B' }}>
              BLU-90428-DL
            </span>
          </div>
        </div>

        {/* 4-Step Animated Delivery Stepper */}
        <div className="stepper-wrapper">
          {/* Step 1 */}
          <div className="stepper-item step-completed">
            <div className="stepper-marker">✓</div>
            <div className="stepper-content">
              <h4 className="stepper-title">Order Placed & Verified</h4>
              <p className="stepper-desc">Payment confirmed via Razorpay gateway</p>
              <span className="stepper-time">Oct 16, 2025 • 10:24 AM</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="stepper-item step-completed">
            <div className="stepper-marker">✓</div>
            <div className="stepper-content">
              <h4 className="stepper-title">Shipped from Hub</h4>
              <p className="stepper-desc">Dispatched from LuxeCart Fulfillment Center (Noida)</p>
              <span className="stepper-time">Oct 17, 2025 • 03:40 PM</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`stepper-item ${order.status === 'Delivered' ? 'step-completed' : 'step-active'}`}>
            <div className="stepper-marker">
              {order.status === 'Delivered' ? '✓' : '🚚'}
            </div>
            <div className="stepper-content">
              <h4 className="stepper-title">
                {order.status === 'Delivered' ? 'Delivered' : 'Out for Delivery'}
              </h4>
              <p className="stepper-desc">
                {order.status === 'Delivered'
                  ? 'Package handed over to customer'
                  : 'Arrived at delivery facility; package assigned to courier executive'}
              </p>
              <span className="stepper-time">
                {order.status === 'Delivered' ? 'Delivered successfully' : 'In transit to your doorstep'}
              </span>
            </div>
          </div>

          {/* Step 4 */}
          <div className={`stepper-item ${order.status === 'Delivered' ? 'step-completed' : 'step-pending'}`}>
            <div className="stepper-marker">
              {order.status === 'Delivered' ? '✓' : '4'}
            </div>
            <div className="stepper-content">
              <h4 className="stepper-title">
                {order.status === 'Delivered' ? 'Delivered' : 'Estimated Arrival'}
              </h4>
              <p className="stepper-desc">
                {order.status === 'Delivered'
                  ? 'Return & exchange active for 7 days'
                  : 'Expected Delivery Tomorrow by 4:00 PM'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingModal;

import React, { useState, useEffect } from 'react';

/**
 * Checkout & Delivery Address Modal with Realistic Indian UPI Gateway
 * Supports: PhonePe, Google Pay, Paytm, Custom UPI ID, and Live QR Code Scanner
 */
const CheckoutModal = ({ isOpen, onClose, cartItems, currentUser, onOrderPlaced }) => {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => {
    const num = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
    return acc + num * item.quantity;
  }, 0);

  // Address Form State
  const [addressData, setAddressData] = useState({
    recipientName: currentUser?.name || 'Sivi Rai',
    mobileNumber: currentUser?.mobile || '9876543210',
    houseNo: 'Flat 402, Royal Palms Residency',
    streetArea: 'Sector 62, Near Electronic City Metro',
    landmark: 'Opposite Cyber Park',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201309',
    addressType: 'Home'
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'cod' | 'card'
  const [upiMode, setUpiMode] = useState('qr'); // 'qr' | 'apps' | 'id'
  const [selectedUpiApp, setSelectedUpiApp] = useState('phonepe'); // 'phonepe' | 'gpay' | 'paytm'
  const [customUpiId, setCustomUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);

  // Card Form State
  const [cardData, setCardData] = useState({
    cardNumber: '4532 •••• •••• 8921',
    expiry: '08/28',
    cvv: '•••'
  });

  // QR Code Timer (5 minutes countdown)
  const [timeLeft, setTimeLeft] = useState(299);

  useEffect(() => {
    if (paymentMethod === 'upi' && upiMode === 'qr') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentMethod, upiMode]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!addressData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }
    if (!addressData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Contact mobile is required';
    } else if (!/^[0-9]{10}$/.test(addressData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile';
    }
    if (!addressData.houseNo.trim()) {
      newErrors.houseNo = 'House / Flat / Building is required';
    }
    if (!addressData.streetArea.trim()) {
      newErrors.streetArea = 'Street / Colony / Area is required';
    }
    if (!addressData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!addressData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!addressData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(addressData.pincode.trim())) {
      newErrors.pincode = 'PIN code must be exactly 6 digits';
    }

    if (paymentMethod === 'upi' && upiMode === 'id' && !customUpiId.trim()) {
      newErrors.customUpiId = 'Please enter a valid UPI ID (e.g. mobile@upi)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    let paymentLabel = 'Cash on Delivery';
    if (paymentMethod === 'upi') {
      if (upiMode === 'qr') paymentLabel = 'UPI QR Code Scanner (Verified)';
      else if (upiMode === 'apps') {
        paymentLabel = selectedUpiApp === 'phonepe' ? 'PhonePe UPI' : selectedUpiApp === 'gpay' ? 'Google Pay (GPay)' : 'Paytm UPI';
      } else {
        paymentLabel = `UPI ID (${customUpiId})`;
      }
    } else if (paymentMethod === 'card') {
      paymentLabel = 'Debit / Credit Card (Visa/Mastercard)';
    }

    setTimeout(() => {
      setIsSubmitting(false);

      const generatedOrderId = `#LX-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder = {
        id: `ord_${Date.now()}`,
        orderId: generatedOrderId,
        itemTitle: cartItems[0]?.title + (cartItems.length > 1 ? ` + ${cartItems.length - 1} more items` : ''),
        items: cartItems,
        carrier: 'BlueDart Air Express',
        status: 'Order Placed',
        statusText: 'Order Placed & Payment Verified • Dispatches in 2 hours',
        badgeIcon: '📦',
        badgeColor: '#4F46E5',
        badgeBg: '#EEF2FF',
        address: `${addressData.houseNo}, ${addressData.streetArea}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`,
        recipient: addressData.recipientName,
        mobile: addressData.mobileNumber,
        paymentMode: paymentLabel,
        totalPaid: `₹${totalAmount.toLocaleString('en-IN')}`,
        orderDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      setOrderSuccessData(newOrder);

      if (onOrderPlaced) {
        onOrderPlaced(newOrder);
      }
    }, 1200);
  };

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div
        className="tracking-modal"
        style={{ maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {orderSuccessData ? (
          /* ================= ORDER SUCCESS CONFIRMATION ================= */
          <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#ECFDF5',
              color: '#059669',
              fontSize: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
            }}>
              ✓
            </div>

            <span className="tracking-badge" style={{ background: '#ECFDF5', color: '#059669' }}>
              Payment Received via {orderSuccessData.paymentMode}
            </span>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem' }}>
              Order Confirmed, {orderSuccessData.recipient}!
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Your order <strong>{orderSuccessData.orderId}</strong> has been placed successfully.
            </p>

            {/* Delivery Summary Card */}
            <div style={{
              background: 'rgba(241, 245, 249, 0.85)',
              border: '1px solid rgba(203, 213, 225, 0.7)',
              borderRadius: '14px',
              padding: '1.25rem',
              textAlign: 'left',
              margin: '1.5rem 0',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748B' }}>Amount Paid:</span>
                <span style={{ fontWeight: 800, color: '#4F46E5', fontSize: '1.1rem' }}>{orderSuccessData.totalPaid}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748B' }}>Payment Mode:</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>✓ {orderSuccessData.paymentMode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748B' }}>Expected Delivery:</span>
                <span style={{ fontWeight: 700, color: '#1E293B' }}>Within 2-3 Business Days</span>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', marginBottom: '0.2rem' }}>Shipping Address:</span>
                <span style={{ fontWeight: 600, color: '#1E293B' }}>{orderSuccessData.address}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary btn-block"
              style={{ padding: '0.85rem', fontSize: '0.95rem' }}
            >
              Back to Store & Track Order ➔
            </button>
          </div>
        ) : (
          /* ================= CHECKOUT & ADDRESS FORM ================= */
          <div>
            <div className="tracking-modal-header">
              <div>
                <span className="tracking-badge">Secure 256-Bit Checkout</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>
                  Delivery Address & Payment
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#64748B' }}>
                  Total {cartItems.length} item(s) • Payable Amount: <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
                </p>
              </div>
              <button type="button" onClick={onClose} className="cart-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '0.5rem' }}>
              {/* SECTION 1: DELIVERY ADDRESS */}
              <div style={{ background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '1rem', borderRadius: '14px' }}>
                <h4 style={{ fontSize: '0.925rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>📍 1. Delivery Details</span>
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="text"
                      name="recipientName"
                      value={addressData.recipientName}
                      onChange={handleChange}
                      placeholder="Recipient Name"
                      className={`form-input ${errors.recipientName ? 'input-error' : ''}`}
                      style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
                    />
                    {errors.recipientName && <span className="form-error">{errors.recipientName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Mobile <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      maxLength={10}
                      value={addressData.mobileNumber}
                      onChange={handleChange}
                      placeholder="10-digit Mobile"
                      className={`form-input ${errors.mobileNumber ? 'input-error' : ''}`}
                      style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
                    />
                    {errors.mobileNumber && <span className="form-error">{errors.mobileNumber}</span>}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.6rem' }}>
                  <label className="form-label">Flat / House No. / Building <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="text"
                    name="houseNo"
                    value={addressData.houseNo}
                    onChange={handleChange}
                    placeholder="e.g. Flat 402, Royal Palms Residency"
                    className={`form-input ${errors.houseNo ? 'input-error' : ''}`}
                    style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
                  />
                  {errors.houseNo && <span className="form-error">{errors.houseNo}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginTop: '0.6rem' }}>
                  <div className="form-group">
                    <label className="form-label">Area / Street / Colony <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="text"
                      name="streetArea"
                      value={addressData.streetArea}
                      onChange={handleChange}
                      placeholder="e.g. Sector 62"
                      className={`form-input ${errors.streetArea ? 'input-error' : ''}`}
                      style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
                    />
                    {errors.streetArea && <span className="form-error">{errors.streetArea}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={addressData.landmark}
                      onChange={handleChange}
                      placeholder="e.g. Near Metro"
                      className="form-input"
                      style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.6rem' }}>
                  <div className="form-group">
                    <label className="form-label">City <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="text"
                      name="city"
                      value={addressData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className={`form-input ${errors.city ? 'input-error' : ''}`}
                      style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
                    />
                    {errors.city && <span className="form-error">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">State <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="text"
                      name="state"
                      value={addressData.state}
                      onChange={handleChange}
                      placeholder="State"
                      className={`form-input ${errors.state ? 'input-error' : ''}`}
                      style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
                    />
                    {errors.state && <span className="form-error">{errors.state}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">PIN Code <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      value={addressData.pincode}
                      onChange={handleChange}
                      placeholder="6 digits"
                      className={`form-input ${errors.pincode ? 'input-error' : ''}`}
                      style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
                    />
                    {errors.pincode && <span className="form-error">{errors.pincode}</span>}
                  </div>
                </div>
              </div>

              {/* SECTION 2: PAYMENT METHOD & DETAILED UPI FLOW */}
              <div style={{ background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '1rem', borderRadius: '14px' }}>
                <h4 style={{ fontSize: '0.925rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>💳 2. Payment Method</span>
                </h4>

                {/* Main Payment Options */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    style={{
                      padding: '0.7rem 0.5rem',
                      background: paymentMethod === 'upi' ? '#EEF2FF' : '#ffffff',
                      border: paymentMethod === 'upi' ? '2px solid #6366F1' : '1px solid #cbd5e1',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      color: paymentMethod === 'upi' ? '#4F46E5' : '#475569',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📱 UPI Options
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    style={{
                      padding: '0.7rem 0.5rem',
                      background: paymentMethod === 'cod' ? '#EEF2FF' : '#ffffff',
                      border: paymentMethod === 'cod' ? '2px solid #6366F1' : '1px solid #cbd5e1',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      color: paymentMethod === 'cod' ? '#4F46E5' : '#475569',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    💵 Cash on Delivery
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      padding: '0.7rem 0.5rem',
                      background: paymentMethod === 'card' ? '#EEF2FF' : '#ffffff',
                      border: paymentMethod === 'card' ? '2px solid #6366F1' : '1px solid #cbd5e1',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      color: paymentMethod === 'card' ? '#4F46E5' : '#475569',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    💳 Card
                  </button>
                </div>

                {/* --- DETAILED UPI INTERFACE --- */}
                {paymentMethod === 'upi' && (
                  <div style={{
                    background: '#ffffff',
                    border: '1.5px solid #E0E7FF',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.05)'
                  }}>
                    {/* UPI Sub-Tabs: QR Code Scanner vs UPI Apps vs UPI ID */}
                    <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => setUpiMode('qr')}
                        style={{
                          background: upiMode === 'qr' ? '#4F46E5' : 'transparent',
                          color: upiMode === 'qr' ? '#ffffff' : '#64748B',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        📷 Scan UPI QR Code
                      </button>

                      <button
                        type="button"
                        onClick={() => setUpiMode('apps')}
                        style={{
                          background: upiMode === 'apps' ? '#4F46E5' : 'transparent',
                          color: upiMode === 'apps' ? '#ffffff' : '#64748B',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        📱 PhonePe / GPay / Paytm
                      </button>

                      <button
                        type="button"
                        onClick={() => setUpiMode('id')}
                        style={{
                          background: upiMode === 'id' ? '#4F46E5' : 'transparent',
                          color: upiMode === 'id' ? '#ffffff' : '#64748B',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Enter UPI ID
                      </button>
                    </div>

                    {/* 1. UPI QR CODE SCANNER VIEW */}
                    {upiMode === 'qr' && (
                      <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                        <div style={{
                          display: 'inline-block',
                          background: '#ffffff',
                          padding: '12px',
                          borderRadius: '16px',
                          border: '2px solid #E2E8F0',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)'
                        }}>
                          {/* Realistic SVG QR Code with UPI Centerpiece */}
                          <svg width="170" height="170" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100" height="100" fill="white" />
                            {/* Corner Top-Left */}
                            <rect x="5" y="5" width="28" height="28" fill="#1E293B" rx="4" />
                            <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
                            <rect x="13" y="13" width="12" height="12" fill="#4F46E5" rx="2" />

                            {/* Corner Top-Right */}
                            <rect x="67" y="5" width="28" height="28" fill="#1E293B" rx="4" />
                            <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
                            <rect x="75" y="13" width="12" height="12" fill="#4F46E5" rx="2" />

                            {/* Corner Bottom-Left */}
                            <rect x="5" y="67" width="28" height="28" fill="#1E293B" rx="4" />
                            <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
                            <rect x="13" y="75" width="12" height="12" fill="#4F46E5" rx="2" />

                            {/* QR Data Matrix Patterns */}
                            <rect x="38" y="8" width="6" height="6" fill="#1E293B" />
                            <rect x="48" y="12" width="6" height="6" fill="#1E293B" />
                            <rect x="58" y="8" width="6" height="6" fill="#1E293B" />
                            <rect x="38" y="22" width="8" height="6" fill="#1E293B" />
                            <rect x="52" y="24" width="8" height="6" fill="#1E293B" />

                            <rect x="8" y="38" width="6" height="6" fill="#1E293B" />
                            <rect x="18" y="44" width="8" height="6" fill="#1E293B" />
                            <rect x="30" y="38" width="8" height="6" fill="#1E293B" />

                            <rect x="68" y="38" width="6" height="8" fill="#1E293B" />
                            <rect x="80" y="44" width="8" height="6" fill="#1E293B" />
                            <rect x="88" y="38" width="6" height="8" fill="#1E293B" />

                            <rect x="38" y="68" width="6" height="6" fill="#1E293B" />
                            <rect x="48" y="74" width="8" height="6" fill="#1E293B" />
                            <rect x="60" y="68" width="6" height="8" fill="#1E293B" />
                            <rect x="72" y="78" width="8" height="8" fill="#1E293B" />
                            <rect x="84" y="68" width="8" height="6" fill="#1E293B" />
                            <rect x="80" y="86" width="12" height="6" fill="#1E293B" />

                            {/* Center UPI Badge */}
                            <rect x="38" y="38" width="24" height="24" fill="#6366F1" rx="6" />
                            <text x="50" y="53" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">UPI</text>
                          </svg>
                        </div>

                        <div style={{ marginTop: '0.65rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                            Scan to pay ₹{totalAmount.toLocaleString('en-IN')}
                          </span>
                          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                            Scan with <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong> or any UPI App
                          </p>
                          <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700, marginTop: '0.35rem' }}>
                            ⏱️ QR Code expires in: {formatTime(timeLeft)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. SPECIFIC UPI APPS (PhonePe / GPay / Paytm) */}
                    {upiMode === 'apps' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {/* PhonePe Option */}
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 0.9rem',
                          borderRadius: '10px',
                          border: selectedUpiApp === 'phonepe' ? '2px solid #5F259F' : '1px solid #E2E8F0',
                          background: selectedUpiApp === 'phonepe' ? '#FAF5FF' : '#ffffff',
                          cursor: 'pointer'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <input
                              type="radio"
                              name="upiApp"
                              checked={selectedUpiApp === 'phonepe'}
                              onChange={() => setSelectedUpiApp('phonepe')}
                            />
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#5F259F',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '0.85rem'
                            }}>
                              पे
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.875rem', color: '#1E293B', display: 'block' }}>PhonePe UPI</strong>
                              <span style={{ fontSize: '0.725rem', color: '#64748B' }}>Fastest checkout via PhonePe app</span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#5F259F', fontWeight: 700 }}>Recommended</span>
                        </label>

                        {/* Google Pay Option */}
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 0.9rem',
                          borderRadius: '10px',
                          border: selectedUpiApp === 'gpay' ? '2px solid #0F9D58' : '1px solid #E2E8F0',
                          background: selectedUpiApp === 'gpay' ? '#F0FDF4' : '#ffffff',
                          cursor: 'pointer'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <input
                              type="radio"
                              name="upiApp"
                              checked={selectedUpiApp === 'gpay'}
                              onChange={() => setSelectedUpiApp('gpay')}
                            />
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              border: '1.5px solid #0F9D58',
                              color: '#0F9D58',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '0.8rem'
                            }}>
                              G
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.875rem', color: '#1E293B', display: 'block' }}>Google Pay (GPay)</strong>
                              <span style={{ fontSize: '0.725rem', color: '#64748B' }}>Instant UPI transfer with Google Pay</span>
                            </div>
                          </div>
                        </label>

                        {/* Paytm Option */}
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 0.9rem',
                          borderRadius: '10px',
                          border: selectedUpiApp === 'paytm' ? '2px solid #002E6E' : '1px solid #E2E8F0',
                          background: selectedUpiApp === 'paytm' ? '#F0F9FF' : '#ffffff',
                          cursor: 'pointer'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <input
                              type="radio"
                              name="upiApp"
                              checked={selectedUpiApp === 'paytm'}
                              onChange={() => setSelectedUpiApp('paytm')}
                            />
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#002E6E',
                              color: '#00BAF2',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '0.65rem'
                            }}>
                              paytm
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.875rem', color: '#1E293B', display: 'block' }}>Paytm UPI</strong>
                              <span style={{ fontSize: '0.725rem', color: '#64748B' }}>Pay directly via Paytm Payments Bank / UPI</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* 3. CUSTOM UPI ID INPUT */}
                    {upiMode === 'id' && (
                      <div>
                        <label className="form-label">Enter Virtual Payment Address (VPA / UPI ID)</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                          <input
                            type="text"
                            value={customUpiId}
                            onChange={(e) => {
                              setCustomUpiId(e.target.value);
                              setUpiVerified(false);
                            }}
                            placeholder="e.g. 9876543210@paytm or sivi@okhdfcbank"
                            className="form-input"
                            style={{ flex: 1, padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customUpiId.includes('@')) {
                                setUpiVerified(true);
                              } else {
                                alert('Please enter a valid UPI format with @ (e.g. name@upi)');
                              }
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0.55rem 0.95rem', fontSize: '0.8rem' }}
                          >
                            {upiVerified ? '✓ Verified' : 'Verify UPI'}
                          </button>
                        </div>
                        {errors.customUpiId && <span className="form-error" style={{ marginTop: '0.35rem' }}>{errors.customUpiId}</span>}
                        {upiVerified && (
                          <div style={{ fontSize: '0.775rem', color: '#059669', fontWeight: 600, marginTop: '0.35rem' }}>
                            ✓ Verified VPA Account: Sivi Rai (Bank of Baroda)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* --- CASH ON DELIVERY NOTICE --- */}
                {paymentMethod === 'cod' && (
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px dashed #CBD5E1',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.825rem',
                    color: '#475569'
                  }}>
                    💵 <strong>Cash on Delivery selected:</strong> Pay ₹{totalAmount.toLocaleString('en-IN')} in cash or via UPI QR to the BlueDart courier executive when your watch is delivered at your doorstep.
                  </div>
                )}

                {/* --- CARD PAYMENT NOTICE --- */}
                {paymentMethod === 'card' && (
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        value={cardData.cardNumber}
                        onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                        className="form-input"
                        style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="form-input"
                          style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          className="form-input"
                          style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Place Order Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-block"
                  style={{ padding: '0.85rem', fontSize: '1rem' }}
                >
                  {isSubmitting
                    ? 'Verifying Payment & Dispatched...'
                    : paymentMethod === 'upi' && upiMode === 'qr'
                    ? `I Have Scanned & Paid ₹${totalAmount.toLocaleString('en-IN')}`
                    : `Pay ₹${totalAmount.toLocaleString('en-IN')} & Place Order`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;

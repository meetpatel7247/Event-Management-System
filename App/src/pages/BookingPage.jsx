import React, { useState, useEffect } from 'react';
import { bookingApi } from '../utils/api';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearBookingDetails, setBookingDetails } from '../store/bookingSlice';
import { toast } from 'react-toastify';

/**
 * BookingPage Component
 * 
 * The checkout and confirmation screen for purchasing event tickets.
 * Allows users to adjust ticket quantities (triggering dynamic group discounts)
 * before finalizing the transaction via the mock API.
 */
const BookingPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { bookingEvent, quantity, totalPrice, discountAmount } = useSelector((state) => state.booking);
    const user = useSelector((state) => state.auth.user);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!bookingEvent) {
            navigate('/');
        }
    }, [bookingEvent, navigate]);

    const updateQuantity = (newQuantity) => {
        if (newQuantity < 1 || newQuantity > bookingEvent.availableSeats) return;

        let discount = 0;
        if (newQuantity >= 3) {
            discount = (bookingEvent.price * newQuantity * 20) / 100;
        }
        const newTotalPrice = (bookingEvent.price * newQuantity) - discount;

        dispatch(setBookingDetails({
            event: bookingEvent,
            quantity: newQuantity,
            totalPrice: newTotalPrice,
            discountAmount: discount
        }));
    };

    const handleConfirmBooking = async () => {
        if (!user || !user.token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            await bookingApi.createBooking({
                eventId: bookingEvent._id,
                quantity: quantity,
                totalPrice: totalPrice
            });

            dispatch(clearBookingDetails());
            toast.success('Booking confirmed successfully!');
            navigate('/my-bookings');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    if (!bookingEvent) return null;

    return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', minHeight: '80vh', display: 'flex', justifyContent: 'center' }}>
            <div className="premium-card" style={{ maxWidth: '600px', width: '100%' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Confirm Booking</h2>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{bookingEvent.title}</h3>
                    <p style={{ color: 'var(--text-muted)' }}>{new Date(bookingEvent.date).toLocaleDateString()} at {bookingEvent.time || 'TBA'}</p>
                    <p style={{ color: 'var(--text-muted)' }}>{bookingEvent.location}</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span>Price per ticket</span>
                        <span>${bookingEvent.price}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span>Quantity</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => updateQuantity(quantity - 1)}
                                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >-</button>
                            <span style={{ fontWeight: 'bold' }}>{quantity}</span>
                            <button
                                onClick={() => updateQuantity(quantity + 1)}
                                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >+</button>
                        </div>
                    </div>
                    {discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#4ade80' }}>
                            <span>Discount</span>
                            <span>-${discountAmount}</span>
                        </div>
                    )}
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--primary-color)' }}>${totalPrice}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button
                        className="premium-button premium-button-outline"
                        style={{ flex: 1 }}
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </button>
                    <button
                        className="premium-button"
                        style={{ flex: 1 }}
                        onClick={handleConfirmBooking}
                        disabled={loading}
                    >
                        {loading ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setBookingDetails } from '../../store/bookingSlice';
import withFadeIn from '../../hoc/withFadeIn';

/**
 * EventCard Component
 * 
 * Renders a single event preview with an image, title, date, location, and price.
 * Clicking the card routes the user to the EventDetails page.
 * Clicking "Book Ticket" triggers the Redux booking flow and forwards to checkout.
 * 
 * @param {Object} event - The full event data object
 */
const EventCard = ({ event }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [imgErrored, setImgErrored] = useState(false);

    const seed = encodeURIComponent(event?._id || event?.title || event?.location || 'event');
    const seededFallback = `https://picsum.photos/seed/${seed}/800/450`;
    const imageSrc = !imgErrored && event?.image ? event.image : seededFallback;

    /**
     * Prevents the click from bubbling to the parent card, checks auth,
     * seeds the Redux store with the target event, and pushes the booking route.
     */
    const handleBook = (e) => {
        e.stopPropagation();
        if (!user || !user.token) {
            navigate('/login');
            return;
        }

        dispatch(setBookingDetails({
            event,
            quantity: 1,
            totalPrice: event.price,
            discountAmount: 0
        }));

        navigate('/booking');
    };

    return (
        <div
            className="premium-card"
            style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                height: '100%',
                minHeight: 'unset',
                border: '1px solid var(--border-color)' // Ensure border is visible but controlled by CSS var
            }}
            onClick={() => navigate(`/event/${event._id}`)}
        >
            <div style={{ height: '180px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                <motion.img
                    src={imageSrc}
                    alt={event.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    onError={(e) => {
                        // Avoid infinite onError loops; switch to deterministic per-event fallback.
                        setImgErrored(true);
                    }}
                />
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, var(--bg-card), transparent)',
                    opacity: 0.6
                }} />
            </div>
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--secondary-color)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '0.5rem',
                    fontWeight: '600'
                }}>
                    {new Date(event.date).toLocaleDateString()}
                </div>
                <h3 style={{
                    fontSize: '1.3rem',
                    marginBottom: '0.5rem',
                    fontWeight: '700',
                    lineHeight: '1.4',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    color: '#fff',
                    textShadow: '0 0 5px rgba(0, 243, 255, 0.5)'
                }}>{event.title}</h3>
                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.95rem',
                    marginBottom: '1rem',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {event.location}
                </p>
                <div style={{ marginTop: 'auto' }}>
                    <div style={{
                        fontSize: '1.4rem',
                        fontWeight: 'bold',
                        color: 'var(--primary-color)',
                        marginBottom: '1rem',
                        textShadow: '0 0 10px rgba(0, 243, 255, 0.3)'
                    }}>
                        ${event.price}
                    </div>
                    <button
                        className="premium-button"
                        style={{ width: '100%', fontSize: '1.05rem', padding: '12px', fontWeight: 'bold', letterSpacing: '1px' }}
                        onClick={handleBook}
                    >
                        Book Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};
export default withFadeIn(EventCard);
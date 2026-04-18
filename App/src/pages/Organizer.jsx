import React, { useEffect, useState } from 'react';
import { eventApi, bookingApi, userApi } from '../utils/api';
import CreateEventForm from '../components/Event/CreateEventForm';
import EventTable from '../components/Event/EventTable';
import OrganizerHeader from '../components/Organizer/OrganizerHeader';
import TicketsSoldCard from '../components/Organizer/TicketsSoldCard';
import BookingsTable from '../components/Organizer/BookingsTable';
import { toast } from 'react-toastify';

const Organizer = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  const userInfo = JSON.parse(sessionStorage.getItem("user"));
  if (!userInfo) {
    window.location.href = "/login";
    return null;
  }

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventApi.getEvents();
        setEvents(data);
      } catch (error) { toast.error('Failed to load events.'); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try { 
        const data = await bookingApi.getAllBookings();
        setBookings(data); 
      }
      catch (error) { console.error(error); }
    };
    fetchBookings();
    const interval = setInterval(fetchBookings, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [userInfo]);

  const totalTicketsSold = bookings.reduce((total, booking) => total + (booking.quantity || 0), 0);

  const handleCreateEvent = async (newEvent) => {
    try {
      const savedEvent = await eventApi.createEvent(newEvent);
      setEvents([...events, savedEvent]);
      setShowForm(false);
      toast.success('Event created successfully!');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to create event'); }
  };

  const handleUpdateEvent = async (updatedData) => {
    try {
      const updatedEvent = await eventApi.updateEvent(editingEvent._id, updatedData);
      setEvents(events.map(e => e._id === updatedEvent._id ? updatedEvent : e));
      setEditingEvent(null);
      setShowForm(false);
      toast.success('Event updated successfully!');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to update event'); }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await eventApi.deleteEvent(id);
      setEvents(events.filter(event => event._id !== id));
      toast.success('Event deleted successfully!');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to delete event'); }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your Organizer account? This action cannot be undone.')) {
      try {
        await userApi.deleteMe();
        sessionStorage.removeItem('user');
        toast.success("Account deleted successfully!");
        window.location.href = '/login';
      } catch (error) { toast.error(error.response?.data?.message || "Failed to delete account"); }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="premium-card">
        <OrganizerHeader
          onReset={() => { sessionStorage.clear(); localStorage.clear(); window.location.reload(); }}
          onDeleteAccount={handleDeleteAccount}
          onShowForm={() => setShowForm(true)}
          showForm={showForm}
        />
        <TicketsSoldCard totalTicketsSold={totalTicketsSold} />
        {showForm ? (
          <CreateEventForm
            onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
            initialData={editingEvent}
            onCancel={() => { setShowForm(false); setEditingEvent(null); }}
          />
        ) : (
          <EventTable events={events} onDelete={handleDeleteEvent} onEdit={(event) => { setEditingEvent(event); setShowForm(true); }} />
        )}
        <BookingsTable bookings={bookings} />
      </div>
    </div>
  );
};

export default Organizer;
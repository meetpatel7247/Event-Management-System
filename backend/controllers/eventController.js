const eventService = require('../services/eventService');

async function getEvents(req, res, next) {
  try {
    const data = await eventService.listEvents();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getEventById(req, res, next) {
  try {
    const event = await eventService.findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function createEvent(req, res, next) {
  try {
    const { title, category, price } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const organizerId = req.user ? req.user.userId : null;
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const created = await eventService.createEvent({ title, category, price, organizerId, image: imageUrl });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.image = '/uploads/' + req.file.filename;
    }
    
    const updated = await eventService.updateEvent(req.params.id, payload);
    if (!updated) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const removed = await eventService.deleteEvent(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};

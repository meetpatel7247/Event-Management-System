const EventModel = require('../models/eventModel');

async function listEvents() {
  return await EventModel.find().populate('organizerId', 'name email');
}

async function findEventById(id) {
  return await EventModel.findById(id).populate('organizerId', 'name email');
}

async function createEvent(payload) {
  return await EventModel.create({
    title: payload.title,
    category: payload.category,
    price: payload.price,
    organizerId: payload.organizerId,
    image: payload.image,
  });
}

async function updateEvent(id, payload) {
  return await EventModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

async function deleteEvent(id) {
  return await EventModel.findByIdAndDelete(id);
}

module.exports = {
  listEvents,
  findEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

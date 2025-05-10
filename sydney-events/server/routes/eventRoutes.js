const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// GET all events with optional filtering
router.get('/', eventController.getEvents);

// GET a single event by ID
router.get('/:id', eventController.getEventById);

// GET all event categories
router.get('/categories/all', eventController.getCategories);

// POST register email and redirect
router.post('/register-and-redirect', eventController.registerEmailAndRedirect);

module.exports = router; 
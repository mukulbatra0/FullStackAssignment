# Sydney Events Web Application

A full-stack web application that displays events in Sydney, Australia by scraping various event websites. Users can browse events, filter by category, search for specific events, and opt-in with their email to get tickets.

## Features

- Automatic event scraping from popular Sydney event websites
- Beautiful responsive UI created with React and Tailwind CSS
- Filter events by category and search functionality
- User email collection with opt-in for marketing
- Redirect to original ticket source

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB for data storage
- Cheerio for web scraping
- Node-cron for scheduling scraping jobs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or cloud)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sydney-events
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sydney-events
```

## Running the Application

### Development Mode

To run both the frontend and backend servers concurrently:

```bash
npm run dev
```

This will start:
- Frontend server at http://localhost:3000
- Backend server at http://localhost:5000

### Production Mode

1. Build the React application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run server
```

The application will be available at http://localhost:5000

## API Endpoints

- `GET /api/events` - Get all events with pagination and filtering
- `GET /api/events/:id` - Get a specific event by ID
- `GET /api/events/categories/all` - Get all event categories
- `POST /api/events/register-and-redirect` - Register a user's email and get redirect URL

## License

MIT

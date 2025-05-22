# Sydney Events Web Application

A full-stack web application that displays events in Sydney, Australia by scraping various event websites. Users can browse events, filter by category, search for specific events, and opt-in with their email to get tickets.

## Features

- Automatic event scraping from popular Sydney event websites
- Beautiful responsive UI created with React and Tailwind CSS
- Filter events by category and search functionality
- User email collection with opt-in for marketing
- Email verification with OTP (One-Time Password)
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
- Nodemailer for sending emails
- JWT for authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or cloud)
- SMTP server access for sending emails

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

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=your_mailtrap_username
EMAIL_PASS=your_mailtrap_password
EMAIL_FROM=noreply@sydneyevents.com
```

For development purposes, you can use services like [Mailtrap](https://mailtrap.io/) for email testing.

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

### Events
- `GET /api/events` - Get all events with pagination and filtering
- `GET /api/events/:id` - Get a specific event by ID
- `GET /api/events/categories/all` - Get all event categories
- `POST /api/events/register-and-redirect` - Register a user's email and get redirect URL

### Authentication
- `POST /api/auth/register` - Register user and send OTP
- `POST /api/auth/verify-otp` - Verify the OTP sent to user's email
- `POST /api/auth/resend-otp` - Resend OTP to user's email

## Email Verification Process

The application uses a secure email verification process:

1. User enters their email address
2. A 6-digit OTP is generated and sent to the user's email
3. OTP is valid for 10 minutes
4. User enters the OTP to verify their email
5. Upon successful verification, a JWT token is generated
6. Verified users can access events without re-verifying

## License

MIT

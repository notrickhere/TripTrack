# TripTrack

TripTrack is a travel planning web app that helps users browse shared trip inspiration and build a personal planner with trips and itinerary activities.

Users can freely explore seeded inspiration data, then create an account to copy trips into their own planner and manage private travel plans.

## Team

- Ricky Lee
- Tarun Badarvada

## Class Link

- https://johnguerra.co/classes/webDevelopment_online_spring_2026/

## Project Links

- Frontend Deployment: https://triptrack-front.onrender.com/
- Backend Deployment: https://triptrack-rxxr.onrender.com/api/health
- GitHub: https://github.com/notrickhere/TripTrack

## Project Objective

TripTrack helps users organize destinations, travel dates, itinerary activities, and trip notes in one place.
The app is designed to make travel planning more structured by separating public trip inspiration from a private personal planner.

## Core Features

- Browse seeded inspiration trips without logging in
- Filter inspiration by continent
- Search inspiration trips by destination, city, country, mood, or timezone
- Paginate through inspiration results
- Copy inspiration trips into a personal planner
- Register and log in to manage a personal planner
- Create, edit, and delete planner trips
- Create, edit, and delete planner itinerary activities
- Delete all planner trips at once without affecting seeded inspiration data

## User Personas

1. Frequent Traveler (organizes multiple upcoming trips each year)
2. Vacation Planner (plans activities in advance before traveling)
3. Casual Traveler (stores occasional trip ideas and updates plans over time)

## User Stories

### Ricky's User Stories

- As a user, I want to create a trip with destination and travel dates so that I can organize my upcoming travel plans.
- As a user, I want to edit or delete my planner trips so that I can keep my travel schedule accurate.
- As a user, I want my planner trips to remain separate from the shared inspiration data so that I only modify my own plans.
- As a user, I want to copy an inspiration trip into my planner so that I can quickly start planning from an existing idea.

### Tarun's User Stories

- As a user, I want to add activities to a selected trip so that I can build an itinerary.
- As a user, I want to edit or delete itinerary activities so that my planner reflects updated travel plans.
- As a user, I want to browse inspiration trips without logging in so that I can explore ideas before creating an account.
- As a user, I want my planner to be tied to my account so that other users cannot edit my trips or activities.

## Tech Stack

- React with Hooks
- Vite
- Node.js
- Express
- MongoDB
- MongoDB Atlas
- Docker
- MongoDB Compass

## Project Structure

- `client/` - React frontend
- `client/src/components/` - UI components for planner, inspiration, and auth
- `client/src/lib/` - frontend API helpers
- `client/src/styles/` - shared frontend styles
- `server/` - Express backend
- `server/src/config/` - MongoDB connection logic
- `server/src/controllers/` - API controller logic
- `server/src/middleware/` - authentication middleware
- `server/src/routes/` - API routes (`auth`, `trips`, `activities`, `health`)
- `server/scripts/` - seeding script
- `seeding_data/` - CSV seed files for trips and activities

## Getting Started

### Prerequisites

- Node.js >= 20
- Docker Desktop for local MongoDB
- MongoDB Compass for local database inspection
- MongoDB Atlas for production deployment

### Installation

If you forked this repo, clone your fork URL instead:

```bash
git clone https://github.com/<your-username>/TripTrack.git
cd TripTrack
npm install
cd client && npm install
cd ../server && npm install
```

Or clone the original repo:

```bash
git clone <your-repo-url>
cd TripTrack
npm install
cd client && npm install
cd ../server && npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure one of these options.

Option A: Atlas / hosted MongoDB (recommended for deployment)

```env
PORT=5001
NODE_ENV=production
CLIENT_ORIGIN=https://triptrack-front.onrender.com
JWT_SECRET=replace_with_a_long_random_secret
MONGO_DB_NAME=TripTrack
MONGODB_URI=your_mongodb_atlas_connection_string
```

Option B: Local MongoDB (Docker)

```env
PORT=5001
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_secret
MONGO_PORT=27017
MONGO_DB_NAME=triptrack
MONGODB_URI=mongodb://localhost:27017/triptrack
```

Frontend local env example in `client/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Frontend production env on Render:

```env
VITE_API_BASE_URL=https://triptrack-rxxr.onrender.com/api
```

### Running Locally (Docker MongoDB)

```bash
docker compose up -d
cd server && npm run seed -- --reset
cd ..
npm run dev
```

This starts:

- MongoDB in Docker
- the React frontend with Vite
- the Express backend with Nodemon

### Running Locally (Atlas)

```bash
MONGODB_URI='your_atlas_connection_string' MONGO_DB_NAME=TripTrack npm run seed
npm run dev
```

If your Atlas database already exists as `TripTrack`, keep that exact casing when seeding.

### Production Start

Backend Render service:

```bash
npm start
```

Frontend is deployed as a Render Static Site built from:

```bash
npm install && npm run build
```

Open in browser:

- `http://localhost:5173/`
- `http://localhost:5001/api/health`

## Render Deployment

### Backend

- Service Type: `Web Service`
- Runtime: `Node`
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

Backend environment variables:

```env
NODE_ENV=production
MONGO_DB_NAME=TripTrack
MONGODB_URI=your_mongodb_atlas_connection_string
CLIENT_ORIGIN=https://triptrack-front.onrender.com
JWT_SECRET=replace_with_a_long_random_secret
```

### Frontend

- Service Type: `Static Site`
- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

Frontend environment variables:

```env
VITE_API_BASE_URL=https://triptrack-rxxr.onrender.com/api
```

## Authentication Behavior

- Inspiration is public and uses shared seeded data
- Planner access requires a user account
- Planner trips and activities are private to the logged-in user
- Copying an inspiration trip creates a new planner-owned trip and activities instead of editing seeded data

## Seed Data

The project includes CSV seed files in `seeding_data/`:

- `seed_trips.csv`
- `seed_activities.csv`

The seed script:

- imports trips first
- imports activities after that
- links activities to real inserted trips
- marks seeded data separately from planner-owned user data
- normalizes trip dates when needed

Seed locally:

```bash
npm run seed
```

Reset and reseed:

```bash
cd server
npm run seed -- --reset
```

Seed Atlas directly:

```bash
MONGODB_URI='your_atlas_connection_string' MONGO_DB_NAME=TripTrack npm run seed
```

## Current Functionality

- Frontend: React with hooks, separate components, component-specific CSS, planner and inspiration views, and authentication UI
- Backend: Node.js and Express API with auth routes, trip routes, activity routes, and protected planner CRUD
- Database: MongoDB locally through Docker and MongoDB Atlas in production
- State Management: Fetch API requests between React and the Express backend
- Deployment: Frontend deployed on Render Static Site, backend deployed on Render Web Service, database hosted on MongoDB Atlas

## GenAI Tool Usage

- Used GenAI assistance for implementation support, debugging, deployment setup, and refactoring across frontend and backend modules.
- Used GenAI to help validate data-model decisions for seeded inspiration data versus user-owned planner data.
- Used GenAI to help shape seed-script workflow and Render/Atlas deployment configuration.
- Final testing, manual verification, and production deployment were validated in the real environment.

## Design Mockups / Figma

- `Add Figma/design mockup link here if available`

## Screenshots

`Add project screenshots here before submission.`

Example:

```md
![TripTrack Inspiration Page](./images/triptrack-inspiration.png)
![TripTrack Planner Page](./images/triptrack-planner.png)
![TripTrack Auth Page](./images/triptrack-auth.png)
```

## Public Narrated Video

- `Add public demo video link here`

## Presentation Slides

- `Add presentation slides link here`

## License

MIT

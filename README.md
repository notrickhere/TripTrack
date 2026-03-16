# TripTrack

## Authors
- Ricky Lee
- Tarun Badarvada

## Class Link
[Class Link](https://johnguerra.co/classes/webDevelopment_online_spring_2026/)

## Project Objective
TripTrack is a personal trip and itinerary organizer built for travelers who want one place to manage destinations, travel dates, notes, and planned activities. The goal of the application is to replace scattered planning across notes, messages, and calendars with a single full-stack web app where users can create trips and manage itinerary items for each trip.

## Why This App Is Useful
TripTrack is designed for real travel planning workflows:
- Frequent travelers can keep multiple upcoming trips organized.
- Vacation planners can build a detailed itinerary for each trip.
- Casual travelers can save trip details and update plans as they change.

## User Personas
- **Alex, Frequent Traveler:** Travels several times a year and wants an easy way to organize destinations, dates, and activities.
- **Maria, Vacation Planner:** Likes to plan daily activities in advance and wants a structured itinerary for each trip.
- **Jordan, Casual Traveler:** Takes occasional trips and wants a simple place to store and update travel plans.

## Core Features
- Create, view, update, and delete trips.
- Store trip details such as destination, travel dates, and notes.
- Create, view, update, and delete itinerary activities for a specific trip.
- Track activity details such as name, description, date, and time.
- Select a trip and manage its itinerary from the same dashboard.

## User Stories
### Trip Management
- As a user, I want to create a trip with a destination and travel dates so I can organize my upcoming travel plans.
- As a user, I want to view a list of all my saved trips so I can easily access and manage them.
- As a user, I want to edit trip details such as destination or dates so I can update my travel plans.
- As a user, I want to delete a trip so I can remove trips that are no longer relevant.

### Itinerary Management
- As a user, I want to add activities to a specific trip itinerary so I can plan what I will do during my trip.
- As a user, I want to view all activities associated with a trip so I can see my full itinerary.
- As a user, I want to edit activity details such as name, date, or description so I can update my plans.
- As a user, I want to delete an activity so I can remove plans that are no longer needed.

## Tech Stack
- **Frontend:** React with Hooks
- **Backend:** Node.js with Express
- **Database:** MongoDB using the Node.js driver
- **Local Database:** MongoDB in Docker with MongoDB Compass for inspection

## Team Responsibilities
- **Ricky Lee:** Full CRUD for trip management, including trip creation, editing, deletion, trip list views, and trip detail views.
- **Tarun Badarvada:** Full CRUD for itinerary activity management, including adding, editing, deleting, and viewing activities tied to a trip.

## Screenshot
`Add a project screenshot here before submission.`

Example Markdown once the image is available:

```md
![TripTrack Screenshot](./assets/triptrack-screenshot.png)
```

## How To Build and Run
These instructions match the current local development workflow.

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd TripTrack
```

### 2. Install dependencies
Install root tooling plus the frontend and backend dependencies.

```bash
npm install
cd client
npm install
cd ../server
npm install
```

### 3. Configure environment variables
Create a root `.env` file in `TripTrack/` based on `.env.example`:

```env
PORT=5001
NODE_ENV=development
MONGO_PORT=27017
MONGO_DB_NAME=triptrack
MONGODB_URI=your_mongodb_connection_string
```

For local development with Docker and MongoDB Compass:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/triptrack
```

Do not commit production secrets such as MongoDB Atlas credentials to the repository.

### 4. Start MongoDB with Docker
From the project root:

```bash
docker compose up -d
```

### 5. Start the app
From the project root, start the frontend and backend together:

```bash
npm run dev
```

This command starts:
- the React frontend with Vite
- the Express backend with Nodemon

If you prefer to start them separately, you can still run:

```bash
cd client
npm run dev
```

```bash
cd server
npm run dev
```

### 6. Seed the database
To import the CSV seed data into your current Mongo database target:

```bash
npm run seed
```

To clear existing `trips` and `activities` first, run:

```bash
cd server
npm run seed -- --reset
```

This script:
- reads `seeding_data/seed_trips.csv`
- reads `seeding_data/seed_activities.csv`
- inserts trips first
- assigns each activity to a real inserted trip
- normalizes trip dates if a seeded end date comes before a start date

For MongoDB Atlas later, use the same script with your Atlas `MONGODB_URI` in `.env` or in your deployment environment.

### 7. Open the app
Once the app is running, open the frontend in your browser at:

```text
http://localhost:5173
```

The backend API runs at:

```text
http://localhost:5001/api
```

## Current Project Structure
```text
TripTrack/
  client/
    src/
      components/
      lib/
      styles/
  server/
    src/
      config/
      controllers/
      routes/
  seeding_data/
  .env.example
  .gitignore
  docker-compose.yaml
  eslint.config.js
  package.json
  README.md
```

## Current Status
The current version supports:
- Creating, editing, and deleting trips
- Creating, editing, and deleting activities
- Persisting trips and activities to MongoDB locally
- Running the frontend and backend together with a single root command

The current local test flow has been verified by:
- opening the React app on `localhost:5173`
- checking the backend health route on `localhost:5001/api/health`
- creating trip and activity records and confirming they were written to MongoDB

## Notes For Final Submission
Before submitting, make sure this README includes:
- A real screenshot of the application
- The deployed public URL
- The demo video link
- Any final deployment-specific setup steps for Render and MongoDB Atlas

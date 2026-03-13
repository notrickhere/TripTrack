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
These instructions match the current project scaffold.

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
PORT=5000
NODE_ENV=development
MONGO_PORT=27017
MONGO_DB_NAME=triptrack
MONGODB_URI=your_mongodb_connection_string
```

For local development with Docker and MongoDB Compass:

```env
MONGODB_URI=mongodb://localhost:27017/triptrack
```

Do not commit production secrets such as MongoDB Atlas credentials to the repository.

### 4. Start MongoDB with Docker
From the project root:

```bash
docker compose up -d
```

### 5. Start the development servers
Run the frontend and backend in separate terminals:

```bash
cd client
npm run dev
```

```bash
cd server
npm run dev
```

### 6. Open the app
Once both servers are running, open the frontend in your browser at:

```text
http://localhost:5173
```

The backend API runs at:

```text
http://localhost:5000/api
```

## Expected Project Structure
The finished project should include:
- A frontend `package.json`
- A backend `package.json`
- Organized React components in separate files
- Separate database/backend files
- Component-specific CSS files
- ESLint configuration
- Prettier formatting
- An MIT License

## Notes For Final Submission
Before submitting, make sure this README includes:
- The actual class link
- A real screenshot of the application
- The deployed public URL
- The demo video link
- Finalized build steps that match the finished folder structure

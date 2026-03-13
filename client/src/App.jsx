import { useEffect, useState } from "react";

import ActivityForm from "./components/ActivityForm.jsx";
import ActivityList from "./components/ActivityList.jsx";
import TripForm from "./components/TripForm.jsx";
import TripList from "./components/TripList.jsx";
import { createActivity, createTrip, getActivities, getTrips } from "./lib/api.js";
import "./styles/App.css";

function App() {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [activities, setActivities] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTrips() {
      try {
        const tripData = await getTrips();
        setTrips(tripData);

        if (tripData.length > 0) {
          setSelectedTripId((currentTripId) => currentTripId || tripData[0]._id);
        }
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoadingTrips(false);
      }
    }

    loadTrips();
  }, []);

  useEffect(() => {
    if (!selectedTripId) {
      setActivities([]);
      return;
    }

    async function loadActivities() {
      try {
        setIsLoadingActivities(true);
        const activityData = await getActivities(selectedTripId);
        setActivities(activityData);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoadingActivities(false);
      }
    }

    loadActivities();
  }, [selectedTripId]);

  async function handleTripCreate(formValues) {
    const newTrip = await createTrip(formValues);
    setTrips((currentTrips) => [newTrip, ...currentTrips]);
    setSelectedTripId(newTrip._id);
  }

  async function handleActivityCreate(formValues) {
    const newActivity = await createActivity({
      ...formValues,
      tripId: selectedTripId,
    });

    setActivities((currentActivities) => [...currentActivities, newActivity]);
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">CS5610 Project 3</p>
        <h1>TripTrack</h1>
        <p className="hero-copy">
          Organize trips, dates, notes, and daily itinerary items in one place.
        </p>
      </header>

      {errorMessage ? <p className="status error">{errorMessage}</p> : null}

      <main className="dashboard">
        <section className="panel">
          <div className="panel-header">
            <h2>Trips</h2>
            <p>Create and manage destination plans.</p>
          </div>
          <TripForm onSubmit={handleTripCreate} />
          <TripList
            isLoading={isLoadingTrips}
            onSelectTrip={setSelectedTripId}
            selectedTripId={selectedTripId}
            trips={trips}
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Itinerary</h2>
            <p>Add activities to the currently selected trip.</p>
          </div>
          <ActivityForm
            disabled={!selectedTripId}
            onSubmit={handleActivityCreate}
          />
          <ActivityList
            activities={activities}
            isLoading={isLoadingActivities}
            selectedTripId={selectedTripId}
          />
        </section>
      </main>
    </div>
  );
}

export default App;

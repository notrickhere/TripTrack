import { useEffect, useState } from "react";

import ActivityForm from "./components/ActivityForm.jsx";
import ActivityList from "./components/ActivityList.jsx";
import TripForm from "./components/TripForm.jsx";
import TripList from "./components/TripList.jsx";
import {
  createActivity,
  createTrip,
  deleteActivity,
  deleteTrip,
  getActivities,
  getTrips,
  updateActivity,
  updateTrip,
} from "./lib/api.js";
import "./styles/App.css";

function App() {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [editingTrip, setEditingTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
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
    setErrorMessage("");

    if (editingTrip) {
      const savedTrip = await updateTrip(editingTrip._id, formValues);
      setTrips((currentTrips) =>
        currentTrips.map((trip) => (trip._id === savedTrip._id ? savedTrip : trip))
      );
      setEditingTrip(null);
      return;
    }

    const newTrip = await createTrip(formValues);
    setTrips((currentTrips) => [newTrip, ...currentTrips]);
    setSelectedTripId(newTrip._id);
  }

  async function handleActivityCreate(formValues) {
    setErrorMessage("");

    if (editingActivity) {
      const savedActivity = await updateActivity(editingActivity._id, formValues);
      setActivities((currentActivities) =>
        currentActivities.map((activity) =>
          activity._id === savedActivity._id ? savedActivity : activity
        )
      );
      setEditingActivity(null);
      return;
    }

    const newActivity = await createActivity({
      ...formValues,
      tripId: selectedTripId,
    });

    setActivities((currentActivities) => [...currentActivities, newActivity]);
  }

  async function handleTripDelete(tripId) {
    setErrorMessage("");
    await deleteTrip(tripId);

    const remainingTrips = trips.filter((trip) => trip._id !== tripId);
    setTrips(remainingTrips);
    setEditingTrip((currentTrip) =>
      currentTrip && currentTrip._id === tripId ? null : currentTrip
    );

    if (selectedTripId === tripId) {
      setSelectedTripId(remainingTrips[0]?._id || "");
      setActivities([]);
      setEditingActivity(null);
    }
  }

  async function handleActivityDelete(activityId) {
    setErrorMessage("");
    await deleteActivity(activityId);
    setActivities((currentActivities) =>
      currentActivities.filter((activity) => activity._id !== activityId)
    );
    setEditingActivity((currentActivity) =>
      currentActivity && currentActivity._id === activityId ? null : currentActivity
    );
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
            <p>
              {editingTrip
                ? `Editing ${editingTrip.destination}`
                : "Create and manage destination plans."}
            </p>
          </div>
          <TripForm
            editingTrip={editingTrip}
            onCancelEdit={() => setEditingTrip(null)}
            onSubmit={handleTripCreate}
          />
          <TripList
            isLoading={isLoadingTrips}
            onDeleteTrip={handleTripDelete}
            onEditTrip={setEditingTrip}
            onSelectTrip={setSelectedTripId}
            selectedTripId={selectedTripId}
            trips={trips}
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Itinerary</h2>
            <p>
              {editingActivity
                ? `Editing ${editingActivity.name}`
                : "Add activities to the currently selected trip."}
            </p>
          </div>
          <ActivityForm
            disabled={!selectedTripId}
            editingActivity={editingActivity}
            onCancelEdit={() => setEditingActivity(null)}
            onSubmit={handleActivityCreate}
          />
          <ActivityList
            activities={activities}
            isLoading={isLoadingActivities}
            onDeleteActivity={handleActivityDelete}
            onEditActivity={setEditingActivity}
            selectedTripId={selectedTripId}
          />
        </section>
      </main>
    </div>
  );
}

export default App;

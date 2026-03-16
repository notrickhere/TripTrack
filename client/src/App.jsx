import { useEffect, useState } from "react";

import ActivityForm from "./components/ActivityForm.jsx";
import ActivityList from "./components/ActivityList.jsx";
import InspirationBoard from "./components/InspirationBoard.jsx";
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

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(startDateString, numberOfDays) {
  const date = new Date(`${startDateString}T00:00:00`);
  date.setDate(date.getDate() + numberOfDays);
  return formatDate(date);
}

function getTripLengthInDays(startDateString, endDateString) {
  const startDate = new Date(`${startDateString}T00:00:00`);
  const endDate = new Date(`${endDateString}T00:00:00`);
  const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
  return Math.max(0, Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24)));
}

function App() {
  const [activeView, setActiveView] = useState("planner");
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [editingTrip, setEditingTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [copyingTripId, setCopyingTripId] = useState("");
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const plannerTrips = trips.filter((trip) => !trip.seeded);
  const inspirationTrips = trips.filter((trip) => trip.seeded);

  useEffect(() => {
    async function loadTrips() {
      try {
        const tripData = await getTrips();
        setTrips(tripData);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoadingTrips(false);
      }
    }

    loadTrips();
  }, []);

  useEffect(() => {
    setSelectedTripId((currentTripId) => {
      if (currentTripId && plannerTrips.some((trip) => trip._id === currentTripId)) {
        return currentTripId;
      }

      return plannerTrips[0]?._id || "";
    });
  }, [plannerTrips]);

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
      setSelectedTripId(remainingTrips.find((trip) => !trip.seeded)?._id || "");
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

  async function handleCopyTripToPlanner(sourceTrip) {
    setErrorMessage("");
    setCopyingTripId(sourceTrip._id);

    try {
      const today = formatDate(new Date());
      const tripLength = getTripLengthInDays(sourceTrip.startDate, sourceTrip.endDate);
      const copiedEndDate = addDays(today, tripLength);
      const sourceActivities = await getActivities(sourceTrip._id);

      const copiedTrip = await createTrip({
        destination: sourceTrip.destination,
        endDate: copiedEndDate,
        notes:
          sourceTrip.notes ||
          sourceTrip.note ||
          [sourceTrip.city, sourceTrip.country].filter(Boolean).join(", "),
        startDate: today,
      });

      const copiedActivities = await Promise.all(
        sourceActivities.map((activity) =>
          createActivity({
            date: today,
            description: activity.description || "",
            name: activity.name,
            time: activity.time || "",
            tripId: copiedTrip._id,
          })
        )
      );

      setTrips((currentTrips) => [copiedTrip, ...currentTrips]);
      setSelectedTripId(copiedTrip._id);
      setActivities(copiedActivities);
      setEditingTrip(null);
      setEditingActivity(null);
      setActiveView("planner");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setCopyingTripId("");
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">CS5610 Project 3</p>
        <h1>TripTrack</h1>
        <p className="hero-copy">
          Organize trips, dates, notes, and daily itinerary items in one place.
        </p>
        <div className="view-switcher">
          <button
            className={activeView === "planner" ? "active-view" : ""}
            onClick={() => setActiveView("planner")}
            type="button"
          >
            Planner
          </button>
          <button
            className={activeView === "inspiration" ? "active-view" : ""}
            onClick={() => setActiveView("inspiration")}
            type="button"
          >
            Inspiration
          </button>
        </div>
      </header>

      {errorMessage ? <p className="status error">{errorMessage}</p> : null}

      {activeView === "planner" ? (
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
              trips={plannerTrips}
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
      ) : (
        <main>
          <InspirationBoard
            isCopyingTripId={copyingTripId}
            onCopyTripToPlanner={handleCopyTripToPlanner}
            trips={inspirationTrips}
          />
        </main>
      )}
    </div>
  );
}

export default App;

import { useEffect, useState } from "react";

import ActivityForm from "./components/ActivityForm.jsx";
import ActivityList from "./components/ActivityList.jsx";
import AuthPanel from "./components/AuthPanel.jsx";
import InspirationBoard from "./components/InspirationBoard.jsx";
import TripForm from "./components/TripForm.jsx";
import TripList from "./components/TripList.jsx";
import {
  createActivity,
  createTrip,
  deleteActivity,
  deleteTrip,
  getCurrentToken,
  getCurrentUser,
  getActivities,
  getTrips,
  login,
  register,
  storeAuthToken,
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

function getLatestTripEndDate(trips) {
  if (trips.length === 0) {
    return "";
  }

  return trips.reduce(
    (latestEndDate, trip) => (trip.endDate > latestEndDate ? trip.endDate : latestEndDate),
    trips[0].endDate
  );
}

function getContinentFromCountryCode(countryCode = "") {
  const code = countryCode.toUpperCase();

  if (
    [
      "AO", "BF", "BI", "BJ", "BW", "CD", "CF", "CG", "CI", "CM", "CV", "DJ", "DZ",
      "EG", "EH", "ER", "ET", "GA", "GH", "GM", "GN", "GQ", "GW", "KE", "KM", "LR",
      "LS", "LY", "MA", "MG", "ML", "MR", "MU", "MW", "MZ", "NA", "NE", "NG", "RE",
      "RW", "SC", "SD", "SL", "SN", "SO", "SS", "ST", "SZ", "TD", "TG", "TN", "TZ",
      "UG", "YT", "ZA", "ZM", "ZW",
    ].includes(code)
  ) {
    return "Africa";
  }

  if (
    [
      "AE", "AF", "AM", "AZ", "BD", "BH", "BN", "BT", "CN", "CY", "GE", "HK", "ID",
      "IL", "IN", "IQ", "IR", "JO", "JP", "KG", "KH", "KP", "KR", "KW", "KZ", "LA",
      "LB", "LK", "MM", "MN", "MO", "MV", "MY", "NP", "OM", "PH", "PK", "PS", "QA",
      "SA", "SG", "SY", "TH", "TJ", "TL", "TM", "TR", "TW", "UZ", "VN", "YE",
    ].includes(code)
  ) {
    return "Asia";
  }

  if (
    [
      "AD", "AL", "AT", "BA", "BE", "BG", "BY", "CH", "CZ", "DE", "DK", "EE", "ES",
      "FI", "FO", "FR", "GB", "GG", "GI", "GR", "HR", "HU", "IE", "IM", "IS", "IT",
      "JE", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT", "NL", "NO", "PL",
      "PT", "RO", "RS", "RU", "SE", "SI", "SK", "SM", "UA", "VA",
    ].includes(code)
  ) {
    return "Europe";
  }

  if (
    [
      "AG", "AI", "AW", "BB", "BL", "BM", "BQ", "BS", "BZ", "CA", "CR", "CU", "CW",
      "DM", "DO", "GD", "GL", "GP", "GT", "HN", "HT", "JM", "KN", "KY", "LC", "MF",
      "MQ", "MS", "MX", "NI", "PA", "PM", "PR", "SV", "SX", "TC", "TT", "US", "VC",
      "VG", "VI",
    ].includes(code)
  ) {
    return "North America";
  }

  if (
    ["AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PE", "PY", "SR", "UY", "VE"].includes(
      code
    )
  ) {
    return "South America";
  }

  if (
    [
      "AS", "AU", "CK", "FJ", "FM", "GU", "KI", "MH", "MP", "NC", "NF", "NR", "NU",
      "NZ", "PF", "PG", "PN", "PW", "SB", "TK", "TO", "TV", "UM", "VU", "WF", "WS",
    ].includes(code)
  ) {
    return "Oceania";
  }

  return "";
}

function App() {
  const [activeView, setActiveView] = useState("planner");
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
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
  const latestPlannerEndDate = getLatestTripEndDate(plannerTrips);
  const nextAllowedPlannerStartDate = latestPlannerEndDate
    ? addDays(latestPlannerEndDate, 1)
    : "";

  useEffect(() => {
    async function hydrateSession() {
      if (!getCurrentToken()) {
        return;
      }

      try {
        const response = await getCurrentUser();
        setCurrentUser(response.user);
      } catch (_error) {
        storeAuthToken("");
        setCurrentUser(null);
      }
    }

    hydrateSession();
  }, []);

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
  }, [currentUser]);

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
    if (!currentUser) {
      setAuthErrorMessage("Login required to manage your planner.");
      return;
    }

    if (formValues.endDate < formValues.startDate) {
      setErrorMessage("A trip cannot end before it starts.");
      return;
    }

    if (editingTrip) {
      const savedTrip = await updateTrip(editingTrip._id, formValues);
      setTrips((currentTrips) =>
        currentTrips.map((trip) => (trip._id === savedTrip._id ? savedTrip : trip))
      );
      setEditingTrip(null);
      return;
    }

    if (nextAllowedPlannerStartDate && formValues.startDate < nextAllowedPlannerStartDate) {
      setErrorMessage(
        `New trips must start on or after ${nextAllowedPlannerStartDate}.`
      );
      return;
    }

    const newTrip = await createTrip(formValues);
    setTrips((currentTrips) => [newTrip, ...currentTrips]);
    setSelectedTripId(newTrip._id);
  }

  async function handleActivityCreate(formValues) {
    setErrorMessage("");
    if (!currentUser) {
      setAuthErrorMessage("Login required to manage your planner.");
      return;
    }

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

  async function handleDeleteAllPlannerTrips() {
    if (plannerTrips.length === 0) {
      return;
    }

    const shouldDelete = window.confirm(
      "Delete all planner trips and their activities? This will not remove inspiration trips."
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");
    await Promise.all(plannerTrips.map((trip) => deleteTrip(trip._id)));
    setTrips((currentTrips) => currentTrips.filter((trip) => trip.seeded));
    setSelectedTripId("");
    setActivities([]);
    setEditingTrip(null);
    setEditingActivity(null);
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
    setAuthErrorMessage("");

    if (!currentUser) {
      setAuthErrorMessage("Create an account or login before copying trips to your planner.");
      setActiveView("planner");
      return;
    }

    setCopyingTripId(sourceTrip._id);

    try {
      const today = formatDate(new Date());
      const plannerStartDate = nextAllowedPlannerStartDate || today;
      const tripLength = getTripLengthInDays(sourceTrip.startDate, sourceTrip.endDate);
      const copiedEndDate = addDays(plannerStartDate, Math.min(tripLength, 30));
      const sourceActivities = await getActivities(sourceTrip._id);

      const copiedTrip = await createTrip({
        city: sourceTrip.city || "",
        continent:
          sourceTrip.continent || getContinentFromCountryCode(sourceTrip.countryCode),
        country: sourceTrip.country || "",
        destination: sourceTrip.destination,
        endDate: copiedEndDate,
        notes:
          sourceTrip.notes ||
          sourceTrip.note ||
          [sourceTrip.city, sourceTrip.country].filter(Boolean).join(", "),
        startDate: plannerStartDate,
      });

      const copiedActivities = await Promise.all(
        sourceActivities.map((activity) =>
          createActivity({
            date: plannerStartDate,
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

  async function handleLogin(credentials) {
    setAuthErrorMessage("");

    try {
      const response = await login(credentials);
      storeAuthToken(response.token);
      setCurrentUser(response.user);
    } catch (error) {
      setAuthErrorMessage(error.message);
    }
  }

  async function handleRegister(formValues) {
    setAuthErrorMessage("");

    try {
      const response = await register(formValues);
      storeAuthToken(response.token);
      setCurrentUser(response.user);
    } catch (error) {
      setAuthErrorMessage(error.message);
    }
  }

  function handleLogout() {
    storeAuthToken("");
    setCurrentUser(null);
    setSelectedTripId("");
    setActivities([]);
    setEditingTrip(null);
    setEditingActivity(null);
  }

  return (
    <div className="app-shell">
      <header className="hero">
        {currentUser ? (
          <div className="session-bar">
            <button onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        ) : null}
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
        {currentUser ? (
          <div className="session-bar">
            
            <button onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        ) : null}
      </header>

      {errorMessage ? <p className="status error">{errorMessage}</p> : null}

      {activeView === "planner" ? (
        currentUser ? (
          <main className="dashboard">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Trips</h2>
                  <p>
                    {editingTrip
                      ? `Editing ${editingTrip.destination}`
                      : "Create and manage destination plans."}
                  </p>
                </div>
                <button
                  className="danger-ghost-button"
                  disabled={plannerTrips.length === 0}
                  onClick={handleDeleteAllPlannerTrips}
                  type="button"
                >
                  Delete All
                </button>
              </div>
              <TripForm
                editingTrip={editingTrip}
                minStartDate={editingTrip ? "" : nextAllowedPlannerStartDate}
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
            <AuthPanel
              errorMessage={authErrorMessage}
              onLogin={handleLogin}
              onRegister={handleRegister}
            />
          </main>
        )
      ) : (
        <main>
          <InspirationBoard
            isCopyingTripId={copyingTripId}
            onCopyTripToPlanner={handleCopyTripToPlanner}
            trips={inspirationTrips}
          />
        </main>
      )}
      <footer className="site-footer">
        <p>MIT License</p>
        <p>Ricky Lee and Tarun Badarvada</p>
      </footer>
    </div>
  );
}

export default App;

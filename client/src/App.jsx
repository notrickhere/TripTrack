import { useEffect, useRef, useState } from "react";

import ActivityForm from "./components/ActivityForm.jsx";
import AuthPanel from "./components/AuthPanel.jsx";
import InspirationBoard from "./components/InspirationBoard.jsx";
import PlannerCalendar from "./components/PlannerCalendar.jsx";
import PlannerOverview from "./components/PlannerOverview.jsx";
import TripForm from "./components/TripForm.jsx";
import TripStatistics from "./components/TripStatistics.jsx";
import SimpleTripTimeline from "./components/SimpleTripTimeline.jsx";
import {
  createActivity,
  createTrip,
  deleteActivity,
  deleteTrip,
  getCurrentUser,
  getActivities,
  getTrips,
  login,
  logout,
  register,
  updateActivity,
  updateTrip,
} from "./lib/api.js";
import "./styles/App.css";

const THEME_STORAGE_KEY = "triptrack_theme";

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getInitialTheme() {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
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
  return Math.max(
    0,
    Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24)),
  );
}

function getLatestTripEndDate(trips) {
  if (trips.length === 0) {
    return "";
  }

  return trips.reduce(
    (latestEndDate, trip) =>
      trip.endDate > latestEndDate ? trip.endDate : latestEndDate,
    trips[0].endDate,
  );
}

function getLatestActivityDate(activities) {
  if (!activities.length) {
    return "";
  }

  return activities.reduce(
    (latestDate, activity) =>
      activity.date > latestDate ? activity.date : latestDate,
    activities[0].date,
  );
}

function getContinentFromCountryCode(countryCode = "") {
  const code = countryCode.toUpperCase();

  if (
    [
      "AO",
      "BF",
      "BI",
      "BJ",
      "BW",
      "CD",
      "CF",
      "CG",
      "CI",
      "CM",
      "CV",
      "DJ",
      "DZ",
      "EG",
      "EH",
      "ER",
      "ET",
      "GA",
      "GH",
      "GM",
      "GN",
      "GQ",
      "GW",
      "KE",
      "KM",
      "LR",
      "LS",
      "LY",
      "MA",
      "MG",
      "ML",
      "MR",
      "MU",
      "MW",
      "MZ",
      "NA",
      "NE",
      "NG",
      "RE",
      "RW",
      "SC",
      "SD",
      "SL",
      "SN",
      "SO",
      "SS",
      "ST",
      "SZ",
      "TD",
      "TG",
      "TN",
      "TZ",
      "UG",
      "YT",
      "ZA",
      "ZM",
      "ZW",
    ].includes(code)
  ) {
    return "Africa";
  }

  if (
    [
      "AE",
      "AF",
      "AM",
      "AZ",
      "BD",
      "BH",
      "BN",
      "BT",
      "CN",
      "CY",
      "GE",
      "HK",
      "ID",
      "IL",
      "IN",
      "IQ",
      "IR",
      "JO",
      "JP",
      "KG",
      "KH",
      "KP",
      "KR",
      "KW",
      "KZ",
      "LA",
      "LB",
      "LK",
      "MM",
      "MN",
      "MO",
      "MV",
      "MY",
      "NP",
      "OM",
      "PH",
      "PK",
      "PS",
      "QA",
      "SA",
      "SG",
      "SY",
      "TH",
      "TJ",
      "TL",
      "TM",
      "TR",
      "TW",
      "UZ",
      "VN",
      "YE",
    ].includes(code)
  ) {
    return "Asia";
  }

  if (
    [
      "AD",
      "AL",
      "AT",
      "BA",
      "BE",
      "BG",
      "BY",
      "CH",
      "CZ",
      "DE",
      "DK",
      "EE",
      "ES",
      "FI",
      "FO",
      "FR",
      "GB",
      "GG",
      "GI",
      "GR",
      "HR",
      "HU",
      "IE",
      "IM",
      "IS",
      "IT",
      "JE",
      "LI",
      "LT",
      "LU",
      "LV",
      "MC",
      "MD",
      "ME",
      "MK",
      "MT",
      "NL",
      "NO",
      "PL",
      "PT",
      "RO",
      "RS",
      "RU",
      "SE",
      "SI",
      "SK",
      "SM",
      "UA",
      "VA",
    ].includes(code)
  ) {
    return "Europe";
  }

  if (
    [
      "AG",
      "AI",
      "AW",
      "BB",
      "BL",
      "BM",
      "BQ",
      "BS",
      "BZ",
      "CA",
      "CR",
      "CU",
      "CW",
      "DM",
      "DO",
      "GD",
      "GL",
      "GP",
      "GT",
      "HN",
      "HT",
      "JM",
      "KN",
      "KY",
      "LC",
      "MF",
      "MQ",
      "MS",
      "MX",
      "NI",
      "PA",
      "PM",
      "PR",
      "SV",
      "SX",
      "TC",
      "TT",
      "US",
      "VC",
      "VG",
      "VI",
    ].includes(code)
  ) {
    return "North America";
  }

  if (
    [
      "AR",
      "BO",
      "BR",
      "CL",
      "CO",
      "EC",
      "FK",
      "GF",
      "GY",
      "PE",
      "PY",
      "SR",
      "UY",
      "VE",
    ].includes(code)
  ) {
    return "South America";
  }

  if (
    [
      "AS",
      "AU",
      "CK",
      "FJ",
      "FM",
      "GU",
      "KI",
      "MH",
      "MP",
      "NC",
      "NF",
      "NR",
      "NU",
      "NZ",
      "PF",
      "PG",
      "PN",
      "PW",
      "SB",
      "TK",
      "TO",
      "TV",
      "UM",
      "VU",
      "WF",
      "WS",
    ].includes(code)
  ) {
    return "Oceania";
  }

  return "";
}

function scrollToPanel(panelRef) {
  window.requestAnimationFrame(() => {
    panelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

function showActionError(setter, actionLabel, message) {
  const errorMessage = message || `Failed to ${actionLabel}.`;
  setter(errorMessage);
  window.alert(errorMessage);
}

function App() {
  const tripFormPanelRef = useRef(null);
  const itineraryPanelRef = useRef(null);
  const [activeView, setActiveView] = useState("login");
  const [theme, setTheme] = useState(getInitialTheme);
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [editingTrip, setEditingTrip] = useState(null);
  const [activitiesByTripId, setActivitiesByTripId] = useState({});
  const [editingActivity, setEditingActivity] = useState(null);
  const [copyingTripId, setCopyingTripId] = useState("");
  const [calendarSelection, setCalendarSelection] = useState({
    endDate: "",
    startDate: "",
  });
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const plannerTrips = trips.filter((trip) => !trip.seeded);
  const inspirationTrips = trips.filter((trip) => trip.seeded);
  const plannerTripIdsKey = plannerTrips.map((trip) => trip._id).join("|");
  const statisticsActivities = Object.values(activitiesByTripId).flat();
  const selectedTrip =
    plannerTrips.find((trip) => trip._id === selectedTripId) || null;
  const selectedTripActivities = activitiesByTripId[selectedTripId] || [];
  const defaultActivityDate =
    getLatestActivityDate(selectedTripActivities) ||
    selectedTrip?.startDate ||
    "";
  const latestPlannerEndDate = getLatestTripEndDate(plannerTrips);
  const nextAllowedPlannerStartDate = latestPlannerEndDate
    ? addDays(latestPlannerEndDate, 1)
    : "";

  function handleCalendarRangeSelect(startDate, endDate) {
    setCalendarSelection({ endDate, startDate });
    setEditingTrip(null);
    setActiveView("planner");
    scrollToPanel(tripFormPanelRef);
  }

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    async function hydrateSession() {
      try {
        const response = await getCurrentUser();
        setCurrentUser(response.user);
        setActiveView("calendar");
      } catch (_error) {
        setCurrentUser(null);
      }
    }

    hydrateSession();
  }, []);

  useEffect(() => {
    if (
      !currentUser &&
      ["calendar", "planner", "statistics", "timeline"].includes(activeView)
    ) {
      setActiveView("login");
    }
  }, [activeView, currentUser]);

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
      if (
        currentTripId &&
        plannerTrips.some((trip) => trip._id === currentTripId)
      ) {
        return currentTripId;
      }

      return plannerTrips[0]?._id || "";
    });
  }, [plannerTrips]);

  useEffect(() => {
    if (!currentUser || !selectedTripId) {
      setIsLoadingActivities(false);
      return;
    }

    async function loadActivities() {
      try {
        setIsLoadingActivities(true);
        const activityData = await getActivities(selectedTripId);
        setActivitiesByTripId((currentActivities) => ({
          ...currentActivities,
          [selectedTripId]: activityData,
        }));
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoadingActivities(false);
      }
    }

    loadActivities();
  }, [currentUser, selectedTripId]);

  useEffect(() => {
    if (!currentUser) {
      setActivitiesByTripId((currentActivities) =>
        Object.keys(currentActivities).length ? {} : currentActivities,
      );
      return;
    }

    async function loadPlannerActivities() {
      try {
        const activityEntries = await Promise.all(
          plannerTrips.map(async (trip) => [
            trip._id,
            await getActivities(trip._id),
          ]),
        );

        setActivitiesByTripId(Object.fromEntries(activityEntries));
      } catch (_error) {
        setActivitiesByTripId((currentActivities) =>
          Object.keys(currentActivities).length ? {} : currentActivities,
        );
      }
    }

    if (!plannerTrips.length) {
      setActivitiesByTripId((currentActivities) =>
        Object.keys(currentActivities).length ? {} : currentActivities,
      );
      return;
    }

    loadPlannerActivities();
  }, [plannerTripIdsKey, currentUser]);

  async function handleTripCreate(formValues) {
    setErrorMessage("");
    if (!currentUser) {
      showActionError(
        setAuthErrorMessage,
        "manage your planner",
        "Login required to manage your planner.",
      );
      return;
    }

    if (formValues.endDate < formValues.startDate) {
      showActionError(
        setErrorMessage,
        "save the trip",
        "A trip cannot end before it starts.",
      );
      return;
    }

    try {
      if (editingTrip) {
        const savedTrip = await updateTrip(editingTrip._id, formValues);
        setTrips((currentTrips) =>
          currentTrips.map((trip) =>
            trip._id === savedTrip._id ? savedTrip : trip,
          ),
        );
        setEditingTrip(null);
        return;
      }

      const newTrip = await createTrip(formValues);
      setTrips((currentTrips) => [newTrip, ...currentTrips]);
      setSelectedTripId(newTrip._id);
      setCalendarSelection({ endDate: "", startDate: "" });
    } catch (error) {
      showActionError(setErrorMessage, "save the trip", error.message);
    }
  }

  async function handleActivityCreate(formValues) {
    setErrorMessage("");
    if (!currentUser) {
      showActionError(
        setAuthErrorMessage,
        "manage your planner",
        "Login required to manage your planner.",
      );
      return;
    }

    try {
      if (editingActivity) {
        const savedActivity = await updateActivity(
          editingActivity._id,
          formValues,
        );
        setActivitiesByTripId((currentActivities) => ({
          ...currentActivities,
          [selectedTripId]: (currentActivities[selectedTripId] || []).map(
            (activity) =>
              activity._id === savedActivity._id ? savedActivity : activity,
          ),
        }));
        setEditingActivity(null);
        return;
      }

      const newActivity = await createActivity({
        ...formValues,
        tripId: selectedTripId,
      });

      setActivitiesByTripId((currentActivities) => ({
        ...currentActivities,
        [selectedTripId]: [
          ...(currentActivities[selectedTripId] || []),
          newActivity,
        ],
      }));
    } catch (error) {
      showActionError(setErrorMessage, "save the activity", error.message);
    }
  }

  async function handleTripDelete(tripId) {
    setErrorMessage("");
    await deleteTrip(tripId);

    const remainingTrips = trips.filter((trip) => trip._id !== tripId);
    setTrips(remainingTrips);
    setActivitiesByTripId((currentActivities) => {
      const nextActivities = { ...currentActivities };
      delete nextActivities[tripId];
      return nextActivities;
    });
    setEditingTrip((currentTrip) =>
      currentTrip && currentTrip._id === tripId ? null : currentTrip,
    );

    if (selectedTripId === tripId) {
      setSelectedTripId(remainingTrips.find((trip) => !trip.seeded)?._id || "");
      setEditingActivity(null);
    }
  }

  async function handleDeleteAllPlannerTrips() {
    if (plannerTrips.length === 0) {
      return;
    }

    const shouldDelete = window.confirm(
      "Delete all planner trips and their activities? This will not remove inspiration trips.",
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");
    await Promise.all(plannerTrips.map((trip) => deleteTrip(trip._id)));
    setTrips((currentTrips) => currentTrips.filter((trip) => trip.seeded));
    setSelectedTripId("");
    setEditingTrip(null);
    setEditingActivity(null);
  }

  async function handleActivityDelete(activityId) {
    setErrorMessage("");
    await deleteActivity(activityId);
    setActivitiesByTripId((currentActivities) =>
      Object.fromEntries(
        Object.entries(currentActivities).map(([tripId, tripActivities]) => [
          tripId,
          tripActivities.filter((activity) => activity._id !== activityId),
        ]),
      ),
    );
    setEditingActivity((currentActivity) =>
      currentActivity && currentActivity._id === activityId
        ? null
        : currentActivity,
    );
  }

  async function handleDeleteAllActivities(tripId) {
    const tripActivities = activitiesByTripId[tripId] || [];

    if (tripActivities.length === 0) {
      return;
    }

    const shouldDelete = window.confirm("Delete all activities for this trip?");

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");
    await Promise.all(
      tripActivities.map((activity) => deleteActivity(activity._id)),
    );
    setActivitiesByTripId((currentActivities) => ({
      ...currentActivities,
      [tripId]: [],
    }));

    if (selectedTripId === tripId) {
      setActivitiesByTripId((currentActivities) => ({
        ...currentActivities,
        [tripId]: [],
      }));
    }

    setEditingActivity((currentActivity) =>
      currentActivity &&
      tripActivities.some((activity) => activity._id === currentActivity._id)
        ? null
        : currentActivity,
    );
  }

  async function handleCopyTripToPlanner(sourceTrip) {
    setErrorMessage("");
    setAuthErrorMessage("");

    if (!currentUser) {
      showActionError(
        setAuthErrorMessage,
        "copy the trip to your planner",
        "Create an account or login before copying trips to your planner.",
      );
      setActiveView("login");
      return;
    }

    setCopyingTripId(sourceTrip._id);

    try {
      const today = formatDate(new Date());
      const plannerStartDate = nextAllowedPlannerStartDate || today;
      const tripLength = getTripLengthInDays(
        sourceTrip.startDate,
        sourceTrip.endDate,
      );
      const copiedEndDate = addDays(plannerStartDate, Math.min(tripLength, 30));
      const sourceActivities = await getActivities(sourceTrip._id);

      const copiedTrip = await createTrip({
        city: sourceTrip.city || "",
        continent:
          sourceTrip.continent ||
          getContinentFromCountryCode(sourceTrip.countryCode),
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
          }),
        ),
      );

      setTrips((currentTrips) => [copiedTrip, ...currentTrips]);
      setSelectedTripId(copiedTrip._id);
      setActivitiesByTripId((currentActivities) => ({
        ...currentActivities,
        [copiedTrip._id]: copiedActivities,
      }));
      setEditingTrip(null);
      setEditingActivity(null);
      setCalendarSelection({ endDate: "", startDate: "" });
      setActiveView("planner");
    } catch (error) {
      showActionError(
        setErrorMessage,
        "copy the trip to your planner",
        error.message,
      );
    } finally {
      setCopyingTripId("");
    }
  }

  async function handleLogin(credentials) {
    setAuthErrorMessage("");

    try {
      const response = await login(credentials);
      setCurrentUser(response.user);
      setCalendarSelection({ endDate: "", startDate: "" });
      setActiveView("calendar");
    } catch (error) {
      showActionError(setAuthErrorMessage, "log in", error.message);
    }
  }

  async function handleRegister(formValues) {
    setAuthErrorMessage("");

    try {
      const response = await register(formValues);
      setCurrentUser(response.user);
      setCalendarSelection({ endDate: "", startDate: "" });
      setActiveView("calendar");
    } catch (error) {
      showActionError(setAuthErrorMessage, "register", error.message);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (_error) {
      // Clear the client session state even if the server session already expired.
    }

    setCurrentUser(null);
    setSelectedTripId("");
    setActivitiesByTripId({});
    setCalendarSelection({ endDate: "", startDate: "" });
    setEditingTrip(null);
    setEditingActivity(null);
  }

  function handleTripEdit(trip) {
    setActiveView("planner");
    setSelectedTripId(trip._id);
    setEditingTrip(trip);
    scrollToPanel(tripFormPanelRef);
  }

  function handleActivityEdit(activity, tripId) {
    setActiveView("planner");
    setSelectedTripId(tripId);
    setEditingActivity(activity);
    scrollToPanel(itineraryPanelRef);
  }

  function handleAddActivity(tripId) {
    setActiveView("planner");
    setSelectedTripId(tripId);
    setEditingActivity(null);
    scrollToPanel(itineraryPanelRef);
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <h1>TripTrack</h1>
        <p className="hero-copy">
          Organize trips, dates, notes, and daily itinerary items in one place.
        </p>
        <div className="hero-controls">
          <div className="view-switcher">
            {!currentUser ? (
              <button
                className={activeView === "login" ? "active-view" : ""}
                onClick={() => setActiveView("login")}
                type="button"
              >
                Log In
              </button>
            ) : null}
            <button
              className={activeView === "inspiration" ? "active-view" : ""}
              onClick={() => setActiveView("inspiration")}
              type="button"
            >
              Inspiration
            </button>
            {currentUser ? (
              <>
                <button
                  className={activeView === "calendar" ? "active-view" : ""}
                  onClick={() => setActiveView("calendar")}
                  type="button"
                >
                  Calendar
                </button>
                <button
                  className={activeView === "planner" ? "active-view" : ""}
                  onClick={() => setActiveView("planner")}
                  type="button"
                >
                  Planner
                </button>
                <button
                  className={activeView === "statistics" ? "active-view" : ""}
                  onClick={() => setActiveView("statistics")}
                  type="button"
                >
                  Statistics
                </button>
                <button
                  className={activeView === "timeline" ? "active-view" : ""}
                  onClick={() => setActiveView("timeline")}
                  type="button"
                >
                  Timeline
                </button>
              </>
            ) : null}
          </div>
          <div className="top-actions">
            <button
              className="theme-toggle"
              onClick={() =>
                setTheme((currentTheme) =>
                  currentTheme === "dark" ? "light" : "dark",
                )
              }
              type="button"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            {currentUser ? (
              <div className="session-bar">
                <button onClick={handleLogout} type="button">
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {errorMessage ? <p className="status error">{errorMessage}</p> : null}

      {activeView === "login" ? (
        <main>
          <AuthPanel
            errorMessage={authErrorMessage}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        </main>
      ) : activeView === "planner" ? (
        <main className="planner-layout">
          <section
            className="panel planner-panel planner-panel-form"
            ref={tripFormPanelRef}
          >
            <div className="panel-header">
              <div>
                <h2>Trips</h2>
                <p>
                  {editingTrip
                    ? `Editing ${editingTrip.destination}`
                    : "Create and manage destination plans."}
                </p>
              </div>
            </div>
            <TripForm
              editingTrip={editingTrip}
              selectedEndDate={calendarSelection.endDate}
              selectedStartDate={calendarSelection.startDate}
              suggestedStartDate={editingTrip ? "" : nextAllowedPlannerStartDate}
              onCancelEdit={() => setEditingTrip(null)}
              onSubmit={handleTripCreate}
            />
          </section>

          <section
            className="panel planner-panel planner-panel-itinerary"
            ref={itineraryPanelRef}
          >
            <div className="panel-header">
              <h2>Itinerary</h2>
              <p>
                {editingActivity
                  ? `Editing ${editingActivity.name}`
                  : "Add activities to the currently selected trip."}
              </p>
            </div>
            <ActivityForm
              defaultDate={defaultActivityDate}
              disabled={!selectedTripId}
              editingActivity={editingActivity}
              onCancelEdit={() => setEditingActivity(null)}
              onSubmit={handleActivityCreate}
            />
          </section>

          <section className="panel planner-panel planner-panel-overview">
            <div className="panel-header">
              <div>
                <h2>Planned Trips</h2>
                <p>
                  View all planner trips with their nested activities in one
                  place.
                </p>
              </div>
            </div>
            <PlannerOverview
              activitiesByTripId={activitiesByTripId}
              isLoading={isLoadingTrips || isLoadingActivities}
              onAddActivity={handleAddActivity}
              onDeleteActivity={handleActivityDelete}
              onDeleteTrip={handleTripDelete}
              onEditActivity={handleActivityEdit}
              onEditTrip={handleTripEdit}
              onSelectTrip={setSelectedTripId}
              selectedTripId={selectedTripId}
              trips={plannerTrips}
            />
          </section>
        </main>
      ) : activeView === "calendar" ? (
        <main>
          <PlannerCalendar
            activitiesByTripId={activitiesByTripId}
            onDateRangeSelect={handleCalendarRangeSelect}
            onTripSelect={(trip) => {
              setActiveView("planner");
              setSelectedTripId(trip._id);
            }}
            trips={plannerTrips}
          />
        </main>
      ) : activeView === "timeline" ? (
        <main>
          <SimpleTripTimeline
            trips={trips.filter((trip) => !trip.seeded)} // Only show your actual trips, not inspiration
            onTripSelect={(trip) => {
              setActiveView("planner");
              setSelectedTripId(trip._id);
            }}
          />
        </main>
      ) : activeView === "statistics" ? (
        <main>
          <TripStatistics
            trips={plannerTrips}
            activities={statisticsActivities}
          />
        </main>
      ) : (
        <main>
          <InspirationBoard
            currentUser={currentUser}
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

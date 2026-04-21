import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { formatDisplayDate } from "../lib/date.js";
import "./SimpleTripTimeline.css";

function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function isUpcoming(trip) {
  return new Date(trip.startDate) > new Date();
}

function isInProgress(trip) {
  const now = new Date();
  return new Date(trip.startDate) <= now && new Date(trip.endDate) >= now;
}

function SimpleTripTimeline({ trips, onTripSelect }) {
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Filter and sort trips
  const filteredTrips = useMemo(() => {
    let filtered = [...trips];

    switch (selectedFilter) {
      case "upcoming":
        filtered = filtered.filter(isUpcoming);
        break;
      case "completed":
        filtered = filtered.filter(
          (trip) => new Date(trip.endDate) < new Date(),
        );
        break;
      case "current":
        filtered = filtered.filter(isInProgress);
        break;
      case "planner":
        filtered = filtered.filter((trip) => !trip.seeded);
        break;
      default:
        // Show all trips
        break;
    }

    return filtered.sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate),
    );
  }, [trips, selectedFilter]);

  function getTripStatus(trip) {
    if (isInProgress(trip)) return "current";
    if (isUpcoming(trip)) return "upcoming";
    return "completed";
  }

  if (trips.length === 0) {
    return (
      <div className="simple-timeline">
        <div className="timeline-empty">
          <h3>No trips yet</h3>
          <p>Create your first trip to see your timeline!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-timeline">
      <div className="timeline-header">
        <h2>My Trip Timeline</h2>
        <div className="timeline-controls">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Trips</option>
            <option value="upcoming">Upcoming</option>
            <option value="current">Current</option>
            <option value="completed">Completed</option>
            <option value="planner">My Trips Only</option>
          </select>
        </div>
      </div>

      <div className="timeline-summary">
        <span>{filteredTrips.length} trips • </span>
        <span>
          {filteredTrips.reduce(
            (sum, trip) => sum + getDaysBetween(trip.startDate, trip.endDate),
            0,
          )}{" "}
          total days
        </span>
      </div>

      <div className="timeline-container">
        {filteredTrips.length === 0 ? (
          <div className="no-trips">
            <p>No trips match your filter</p>
          </div>
        ) : (
          <div className="timeline-line">
            {filteredTrips.map((trip, index) => {
              const status = getTripStatus(trip);
              const duration = getDaysBetween(trip.startDate, trip.endDate);

              return (
                <div
                  key={trip._id}
                  className={`timeline-trip ${status}`}
                  onClick={() => onTripSelect?.(trip)}
                >
                  {/* Timeline connector line */}
                  {index > 0 && <div className="timeline-connector"></div>}

                  {/* Trip marker dot */}
                  <div className="trip-marker">
                    <div className={`marker-dot ${status}`}></div>
                  </div>

                  {/* Trip card */}
                  <div className="trip-card">
                    <div className="trip-header">
                      <h3>{trip.destination}</h3>
                      <span className={`status-badge ${status}`}>
                        {status === "current"
                          ? "Now"
                          : status === "upcoming"
                            ? "Upcoming"
                            : "Completed"}
                      </span>
                    </div>

                    <div className="trip-dates">
                      {formatDisplayDate(trip.startDate)} -{" "}
                      {formatDisplayDate(trip.endDate)}
                    </div>

                    <div className="trip-details">
                      <span className="duration">
                        {duration} day{duration !== 1 ? "s" : ""}
                      </span>
                      {trip.continent && (
                        <>
                          <span className="separator">•</span>
                          <span className="continent">{trip.continent}</span>
                        </>
                      )}
                      {trip.country && trip.country !== trip.continent && (
                        <>
                          <span className="separator">•</span>
                          <span className="country">{trip.country}</span>
                        </>
                      )}
                    </div>

                    {trip.notes && (
                      <div className="trip-notes">
                        {trip.notes.substring(0, 100)}
                        {trip.notes.length > 100 && "..."}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

SimpleTripTimeline.propTypes = {
  trips: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      destination: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      continent: PropTypes.string,
      country: PropTypes.string,
      notes: PropTypes.string,
      seeded: PropTypes.bool,
    }),
  ).isRequired,
  onTripSelect: PropTypes.func,
};

export default SimpleTripTimeline;

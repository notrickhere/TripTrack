import PropTypes from "prop-types";

import { formatDisplayDateRange } from "../lib/date.js";
import "./TripList.css";

function toTitleCase(value = "") {
  return value.replace(/\w\S*/g, (word) => {
    const normalizedWord = word.toLowerCase();
    return normalizedWord.charAt(0).toUpperCase() + normalizedWord.slice(1);
  });
}

function TripList({
  isLoading,
  onDeleteTrip,
  onEditTrip,
  onSelectTrip,
  selectedTripId,
  trips,
}) {
  if (isLoading) {
    return <p className="empty-state">Loading trips...</p>;
  }

  if (trips.length === 0) {
    return <p className="empty-state">No trips yet. Create your first trip.</p>;
  }

  return (
    <ul className="trip-list">
      {trips.map((trip) => (
        <li className="trip-list-item" key={trip._id}>
          <button
            aria-label={`Select trip ${trip.destination}`}
            className={
              trip._id === selectedTripId ? "trip-card active" : "trip-card"
            }
            onClick={() => onSelectTrip(trip._id)}
            type="button"
          >
            <span className="trip-card-title">{trip.destination}</span>
            <span className="trip-card-location">
              {[trip.continent, trip.country, trip.city]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <span>{formatDisplayDateRange(trip.startDate, trip.endDate)}</span>
            {trip.notes ? (
              <span className="trip-card-notes">{toTitleCase(trip.notes)}</span>
            ) : null}
          </button>
          <div className="card-actions">
            <button
              aria-label={`Edit trip ${trip.destination}`}
              onClick={() => onEditTrip(trip)}
              type="button"
            >
              Edit
            </button>
            <button
              aria-label={`Delete trip ${trip.destination}`}
              className="danger-button"
              onClick={() => onDeleteTrip(trip._id)}
              type="button"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

TripList.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  onDeleteTrip: PropTypes.func.isRequired,
  onEditTrip: PropTypes.func.isRequired,
  onSelectTrip: PropTypes.func.isRequired,
  selectedTripId: PropTypes.string.isRequired,
  trips: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      city: PropTypes.string,
      continent: PropTypes.string,
      country: PropTypes.string,
      destination: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      notes: PropTypes.string,
      startDate: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default TripList;

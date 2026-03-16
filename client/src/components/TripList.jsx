import PropTypes from "prop-types";

import "./TripList.css";

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
            className={trip._id === selectedTripId ? "trip-card active" : "trip-card"}
            onClick={() => onSelectTrip(trip._id)}
            type="button"
          >
            <span className="trip-card-title">{trip.destination}</span>
            <span>
              {trip.startDate} to {trip.endDate}
            </span>
            {trip.notes ? <span className="trip-card-notes">{trip.notes}</span> : null}
          </button>
          <div className="card-actions">
            <button onClick={() => onEditTrip(trip)} type="button">
              Edit
            </button>
            <button
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
      destination: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      notes: PropTypes.string,
      startDate: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default TripList;

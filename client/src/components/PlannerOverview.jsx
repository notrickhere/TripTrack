import PropTypes from "prop-types";

import "./PlannerOverview.css";

function toTitleCase(value = "") {
  return value.replace(/\w\S*/g, (word) => {
    const normalizedWord = word.toLowerCase();
    return normalizedWord.charAt(0).toUpperCase() + normalizedWord.slice(1);
  });
}

function PlannerOverview({
  activitiesByTripId,
  isLoading,
  onDeleteActivity,
  onDeleteAllActivities,
  onDeleteTrip,
  onEditActivity,
  onEditTrip,
  onSelectTrip,
  selectedTripId,
  trips,
}) {
  if (isLoading) {
    return <p className="empty-state">Loading planner trips...</p>;
  }

  if (trips.length === 0) {
    return <p className="empty-state">No planner trips yet. Add one or copy from inspiration.</p>;
  }

  return (
    <div className="planner-overview">
      {trips.map((trip) => (
        <article
          className={trip._id === selectedTripId ? "planner-trip-card active" : "planner-trip-card"}
          key={trip._id}
        >
          <button
            className="planner-trip-select"
            onClick={() => onSelectTrip(trip._id)}
            type="button"
          >
            <span className="planner-trip-title">{trip.destination}</span>
            <span className="planner-trip-location">
              {[trip.continent, trip.country, trip.city].filter(Boolean).join(" · ")}
            </span>
            <span>
              {trip.startDate} to {trip.endDate}
            </span>
            {trip.notes ? (
              <span className="planner-trip-notes">{toTitleCase(trip.notes)}</span>
            ) : null}
          </button>

          <div className="planner-card-actions">
            <button onClick={() => onEditTrip(trip)} type="button">
              Edit Trip
            </button>
            <button className="danger-button" onClick={() => onDeleteTrip(trip._id)} type="button">
              Delete Trip
            </button>
          </div>

          <div className="planner-activity-section">
            <div className="planner-activity-header">
              <p className="planner-activity-heading">Activities</p>
              <button
                className="planner-activity-clear"
                disabled={!activitiesByTripId[trip._id]?.length}
                onClick={() => onDeleteAllActivities(trip._id)}
                type="button"
              >
                Delete All Activities
              </button>
            </div>
            {activitiesByTripId[trip._id]?.length ? (
              <ul className="planner-activity-list">
                {activitiesByTripId[trip._id].map((activity) => (
                  <li className="planner-activity-item" key={activity._id}>
                    <div className="planner-activity-copy">
                      <strong>{toTitleCase(activity.name)}</strong>
                      <span>
                        {activity.date}
                        {activity.time ? ` at ${activity.time}` : ""}
                      </span>
                      {activity.description ? <p>{activity.description}</p> : null}
                    </div>
                    <div className="planner-card-actions">
                      <button onClick={() => onEditActivity(activity, trip._id)} type="button">
                        Edit
                      </button>
                      <button
                        className="danger-button"
                        onClick={() => onDeleteActivity(activity._id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="planner-activity-empty">No activities yet for this trip.</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

PlannerOverview.propTypes = {
  activitiesByTripId: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        description: PropTypes.string,
        name: PropTypes.string.isRequired,
        time: PropTypes.string,
      })
    )
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  onDeleteActivity: PropTypes.func.isRequired,
  onDeleteAllActivities: PropTypes.func.isRequired,
  onDeleteTrip: PropTypes.func.isRequired,
  onEditActivity: PropTypes.func.isRequired,
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
    })
  ).isRequired,
};

export default PlannerOverview;

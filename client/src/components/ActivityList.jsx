import PropTypes from "prop-types";

import { formatDisplayDate } from "../lib/date.js";
import "./ActivityList.css";

// Redundant
function toTitleCase(value = "") {
  return value.replace(/\w\S*/g, (word) => {
    const normalizedWord = word.toLowerCase();
    return normalizedWord.charAt(0).toUpperCase() + normalizedWord.slice(1);
  });
}

function ActivityList({
  activities,
  isLoading,
  onDeleteActivity,
  onEditActivity,
  selectedTripId,
}) {
  if (!selectedTripId) {
    return <p className="empty-state">Select a trip to view its itinerary.</p>;
  }

  if (isLoading) {
    return <p className="empty-state">Loading activities...</p>;
  }

  if (activities.length === 0) {
    return <p className="empty-state">No activities yet for this trip.</p>;
  }

  return (
    <ul className="activity-list">
      {activities.map((activity) => (
        <li className="activity-card" key={activity._id}>
          <div className="activity-card-header">
            <h3>{toTitleCase(activity.name)}</h3>
            <span>
              {formatDisplayDate(activity.date)}
              {activity.time ? ` at ${activity.time}` : ""}
            </span>
          </div>
          {activity.description ? <p>{activity.description}</p> : null}
          <div className="card-actions">
            <button
              aria-label={`Edit activity ${toTitleCase(activity.name)}`}
              onClick={() => onEditActivity(activity)}
              type="button"
            >
              Edit
            </button>
            <button
              aria-label={`Delete activity ${toTitleCase(activity.name)}`}
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
  );
}

ActivityList.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      description: PropTypes.string,
      name: PropTypes.string.isRequired,
      time: PropTypes.string,
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  onDeleteActivity: PropTypes.func.isRequired,
  onEditActivity: PropTypes.func.isRequired,
  selectedTripId: PropTypes.string.isRequired,
};

export default ActivityList;

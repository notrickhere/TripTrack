import PropTypes from "prop-types";

import "./ActivityList.css";

function ActivityList({ activities, isLoading, selectedTripId }) {
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
            <h3>{activity.name}</h3>
            <span>
              {activity.date}
              {activity.time ? ` at ${activity.time}` : ""}
            </span>
          </div>
          {activity.description ? <p>{activity.description}</p> : null}
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
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  selectedTripId: PropTypes.string.isRequired,
};

export default ActivityList;

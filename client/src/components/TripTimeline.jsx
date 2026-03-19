import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import "./TripTimeline.css";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function getTimelinePeriod(trips) {
  if (trips.length === 0) return { start: new Date(), end: new Date() };

  const dates = trips.flatMap((trip) => [
    new Date(trip.startDate),
    new Date(trip.endDate),
  ]);
  return {
    start: new Date(Math.min(...dates)),
    end: new Date(Math.max(...dates)),
  };
}

function getYearFromDate(dateString) {
  return new Date(dateString).getFullYear();
}

function isUpcoming(trip) {
  return new Date(trip.startDate) > new Date();
}

function isInProgress(trip) {
  const now = new Date();
  return new Date(trip.startDate) <= now && new Date(trip.endDate) >= now;
}

function TripTimeline({ trips, activities = [], onTripSelect }) {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [viewMode, setViewMode] = useState("timeline"); // 'timeline' or 'calendar'

  // Filter trips based on selected criteria
  const filteredTrips = useMemo(() => {
    let filtered = [...trips];

    // Filter by year
    if (selectedYear !== "all") {
      filtered = filtered.filter(
        (trip) => getYearFromDate(trip.startDate) === parseInt(selectedYear)
      );
    }

    // Filter by status
    switch (selectedFilter) {
      case "upcoming":
        filtered = filtered.filter(isUpcoming);
        break;
      case "completed":
        filtered = filtered.filter(
          (trip) => new Date(trip.endDate) < new Date()
        );
        break;
      case "in-progress":
        filtered = filtered.filter(isInProgress);
        break;
      case "planner":
        filtered = filtered.filter((trip) => !trip.seeded);
        break;
      case "inspiration":
        filtered = filtered.filter((trip) => trip.seeded);
        break;
      default:
        // Show all trips
        break;
    }

    return filtered.sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
  }, [trips, selectedFilter, selectedYear]);

  // Get unique years for year filter
  const availableYears = useMemo(() => {
    const years = [
      ...new Set(trips.map((trip) => getYearFromDate(trip.startDate))),
    ];
    return years.sort((a, b) => a - b);
  }, [trips]);

  // Calculate timeline period
  const timelinePeriod = useMemo(() => {
    return getTimelinePeriod(filteredTrips);
  }, [filteredTrips]);

  // Group activities by trip for quick lookup
  const activitiesByTrip = useMemo(() => {
    return activities.reduce((acc, activity) => {
      if (!acc[activity.tripId]) acc[activity.tripId] = [];
      acc[activity.tripId].push(activity);
      return acc;
    }, {});
  }, [activities]);

  function getTripStatus(trip) {
    if (isInProgress(trip)) return "in-progress";
    if (isUpcoming(trip)) return "upcoming";
    return "completed";
  }

  function getTripPosition(trip, totalDuration) {
    const tripStart = new Date(trip.startDate);
    const timelineStart = timelinePeriod.start;
    const daysSinceStart = Math.max(
      0,
      (tripStart - timelineStart) / (1000 * 60 * 60 * 24)
    );
    return (daysSinceStart / totalDuration) * 100;
  }

  const totalTimelineDays = useMemo(() => {
    if (filteredTrips.length === 0) return 1;
    return Math.max(
      1,
      (timelinePeriod.end - timelinePeriod.start) / (1000 * 60 * 60 * 24)
    );
  }, [timelinePeriod, filteredTrips]);

  if (trips.length === 0) {
    return (
      <div className="trip-timeline">
        <div className="timeline-empty">
          <h3>No trips to display</h3>
          <p>Create your first trip to see your timeline!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-timeline">
      <div className="timeline-header">
        <div className="timeline-title">
          <h2>Trip Timeline</h2>
          <p>Visual journey through your travels</p>
        </div>

        <div className="timeline-controls">
          <div className="timeline-filters">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="timeline-filter"
            >
              <option value="all">All Trips</option>
              <option value="upcoming">Upcoming</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="planner">My Planner</option>
              <option value="inspiration">Inspiration</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="timeline-filter"
            >
              <option value="all">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="view-mode-toggle">
            <button
              className={viewMode === "timeline" ? "active" : ""}
              onClick={() => setViewMode("timeline")}
            >
              Timeline
            </button>
            <button
              className={viewMode === "calendar" ? "active" : ""}
              onClick={() => setViewMode("calendar")}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      <div className="timeline-stats">
        <div className="timeline-stat">
          <span className="stat-number">{filteredTrips.length}</span>
          <span className="stat-label">Trips</span>
        </div>
        <div className="timeline-stat">
          <span className="stat-number">
            {filteredTrips.reduce(
              (sum, trip) => sum + getDaysBetween(trip.startDate, trip.endDate),
              0
            )}
          </span>
          <span className="stat-label">Days</span>
        </div>
        <div className="timeline-stat">
          <span className="stat-number">
            {[...new Set(filteredTrips.map((trip) => trip.continent))].length}
          </span>
          <span className="stat-label">Continents</span>
        </div>
      </div>

      {viewMode === "timeline" ? (
        <TimelineView
          trips={filteredTrips}
          activitiesByTrip={activitiesByTrip}
          onTripSelect={onTripSelect}
          getTripStatus={getTripStatus}
          getTripPosition={getTripPosition}
          totalTimelineDays={totalTimelineDays}
        />
      ) : (
        <CalendarView
          trips={filteredTrips}
          activitiesByTrip={activitiesByTrip}
          onTripSelect={onTripSelect}
          getTripStatus={getTripStatus}
        />
      )}
    </div>
  );
}

// Timeline View Component
function TimelineView({
  trips,
  activitiesByTrip,
  onTripSelect,
  getTripStatus,
  getTripPosition,
  totalTimelineDays,
}) {
  const [selectedTrip, setSelectedTrip] = useState(null);

  if (trips.length === 0) {
    return (
      <div className="timeline-content">
        <div className="timeline-empty-filtered">
          <p>No trips match your current filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-content">
      <div className="timeline-line">
        {trips.map((trip, index) => {
          const position = getTripPosition(trip, totalTimelineDays);
          const status = getTripStatus(trip);
          const duration = getDaysBetween(trip.startDate, trip.endDate);
          const tripActivities = activitiesByTrip[trip._id] || [];

          return (
            <div
              key={trip._id}
              className={`timeline-item ${status} ${selectedTrip?._id === trip._id ? "selected" : ""}`}
              style={{ left: `${Math.min(95, position)}%` }}
              onClick={() => {
                setSelectedTrip(selectedTrip?._id === trip._id ? null : trip);
                onTripSelect?.(trip);
              }}
            >
              <div className="timeline-marker">
                <div className="marker-dot"></div>
                <div className="marker-line"></div>
              </div>

              <div className="timeline-card">
                <div className="timeline-card-header">
                  <h4>{trip.destination}</h4>
                  <span className={`trip-status-badge ${status}`}>
                    {status === "in-progress"
                      ? "Current"
                      : status === "upcoming"
                        ? "Upcoming"
                        : "Completed"}
                  </span>
                </div>

                <div className="timeline-card-details">
                  <div className="timeline-dates">
                    <span className="start-date">
                      {formatDateShort(trip.startDate)}
                    </span>
                    <span className="date-separator">→</span>
                    <span className="end-date">
                      {formatDateShort(trip.endDate)}
                    </span>
                  </div>

                  <div className="timeline-meta">
                    <span className="duration">
                      {duration} day{duration !== 1 ? "s" : ""}
                    </span>
                    {trip.continent && (
                      <span className="continent">{trip.continent}</span>
                    )}
                    {tripActivities.length > 0 && (
                      <span className="activity-count">
                        {tripActivities.length} activities
                      </span>
                    )}
                  </div>
                </div>

                {selectedTrip?._id === trip._id &&
                  tripActivities.length > 0 && (
                    <div className="timeline-activities">
                      <h5>Activities:</h5>
                      <ul>
                        {tripActivities.slice(0, 3).map((activity) => (
                          <li key={activity._id}>{activity.name}</li>
                        ))}
                        {tripActivities.length > 3 && (
                          <li className="more-activities">
                            +{tripActivities.length - 3} more activities
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Calendar View Component
function CalendarView({
  trips,
  activitiesByTrip,
  onTripSelect,
  getTripStatus,
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthTrips = useMemo(() => {
    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    return trips.filter((trip) => {
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);
      return tripStart <= monthEnd && tripEnd >= monthStart;
    });
  }, [trips, currentMonth]);

  function navigateMonth(direction) {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  }

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="calendar-view">
      <div className="calendar-nav">
        <button onClick={() => navigateMonth(-1)}>‹ Previous</button>
        <h3>{monthName}</h3>
        <button onClick={() => navigateMonth(1)}>Next ›</button>
      </div>

      <div className="calendar-trips">
        {monthTrips.length === 0 ? (
          <p className="no-trips-month">No trips in {monthName}</p>
        ) : (
          monthTrips.map((trip) => {
            const status = getTripStatus(trip);
            const tripActivities = activitiesByTrip[trip._id] || [];

            return (
              <div
                key={trip._id}
                className={`calendar-trip ${status}`}
                onClick={() => onTripSelect?.(trip)}
              >
                <div className="calendar-trip-header">
                  <h4>{trip.destination}</h4>
                  <span className={`trip-status-badge ${status}`}>
                    {status === "in-progress"
                      ? "Current"
                      : status === "upcoming"
                        ? "Upcoming"
                        : "Completed"}
                  </span>
                </div>

                <div className="calendar-trip-dates">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </div>

                <div className="calendar-trip-meta">
                  <span>
                    {getDaysBetween(trip.startDate, trip.endDate)} days
                  </span>
                  {trip.continent && <span>• {trip.continent}</span>}
                  {tripActivities.length > 0 && (
                    <span>• {tripActivities.length} activities</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

TripTimeline.propTypes = {
  trips: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      destination: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      continent: PropTypes.string,
      country: PropTypes.string,
      seeded: PropTypes.bool,
    })
  ).isRequired,
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      tripId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  onTripSelect: PropTypes.func,
};

TimelineView.propTypes = {
  trips: PropTypes.array.isRequired,
  activitiesByTrip: PropTypes.object.isRequired,
  onTripSelect: PropTypes.func,
  getTripStatus: PropTypes.func.isRequired,
  getTripPosition: PropTypes.func.isRequired,
  totalTimelineDays: PropTypes.number.isRequired,
};

CalendarView.propTypes = {
  trips: PropTypes.array.isRequired,
  activitiesByTrip: PropTypes.object.isRequired,
  onTripSelect: PropTypes.func,
  getTripStatus: PropTypes.func.isRequired,
};

export default TripTimeline;

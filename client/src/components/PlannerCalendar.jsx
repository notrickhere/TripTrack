import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";

import "./PlannerCalendar.css";

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLongDate(dateKey) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthLabel(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function buildCalendarDays(monthDate) {
  const monthStart = getMonthStart(monthDate);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(monthStart.getDate() - monthStart.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(calendarStart);
    day.setDate(calendarStart.getDate() + index);
    return day;
  });
}

function isDateWithinRange(dateKey, startDate, endDate) {
  return dateKey >= startDate && dateKey <= endDate;
}

function toTitleCase(value = "") {
  return value.replace(/\w\S*/g, (word) => {
    const normalizedWord = word.toLowerCase();
    return normalizedWord.charAt(0).toUpperCase() + normalizedWord.slice(1);
  });
}

function sortDateKeys(firstDateKey, secondDateKey) {
  return firstDateKey <= secondDateKey
    ? [firstDateKey, secondDateKey]
    : [secondDateKey, firstDateKey];
}

function PlannerCalendar({
  activitiesByTripId,
  onDateRangeSelect,
  onTripSelect,
  trips,
}) {
  const todayKey = formatDateKey(new Date());
  const [currentMonth, setCurrentMonth] = useState(getMonthStart(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [dragStartDateKey, setDragStartDateKey] = useState("");
  const [dragEndDateKey, setDragEndDateKey] = useState("");
  const [didDragRange, setDidDragRange] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth),
    [currentMonth],
  );

  const activities = useMemo(
    () => Object.values(activitiesByTripId).flat(),
    [activitiesByTripId],
  );

  const activityCountsByDate = useMemo(
    () =>
      activities.reduce((counts, activity) => {
        counts[activity.date] = (counts[activity.date] || 0) + 1;
        return counts;
      }, {}),
    [activities],
  );

  const selectedDayTrips = useMemo(
    () =>
      trips.filter((trip) =>
        isDateWithinRange(selectedDateKey, trip.startDate, trip.endDate),
      ),
    [selectedDateKey, trips],
  );

  const selectedDayActivities = useMemo(
    () =>
      activities
        .filter((activity) => activity.date === selectedDateKey)
        .sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    [activities, selectedDateKey],
  );

  const [rangeStartDateKey, rangeEndDateKey] =
    dragStartDateKey && dragEndDateKey
      ? sortDateKeys(dragStartDateKey, dragEndDateKey)
      : [selectedDateKey, selectedDateKey];

  useEffect(() => {
    function handleMouseUp() {
      if (!isDragging || !dragStartDateKey || !dragEndDateKey) {
        return;
      }

      const [startDateKey, endDateKey] = sortDateKeys(
        dragStartDateKey,
        dragEndDateKey,
      );
      setIsDragging(false);
      setSelectedDateKey(startDateKey);
      setDragStartDateKey("");
      setDragEndDateKey("");

      if (didDragRange && startDateKey !== endDateKey) {
        onDateRangeSelect?.(startDateKey, endDateKey);
      }

      setDidDragRange(false);
    }

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [
    didDragRange,
    dragEndDateKey,
    dragStartDateKey,
    isDragging,
    onDateRangeSelect,
  ]);

  function handleDayMouseDown(dateKey) {
    setDragStartDateKey(dateKey);
    setDragEndDateKey(dateKey);
    setDidDragRange(false);
    setIsDragging(true);
    setSelectedDateKey(dateKey);
  }

  function handleDayMouseEnter(dateKey) {
    if (!isDragging) {
      return;
    }

    setDragEndDateKey(dateKey);
    if (dateKey !== dragStartDateKey) {
      setDidDragRange(true);
    }
  }

  function handleDayMouseUp(dateKey) {
    setIsDragging(false);
    setSelectedDateKey(dateKey);
  }

  function handleDayDoubleClick(dateKey) {
    setSelectedDateKey(dateKey);
    setDragStartDateKey("");
    setDragEndDateKey("");
    setDidDragRange(false);
    setIsDragging(false);
    onDateRangeSelect?.(dateKey, dateKey);
  }

  return (
    <section className="planner-calendar">
      <div className="calendar-header">
        <div>
          <h2>Planner Calendar</h2>
          <p>See trip spans and daily activities on a month-by-month schedule.</p>
        </div>
        <div className="calendar-controls">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                  1,
                ),
              )
            }
            type="button"
          >
            Previous
          </button>
          <strong>{formatMonthLabel(currentMonth)}</strong>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                  1,
                ),
              )
            }
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      <div className="calendar-grid-header">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      {!trips.length ? (
        <div className="calendar-empty">
          <h3>No trips planned yet</h3>
          <p>Select a single date or drag across dates to prefill a new trip.</p>
        </div>
      ) : null}

      <div className="calendar-grid">
        {calendarDays.map((day) => {
          const dateKey = formatDateKey(day);
          const matchingTrips = trips.filter((trip) =>
            isDateWithinRange(dateKey, trip.startDate, trip.endDate),
          );
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDateKey;
          const isInSelectedRange = isDateWithinRange(
            dateKey,
            rangeStartDateKey,
            rangeEndDateKey,
          );

          return (
            <button
              className={[
                "calendar-day",
                isCurrentMonth ? "current-month" : "outside-month",
                isInSelectedRange ? "in-selected-range" : "",
                isToday ? "today" : "",
                isSelected ? "selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={dateKey}
              onDoubleClick={() => handleDayDoubleClick(dateKey)}
              onMouseDown={() => handleDayMouseDown(dateKey)}
              onMouseEnter={() => handleDayMouseEnter(dateKey)}
              onMouseUp={() => handleDayMouseUp(dateKey)}
              type="button"
            >
              <div className="calendar-day-top">
                <span className="calendar-day-number">{day.getDate()}</span>
                {activityCountsByDate[dateKey] ? (
                  <span className="calendar-activity-count">
                    {activityCountsByDate[dateKey]} act
                  </span>
                ) : null}
              </div>

              <div className="calendar-day-content">
                {matchingTrips.slice(0, 2).map((trip) => (
                  <span className="calendar-trip-pill" key={`${dateKey}-${trip._id}`}>
                    {toTitleCase(trip.destination)}
                  </span>
                ))}
                {matchingTrips.length > 2 ? (
                  <span className="calendar-more-pill">
                    +{matchingTrips.length - 2} more
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="calendar-detail-panel">
        <div className="calendar-detail-header">
          <h3>{formatLongDate(selectedDateKey)}</h3>
          {selectedDateKey === todayKey ? <span>Today</span> : null}
        </div>

        <div className="calendar-detail-sections">
          <section className="calendar-detail-card">
            <h4>Trips on this date</h4>
            {selectedDayTrips.length ? (
              <ul className="calendar-detail-list">
                {selectedDayTrips.map((trip) => (
                  <li key={trip._id}>
                    <button onClick={() => onTripSelect?.(trip)} type="button">
                      <strong>{trip.destination}</strong>
                      <span>
                        {trip.startDate} to {trip.endDate}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No trips scheduled for this date.</p>
            )}
          </section>

          <section className="calendar-detail-card">
            <h4>Activities on this date</h4>
            {selectedDayActivities.length ? (
              <ul className="calendar-detail-list">
                {selectedDayActivities.map((activity) => (
                  <li key={activity._id}>
                    <strong>{toTitleCase(activity.name)}</strong>
                    <span>{activity.time || "Any time"}</span>
                    {activity.description ? <p>{activity.description}</p> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No activities planned for this date.</p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

PlannerCalendar.propTypes = {
  activitiesByTripId: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        description: PropTypes.string,
        name: PropTypes.string.isRequired,
        time: PropTypes.string,
      }),
    ),
  ).isRequired,
  onDateRangeSelect: PropTypes.func,
  onTripSelect: PropTypes.func,
  trips: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      destination: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default PlannerCalendar;

import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatDisplayDate, formatDisplayDateRange } from "../lib/date.js";
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

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

function addDaysToDateKey(dateKey, numberOfDays) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + numberOfDays);
  return formatDateKey(date);
}

function addMonthsToDateKey(dateKey, numberOfMonths) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setMonth(date.getMonth() + numberOfMonths);
  return formatDateKey(date);
}

function PlannerCalendar({
  activitiesByTripId,
  onDateRangeSelect,
  onTripSelect,
  trips,
}) {
  const todayKey = formatDateKey(new Date());
  const dayButtonRefs = useRef({});
  const [currentMonth, setCurrentMonth] = useState(getMonthStart(new Date()));
  const [focusedDateKey, setFocusedDateKey] = useState(todayKey);
  const [keyboardRangeAnchorDateKey, setKeyboardRangeAnchorDateKey] =
    useState(todayKey);
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [dragStartDateKey, setDragStartDateKey] = useState("");
  const [dragEndDateKey, setDragEndDateKey] = useState("");
  const [didDragRange, setDidDragRange] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth),
    [currentMonth],
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const tripYears = trips.flatMap((trip) => [
      new Date(`${trip.startDate}T00:00:00`).getFullYear(),
      new Date(`${trip.endDate}T00:00:00`).getFullYear(),
    ]);
    const minYear = Math.min(currentYear - 15, ...tripYears);
    const maxYear = Math.max(currentYear + 15, ...tripYears);

    return Array.from(
      { length: maxYear - minYear + 1 },
      (_, index) => minYear + index,
    );
  }, [trips]);

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
    setCurrentMonth(getMonthStart(new Date(`${focusedDateKey}T00:00:00`)));
  }, [focusedDateKey]);

  useEffect(() => {
    const nextFocusedButton = dayButtonRefs.current[focusedDateKey];
    nextFocusedButton?.focus();
  }, [calendarDays, focusedDateKey]);

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
    setFocusedDateKey(dateKey);
    setKeyboardRangeAnchorDateKey(dateKey);
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
    setFocusedDateKey(dateKey);
    setSelectedDateKey(dateKey);
  }

  function handleDayDoubleClick(dateKey) {
    setFocusedDateKey(dateKey);
    setKeyboardRangeAnchorDateKey(dateKey);
    setSelectedDateKey(dateKey);
    setDragStartDateKey("");
    setDragEndDateKey("");
    setDidDragRange(false);
    setIsDragging(false);
    onDateRangeSelect?.(dateKey, dateKey);
  }

  function handleMonthChange(event) {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      Number(event.target.value),
      1,
    );
    const nextDateKey = formatDateKey(nextMonth);
    setCurrentMonth(nextMonth);
    setFocusedDateKey(nextDateKey);
    setKeyboardRangeAnchorDateKey(nextDateKey);
    setSelectedDateKey(nextDateKey);
  }

  function handleYearChange(event) {
    const nextMonth = new Date(
      Number(event.target.value),
      currentMonth.getMonth(),
      1,
    );
    const nextDateKey = formatDateKey(nextMonth);
    setCurrentMonth(nextMonth);
    setFocusedDateKey(nextDateKey);
    setKeyboardRangeAnchorDateKey(nextDateKey);
    setSelectedDateKey(nextDateKey);
  }

  function jumpToToday() {
    const today = new Date();
    setCurrentMonth(getMonthStart(today));
    setFocusedDateKey(todayKey);
    setKeyboardRangeAnchorDateKey(todayKey);
    setSelectedDateKey(todayKey);
  }

  function updateKeyboardRange(anchorDateKey, targetDateKey) {
    setKeyboardRangeAnchorDateKey(anchorDateKey);
    setSelectedDateKey(targetDateKey);
    setDragStartDateKey(anchorDateKey);
    setDragEndDateKey(targetDateKey);
    setDidDragRange(anchorDateKey !== targetDateKey);
    setIsDragging(false);
  }

  function commitKeyboardRange(dateKey) {
    const [startDateKey, endDateKey] = sortDateKeys(
      keyboardRangeAnchorDateKey || dateKey,
      dateKey,
    );

    setFocusedDateKey(dateKey);
    setSelectedDateKey(startDateKey);
    setDragStartDateKey("");
    setDragEndDateKey("");
    setDidDragRange(false);
    setIsDragging(false);
    onDateRangeSelect?.(startDateKey, endDateKey);
  }

  function handleDayKeyDown(dateKey, event) {
    const keyToDayOffset = {
      ArrowDown: 7,
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
    };

    if (event.key in keyToDayOffset) {
      event.preventDefault();
      const nextDateKey = addDaysToDateKey(dateKey, keyToDayOffset[event.key]);
      setFocusedDateKey(nextDateKey);

      if (event.shiftKey) {
        updateKeyboardRange(keyboardRangeAnchorDateKey || dateKey, nextDateKey);
      } else {
        setKeyboardRangeAnchorDateKey(nextDateKey);
        setSelectedDateKey(nextDateKey);
        setDragStartDateKey("");
        setDragEndDateKey("");
        setDidDragRange(false);
        setIsDragging(false);
      }

      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const currentDate = new Date(`${dateKey}T00:00:00`);
      const dayOffset =
        event.key === "Home"
          ? -currentDate.getDay()
          : 6 - currentDate.getDay();
      const nextDateKey = addDaysToDateKey(dateKey, dayOffset);
      setFocusedDateKey(nextDateKey);

      if (event.shiftKey) {
        updateKeyboardRange(keyboardRangeAnchorDateKey || dateKey, nextDateKey);
      } else {
        setKeyboardRangeAnchorDateKey(nextDateKey);
        setSelectedDateKey(nextDateKey);
        setDragStartDateKey("");
        setDragEndDateKey("");
        setDidDragRange(false);
        setIsDragging(false);
      }

      return;
    }

    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const nextDateKey = addMonthsToDateKey(
        dateKey,
        event.key === "PageUp" ? -1 : 1,
      );
      setFocusedDateKey(nextDateKey);

      if (event.shiftKey) {
        updateKeyboardRange(keyboardRangeAnchorDateKey || dateKey, nextDateKey);
      } else {
        setKeyboardRangeAnchorDateKey(nextDateKey);
        setSelectedDateKey(nextDateKey);
        setDragStartDateKey("");
        setDragEndDateKey("");
        setDidDragRange(false);
        setIsDragging(false);
      }

      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();

      if (event.shiftKey) {
        commitKeyboardRange(dateKey);
        return;
      }

      setFocusedDateKey(dateKey);
      setKeyboardRangeAnchorDateKey(dateKey);
      setSelectedDateKey(dateKey);
      setDragStartDateKey("");
      setDragEndDateKey("");
      setDidDragRange(false);
      setIsDragging(false);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setKeyboardRangeAnchorDateKey(dateKey);
      setSelectedDateKey(dateKey);
      setDragStartDateKey("");
      setDragEndDateKey("");
      setDidDragRange(false);
      setIsDragging(false);
    }
  }

  return (
    <section className="planner-calendar">
      <div className="calendar-header">
        <div>
          <div className="calendar-title-row">
            <h2>Planner Calendar</h2>
            <div className="calendar-info-wrap">
              <button
                aria-label="Calendar usage information"
                className="calendar-info-button"
                type="button"
              >
                i
              </button>
              <div className="calendar-info-tooltip">
                Single click a date to preview it below. Double click one date
                or drag across multiple dates to open the planner with those
                dates selected. With a keyboard, use arrow keys to move,
                Shift+Arrow keys to build a range, and Shift+Enter to open the
                planner for that range.
              </div>
            </div>
          </div>
          <p>
            See trip spans and daily activities on a month-by-month schedule.
          </p>
        </div>
        <div className="calendar-controls">
          <label className="calendar-select-group">
            <span>Month</span>
            <select
              onChange={handleMonthChange}
              value={currentMonth.getMonth()}
            >
              {MONTH_OPTIONS.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </label>
          <label className="calendar-select-group">
            <span>Year</span>
            <select
              onChange={handleYearChange}
              value={currentMonth.getFullYear()}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <button onClick={jumpToToday} type="button">
            Today
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
          <p>
            Select a single date or drag across dates to prefill a new trip.
          </p>
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
              aria-pressed={isSelected}
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
              onFocus={() => setFocusedDateKey(dateKey)}
              onKeyDown={(event) => handleDayKeyDown(dateKey, event)}
              onMouseDown={() => handleDayMouseDown(dateKey)}
              onMouseEnter={() => handleDayMouseEnter(dateKey)}
              onMouseUp={() => handleDayMouseUp(dateKey)}
              ref={(element) => {
                if (element) {
                  dayButtonRefs.current[dateKey] = element;
                } else {
                  delete dayButtonRefs.current[dateKey];
                }
              }}
              tabIndex={dateKey === focusedDateKey ? 0 : -1}
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
                  <span
                    className="calendar-trip-pill"
                    key={`${dateKey}-${trip._id}`}
                  >
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
          <h3>{formatDisplayDate(selectedDateKey)}</h3>
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
                        {formatDisplayDateRange(trip.startDate, trip.endDate)}
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
                    {activity.description ? (
                      <p>{activity.description}</p>
                    ) : null}
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

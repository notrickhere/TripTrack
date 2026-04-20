import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import "./TripStatistics.css";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end days
}

function getMonthFromDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", { month: "long" });
}

function TripStatistics({ trips, activities }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [selectedView, setSelectedView] = useState("overview");

  // Filter trips based on selected timeframe
  const filteredTrips = useMemo(() => {
    if (selectedTimeframe === "all") return trips;

    const now = new Date();
    const filterDate = new Date();

    switch (selectedTimeframe) {
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case "6months":
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case "3months":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return trips;
    }

    return trips.filter((trip) => new Date(trip.startDate) >= filterDate);
  }, [trips, selectedTimeframe]);

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    const plannerTrips = filteredTrips.filter((trip) => !trip.seeded);
    const inspirationTrips = filteredTrips.filter((trip) => trip.seeded);
    const tripActivities = activities.filter((activity) =>
      filteredTrips.some((trip) => trip._id === activity.tripId),
    );

    // Basic metrics
    const totalTrips = plannerTrips.length;
    const totalDays = plannerTrips.reduce(
      (sum, trip) => sum + getDaysBetween(trip.startDate, trip.endDate),
      0,
    );
    const avgTripLength =
      totalTrips > 0 ? Math.round(totalDays / totalTrips) : 0;
    const totalActivities = tripActivities.length;
    const avgActivitiesPerTrip =
      totalTrips > 0 ? Math.round(totalActivities / totalTrips) : 0;

    // Geographic analysis
    const continentCounts = plannerTrips.reduce((acc, trip) => {
      if (trip.continent) {
        acc[trip.continent] = (acc[trip.continent] || 0) + 1;
      }
      return acc;
    }, {});

    const countryCounts = plannerTrips.reduce((acc, trip) => {
      if (trip.country) {
        acc[trip.country] = (acc[trip.country] || 0) + 1;
      }
      return acc;
    }, {});

    // Time analysis
    const monthlyTrips = plannerTrips.reduce((acc, trip) => {
      const month = getMonthFromDate(trip.startDate);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Trip duration analysis
    const durationCategories = plannerTrips.reduce(
      (acc, trip) => {
        const days = getDaysBetween(trip.startDate, trip.endDate);
        if (days <= 3) acc.short += 1;
        else if (days <= 7) acc.medium += 1;
        else acc.long += 1;
        return acc;
      },
      { short: 0, medium: 0, long: 0 },
    );

    // Upcoming trips
    const now = new Date();
    const upcomingTrips = plannerTrips
      .filter((trip) => new Date(trip.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Recent activity
    const recentTrips = plannerTrips
      .filter((trip) => new Date(trip.endDate) <= now)
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
      .slice(0, 3);

    return {
      basic: {
        totalTrips,
        totalDays,
        avgTripLength,
        totalActivities,
        avgActivitiesPerTrip,
        inspirationTripsUsed: inspirationTrips.length,
      },
      geographic: {
        continentCounts,
        countryCounts,
        uniqueContinents: Object.keys(continentCounts).length,
        uniqueCountries: Object.keys(countryCounts).length,
        mostVisitedContinent:
          Object.keys(continentCounts).sort(
            (a, b) => continentCounts[b] - continentCounts[a],
          )[0] || "None",
        mostVisitedCountry:
          Object.keys(countryCounts).sort(
            (a, b) => countryCounts[b] - countryCounts[a],
          )[0] || "None",
      },
      temporal: {
        monthlyTrips,
        favoriteMonth:
          Object.keys(monthlyTrips).sort(
            (a, b) => monthlyTrips[b] - monthlyTrips[a],
          )[0] || "None",
        durationCategories,
        upcomingTrips: upcomingTrips.slice(0, 3),
        recentTrips,
      },
    };
  }, [filteredTrips, activities]);

  return (
    <div className="trip-statistics">
      <div className="statistics-header">
        <h2>Trip Statistics Dashboard</h2>
        <div className="statistics-controls">
          <div className="timeframe-selector">
            <label htmlFor="timeframe">Timeframe:</label>
            <select
              id="timeframe"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="year">Last Year</option>
              <option value="6months">Last 6 Months</option>
              <option value="3months">Last 3 Months</option>
            </select>
          </div>
          <div className="view-selector">
            <button
              className={selectedView === "overview" ? "active" : ""}
              onClick={() => setSelectedView("overview")}
            >
              Overview
            </button>
            <button
              className={selectedView === "detailed" ? "active" : ""}
              onClick={() => setSelectedView("detailed")}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {selectedView === "overview" ? (
        <OverviewStats statistics={statistics} />
      ) : (
        <DetailedStats statistics={statistics} />
      )}
    </div>
  );
}

// Overview Statistics Component
function OverviewStats({ statistics }) {
  return (
    <div className="overview-stats">
      {/* Key Metrics Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-number">{statistics.basic.totalTrips}</div>
          <div className="stat-label">Total Trips</div>
        </div>
        <div className="stat-card secondary">
          <div className="stat-number">{statistics.basic.totalDays}</div>
          <div className="stat-label">Days Traveled</div>
        </div>
        <div className="stat-card tertiary">
          <div className="stat-number">{statistics.basic.avgTripLength}</div>
          <div className="stat-label">Avg Trip Length</div>
        </div>
        <div className="stat-card quaternary">
          <div className="stat-number">{statistics.basic.totalActivities}</div>
          <div className="stat-label">Total Activities</div>
        </div>
      </div>

      {/* Geographic Summary */}
      <div className="geographic-summary">
        <h3>Travel Footprint</h3>
        <div className="geographic-stats">
          <div className="geo-stat">
            <strong>{statistics.geographic.uniqueContinents}</strong> Continents
          </div>
          <div className="geo-stat">
            <strong>{statistics.geographic.uniqueCountries}</strong> Countries
          </div>
          <div className="geo-stat">
            Favorite:{" "}
            <strong>{statistics.geographic.mostVisitedContinent}</strong>
          </div>
        </div>
      </div>

      {/* Upcoming Trips */}
      {statistics.temporal.upcomingTrips.length > 0 && (
        <div className="upcoming-section">
          <h3>Upcoming Adventures</h3>
          <div className="upcoming-trips">
            {statistics.temporal.upcomingTrips.map((trip) => (
              <div key={trip._id} className="upcoming-trip">
                <div className="trip-destination">{trip.destination}</div>
                <div className="trip-date">{formatDate(trip.startDate)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Detailed Statistics Component
function DetailedStats({ statistics }) {
  return (
    <div className="detailed-stats">
      {/* Detailed Metrics */}
      <div className="detailed-section">
        <h3>Detailed Breakdown</h3>
        <div className="detailed-grid">
          <div className="detail-group">
            <h4>Trip Planning</h4>
            <div className="detail-item">
              <span>Average activities per trip</span>
              <strong>{statistics.basic.avgActivitiesPerTrip}</strong>
            </div>
            <div className="detail-item">
              <span>Inspiration trips referenced</span>
              <strong>{statistics.basic.inspirationTripsUsed}</strong>
            </div>
          </div>

          <div className="detail-group">
            <h4>Trip Duration</h4>
            <div className="detail-item">
              <span>Short trips (1-3 days)</span>
              <strong>{statistics.temporal.durationCategories.short}</strong>
            </div>
            <div className="detail-item">
              <span>Medium trips (4-7 days)</span>
              <strong>{statistics.temporal.durationCategories.medium}</strong>
            </div>
            <div className="detail-item">
              <span>Long trips (8+ days)</span>
              <strong>{statistics.temporal.durationCategories.long}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Details */}
      <div className="detailed-section">
        <h3>Geographic Distribution</h3>
        <div className="geographic-details">
          <div className="continent-breakdown">
            <h4>By Continent</h4>
            {Object.entries(statistics.geographic.continentCounts).map(
              ([continent, count]) => (
                <div key={continent} className="breakdown-item">
                  <span className="location-name">{continent}</span>
                  <div className="count-bar">
                    <div
                      className="count-fill"
                      style={{
                        width: `${(count / Math.max(...Object.values(statistics.geographic.continentCounts))) * 100}%`,
                      }}
                    ></div>
                    <span className="count-number">{count}</span>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="country-breakdown">
            <h4>Top Countries</h4>
            {Object.entries(statistics.geographic.countryCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([country, count]) => (
                <div key={country} className="breakdown-item">
                  <span className="location-name">{country}</span>
                  <div className="count-bar">
                    <div
                      className="count-fill"
                      style={{
                        width: `${(count / Math.max(...Object.values(statistics.geographic.countryCounts))) * 100}%`,
                      }}
                    ></div>
                    <span className="count-number">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Monthly Distribution */}
      <div className="detailed-section">
        <h3>Travel Patterns</h3>
        <div className="monthly-breakdown">
          <h4>Trips by Month</h4>
          <div className="month-grid">
            {[
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
            ].map((month) => (
              <div key={month} className="month-stat">
                <div className="month-name">{month.slice(0, 3)}</div>
                <div className="month-count">
                  {statistics.temporal.monthlyTrips[month] || 0}
                </div>
              </div>
            ))}
          </div>
          <p className="favorite-month">
            Your favorite travel month:{" "}
            <strong>{statistics.temporal.favoriteMonth}</strong>
          </p>
        </div>
      </div>

      {/* Recent Trips */}
      {statistics.temporal.recentTrips.length > 0 && (
        <div className="detailed-section">
          <h3>Recent Adventures</h3>
          <div className="recent-trips">
            {statistics.temporal.recentTrips.map((trip) => (
              <div key={trip._id} className="recent-trip">
                <div className="recent-trip-header">
                  <strong>{trip.destination}</strong>
                  <span>{formatDate(trip.endDate)}</span>
                </div>
                <div className="recent-trip-details">
                  {getDaysBetween(trip.startDate, trip.endDate)} days •{" "}
                  {trip.continent}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

TripStatistics.propTypes = {
  trips: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      destination: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      continent: PropTypes.string,
      country: PropTypes.string,
      seeded: PropTypes.bool,
    }),
  ).isRequired,
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      tripId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

OverviewStats.propTypes = {
  statistics: PropTypes.object.isRequired,
};

DetailedStats.propTypes = {
  statistics: PropTypes.object.isRequired,
};

export default TripStatistics;

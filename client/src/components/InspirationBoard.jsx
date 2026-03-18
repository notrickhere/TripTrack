import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import { getActivities } from "../lib/api.js";
import "./InspirationBoard.css";

const CONTINENT_LABELS = [
  "All",
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
];

const AFRICA_CODES = new Set([
  "AO", "BF", "BI", "BJ", "BW", "CD", "CF", "CG", "CI", "CM", "CV", "DJ", "DZ",
  "EG", "EH", "ER", "ET", "GA", "GH", "GM", "GN", "GQ", "GW", "KE", "KM", "LR",
  "LS", "LY", "MA", "MG", "ML", "MR", "MU", "MW", "MZ", "NA", "NE", "NG", "RE",
  "RW", "SC", "SD", "SL", "SN", "SO", "SS", "ST", "SZ", "TD", "TG", "TN", "TZ",
  "UG", "YT", "ZA", "ZM", "ZW",
]);

const ASIA_CODES = new Set([
  "AE", "AF", "AM", "AZ", "BD", "BH", "BN", "BT", "CN", "CY", "GE", "HK", "ID",
  "IL", "IN", "IQ", "IR", "JO", "JP", "KG", "KH", "KP", "KR", "KW", "KZ", "LA",
  "LB", "LK", "MM", "MN", "MO", "MV", "MY", "NP", "OM", "PH", "PK", "PS", "QA",
  "SA", "SG", "SY", "TH", "TJ", "TL", "TM", "TR", "TW", "UZ", "VN", "YE",
]);

const EUROPE_CODES = new Set([
  "AD", "AL", "AT", "BA", "BE", "BG", "BY", "CH", "CZ", "DE", "DK", "EE", "ES",
  "FI", "FO", "FR", "GB", "GG", "GI", "GR", "HR", "HU", "IE", "IM", "IS", "IT",
  "JE", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT", "NL", "NO", "PL",
  "PT", "RO", "RS", "RU", "SE", "SI", "SK", "SM", "UA", "VA",
]);

const NORTH_AMERICA_CODES = new Set([
  "AG", "AI", "AW", "BB", "BL", "BM", "BQ", "BS", "BZ", "CA", "CR", "CU", "CW",
  "DM", "DO", "GD", "GL", "GP", "GT", "HN", "HT", "JM", "KN", "KY", "LC", "MF",
  "MQ", "MS", "MX", "NI", "PA", "PM", "PR", "SV", "SX", "TC", "TT", "US", "VC",
  "VG", "VI",
]);

const SOUTH_AMERICA_CODES = new Set([
  "AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PE", "PY", "SR", "UY", "VE",
]);

const OCEANIA_CODES = new Set([
  "AS", "AU", "CK", "FJ", "FM", "GU", "KI", "MH", "MP", "NC", "NF", "NR", "NU",
  "NZ", "PF", "PG", "PN", "PW", "SB", "TK", "TO", "TV", "UM", "VU", "WF", "WS",
]);

function toTitleCase(value = "") {
  return value.replace(/\w\S*/g, (word) => {
    const normalizedWord = word.toLowerCase();
    return normalizedWord.charAt(0).toUpperCase() + normalizedWord.slice(1);
  });
}

function buildLocationLabel(trip) {
  const parts = [trip.city, trip.country].filter(Boolean);
  return parts.join(", ");
}

function getMoodLabel(trip) {
  return toTitleCase(trip.notes || trip.note || "Fresh idea");
}

function getContinentLabel(trip) {
  const countryCode = trip.countryCode?.toUpperCase();

  if (AFRICA_CODES.has(countryCode)) {
    return "Africa";
  }

  if (ASIA_CODES.has(countryCode)) {
    return "Asia";
  }

  if (EUROPE_CODES.has(countryCode)) {
    return "Europe";
  }

  if (NORTH_AMERICA_CODES.has(countryCode)) {
    return "North America";
  }

  if (SOUTH_AMERICA_CODES.has(countryCode)) {
    return "South America";
  }

  if (OCEANIA_CODES.has(countryCode)) {
    return "Oceania";
  }

  return "Other";
}

function InspirationBoard({ isCopyingTripId, onCopyTripToPlanner, trips }) {
  const [activeContinent, setActiveContinent] = useState("All");
  const [activitiesByTripId, setActivitiesByTripId] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  if (trips.length === 0) {
    return (
      <section className="inspiration-board">
        <div className="inspiration-empty">
          <h2>No inspiration yet</h2>
          <p>Add trips or import seeded data to populate this board.</p>
        </div>
      </section>
    );
  }

  const filteredTrips =
    activeContinent === "All"
      ? trips
      : trips.filter((trip) => getContinentLabel(trip) === activeContinent);

  const searchedTrips = filteredTrips.filter((trip) => {
    const haystack = [
      trip.destination,
      trip.city,
      trip.country,
      trip.countryCode,
      trip.timezone,
      trip.notes,
      trip.note,
      getContinentLabel(trip),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(searchTerm.trim().toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(searchedTrips.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageWindowSize = 10;
  const pageWindowStart =
    Math.floor((safeCurrentPage - 1) / pageWindowSize) * pageWindowSize + 1;
  const pageWindowEnd = Math.min(totalPages, pageWindowStart + pageWindowSize - 1);
  const visiblePageNumbers = Array.from(
    { length: pageWindowEnd - pageWindowStart + 1 },
    (_, index) => pageWindowStart + index
  );
  const featuredTrips = searchedTrips.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  useEffect(() => {
    async function loadVisibleTripActivities() {
      try {
        const activityEntries = await Promise.all(
          featuredTrips.map(async (trip) => [trip._id, await getActivities(trip._id)])
        );

        setActivitiesByTripId(Object.fromEntries(activityEntries));
      } catch (_error) {
        setActivitiesByTripId({});
      }
    }

    if (featuredTrips.length === 0) {
      setActivitiesByTripId({});
      return;
    }

    loadVisibleTripActivities();
  }, [featuredTrips]);

  return (
    <section className="inspiration-board">
      <div className="inspiration-header">
        <div>
          <h2>Destination ideas!</h2>
        </div>
      </div>

      <div className="continent-filter">
        {CONTINENT_LABELS.map((continent) => (
          <button
            className={activeContinent === continent ? "active-continent" : ""}
            key={continent}
            onClick={() => {
              setActiveContinent(continent);
              setCurrentPage(1);
            }}
            type="button"
          >
            {continent}
          </button>
        ))}
      </div>

      <label className="inspiration-search">
        <span>Search Destinations</span>
        <input
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by destination, city, country, mood, or timezone"
          type="search"
          value={searchTerm}
        />
      </label>

      {featuredTrips.length === 0 ? (
        <div className="inspiration-empty">
          <h2>No trips for this filter</h2>
          <p>Try a different continent or import more seeded data.</p>
        </div>
      ) : null}

      <div className="inspiration-grid">
        {featuredTrips.map((trip) => (
          <article className="inspiration-card" key={trip._id}>
            <div className="inspiration-card-top">
              <span className="mood-pill">{getMoodLabel(trip)}</span>
              {trip.timezone ? <span className="timezone-pill">{trip.timezone}</span> : null}
            </div>

            <h3>{trip.destination}</h3>

            {buildLocationLabel(trip) ? (
              <p className="location-line">{buildLocationLabel(trip)}</p>
            ) : null}

            <p className="continent-line">{getContinentLabel(trip)}</p>

            <dl className="trip-meta">
              <div>
                <dt>Dates</dt>
                <dd>
                  {trip.startDate} to {trip.endDate}
                </dd>
              </div>
            </dl>

            <div className="card-itinerary-preview">
              <p className="itinerary-heading">Sample Activities</p>
              {activitiesByTripId[trip._id]?.length ? (
                <ul>
                  {activitiesByTripId[trip._id].slice(0, 3).map((activity) => (
                    <li key={activity._id}>{toTitleCase(activity.name)}</li>
                  ))}
                </ul>
              ) : (
                <p className="itinerary-empty">No activities linked to this trip yet.</p>
              )}
            </div>

            <button
              className="copy-trip-button"
              disabled={isCopyingTripId === trip._id}
              onClick={() => onCopyTripToPlanner(trip)}
              type="button"
            >
              {isCopyingTripId === trip._id ? "Copying..." : "Copy Itinerary to Planner"}
            </button>
          </article>
        ))}
      </div>

      <div className="pagination-bar">
        <button
          disabled={safeCurrentPage === 1}
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          type="button"
        >
          Previous
        </button>
        <div className="page-number-list">
          {visiblePageNumbers.map((pageNumber) => (
            <button
              className={safeCurrentPage === pageNumber ? "active-page-number" : ""}
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              type="button"
            >
              {pageNumber}
            </button>
          ))}
        </div>
        <button
          disabled={safeCurrentPage === totalPages}
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          type="button"
        >
          Next
        </button>
      </div>
    </section>
  );
}

InspirationBoard.propTypes = {
  isCopyingTripId: PropTypes.string,
  onCopyTripToPlanner: PropTypes.func.isRequired,
  trips: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      city: PropTypes.string,
      country: PropTypes.string,
      countryCode: PropTypes.string,
      destination: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      note: PropTypes.string,
      notes: PropTypes.string,
      startDate: PropTypes.string.isRequired,
      timezone: PropTypes.string,
    })
  ).isRequired,
};

InspirationBoard.defaultProps = {
  isCopyingTripId: "",
};

export default InspirationBoard;

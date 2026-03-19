import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import "./TripForm.css";

const CONTINENT_OPTIONS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
];

const initialFormState = {
  city: "",
  continent: "",
  country: "",
  destination: "",
  startDate: "",
  endDate: "",
  notes: "",
};

function TripForm({ editingTrip, suggestedStartDate, onCancelEdit, onSubmit }) {
  const [formValues, setFormValues] = useState(initialFormState);

  useEffect(() => {
    if (!editingTrip) {
      setFormValues({
        ...initialFormState,
        startDate: suggestedStartDate,
      });
      return;
    }

    setFormValues({
      city: editingTrip.city || "",
      continent: editingTrip.continent || "",
      country: editingTrip.country || "",
      destination: editingTrip.destination,
      endDate: editingTrip.endDate,
      notes: editingTrip.notes || "",
      startDate: editingTrip.startDate,
    });
  }, [editingTrip, suggestedStartDate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(formValues);
    setFormValues({
      ...initialFormState,
      startDate: suggestedStartDate,
    });
  }

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <label>
        Destination
        <input
          name="destination"
          onChange={handleChange}
          required
          value={formValues.destination}
        />
      </label>
      <label>
        Continent
        <select
          name="continent"
          onChange={handleChange}
          required
          value={formValues.continent}
        >
          <option value="">Select a continent</option>
          {CONTINENT_OPTIONS.map((continent) => (
            <option key={continent} value={continent}>
              {continent}
            </option>
          ))}
        </select>
      </label>
      <label>
        Country
        <input
          name="country"
          onChange={handleChange}
          required
          value={formValues.country}
        />
      </label>
      <label>
        City
        <input
          name="city"
          onChange={handleChange}
          required
          value={formValues.city}
        />
      </label>
      <label>
        Start Date
        <input
          name="startDate"
          onChange={handleChange}
          required
          type="date"
          value={formValues.startDate}
        />
      </label>
      <label>
        End Date
        <input
          min={formValues.startDate || undefined}
          name="endDate"
          onChange={handleChange}
          required
          type="date"
          value={formValues.endDate}
        />
      </label>
      {!editingTrip && suggestedStartDate ? (
        <p className="form-hint">Suggested next trip start date: {suggestedStartDate}.</p>
      ) : null}
      <label>
        Notes
        <textarea
          name="notes"
          onChange={handleChange}
          rows="3"
          value={formValues.notes}
        />
      </label>
      <div className="form-actions">
        <button type="submit">
          {editingTrip ? "Save Trip Changes" : "Add Trip"}
        </button>
        {editingTrip ? (
          <button className="secondary-button" onClick={onCancelEdit} type="button">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

TripForm.propTypes = {
  editingTrip: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    city: PropTypes.string,
    continent: PropTypes.string,
    country: PropTypes.string,
    destination: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    notes: PropTypes.string,
    startDate: PropTypes.string.isRequired,
  }),
  suggestedStartDate: PropTypes.string,
  onCancelEdit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

TripForm.defaultProps = {
  editingTrip: null,
  suggestedStartDate: "",
};

export default TripForm;

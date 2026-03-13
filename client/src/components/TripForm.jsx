import PropTypes from "prop-types";
import { useState } from "react";

import "./TripForm.css";

const initialFormState = {
  destination: "",
  startDate: "",
  endDate: "",
  notes: "",
};

function TripForm({ onSubmit }) {
  const [formValues, setFormValues] = useState(initialFormState);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(formValues);
    setFormValues(initialFormState);
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
          name="endDate"
          onChange={handleChange}
          required
          type="date"
          value={formValues.endDate}
        />
      </label>
      <label>
        Notes
        <textarea
          name="notes"
          onChange={handleChange}
          rows="3"
          value={formValues.notes}
        />
      </label>
      <button type="submit">Add Trip</button>
    </form>
  );
}

TripForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default TripForm;

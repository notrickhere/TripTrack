import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import "./TripForm.css";

const initialFormState = {
  destination: "",
  startDate: "",
  endDate: "",
  notes: "",
};

function TripForm({ editingTrip, onCancelEdit, onSubmit }) {
  const [formValues, setFormValues] = useState(initialFormState);

  useEffect(() => {
    if (!editingTrip) {
      setFormValues(initialFormState);
      return;
    }

    setFormValues({
      destination: editingTrip.destination,
      endDate: editingTrip.endDate,
      notes: editingTrip.notes || "",
      startDate: editingTrip.startDate,
    });
  }, [editingTrip]);

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
    destination: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    notes: PropTypes.string,
    startDate: PropTypes.string.isRequired,
  }),
  onCancelEdit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

TripForm.defaultProps = {
  editingTrip: null,
};

export default TripForm;

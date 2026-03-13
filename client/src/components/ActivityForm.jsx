import PropTypes from "prop-types";
import { useState } from "react";

import "./ActivityForm.css";

const initialFormState = {
  name: "",
  description: "",
  date: "",
  time: "",
};

function ActivityForm({ disabled, onSubmit }) {
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
    <form className="activity-form" onSubmit={handleSubmit}>
      <label>
        Activity Name
        <input
          disabled={disabled}
          name="name"
          onChange={handleChange}
          required
          value={formValues.name}
        />
      </label>
      <label>
        Date
        <input
          disabled={disabled}
          name="date"
          onChange={handleChange}
          required
          type="date"
          value={formValues.date}
        />
      </label>
      <label>
        Time
        <input
          disabled={disabled}
          name="time"
          onChange={handleChange}
          type="time"
          value={formValues.time}
        />
      </label>
      <label>
        Description
        <textarea
          disabled={disabled}
          name="description"
          onChange={handleChange}
          rows="3"
          value={formValues.description}
        />
      </label>
      <button disabled={disabled} type="submit">
        Add Activity
      </button>
    </form>
  );
}

ActivityForm.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ActivityForm;

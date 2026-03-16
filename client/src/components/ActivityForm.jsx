import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import "./ActivityForm.css";

const initialFormState = {
  name: "",
  description: "",
  date: "",
  time: "",
};

function ActivityForm({ disabled, editingActivity, onCancelEdit, onSubmit }) {
  const [formValues, setFormValues] = useState(initialFormState);

  useEffect(() => {
    if (!editingActivity) {
      setFormValues(initialFormState);
      return;
    }

    setFormValues({
      date: editingActivity.date,
      description: editingActivity.description || "",
      name: editingActivity.name,
      time: editingActivity.time || "",
    });
  }, [editingActivity]);

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
      <div className="form-actions">
        <button disabled={disabled} type="submit">
          {editingActivity ? "Save Activity Changes" : "Add Activity"}
        </button>
        {editingActivity ? (
          <button
            className="secondary-button"
            disabled={disabled}
            onClick={onCancelEdit}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

ActivityForm.propTypes = {
  disabled: PropTypes.bool.isRequired,
  editingActivity: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    description: PropTypes.string,
    name: PropTypes.string.isRequired,
    time: PropTypes.string,
  }),
  onCancelEdit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

ActivityForm.defaultProps = {
  editingActivity: null,
};

export default ActivityForm;

import PropTypes from "prop-types";
import { useState } from "react";

import "./AuthPanel.css";

const initialLoginState = {
  email: "",
  password: "",
};

const initialRegisterState = {
  email: "",
  name: "",
  password: "",
};

function AuthPanel({ errorMessage, mode, onLogin, onRegister }) {
  const [loginValues, setLoginValues] = useState(initialLoginState);
  const [registerValues, setRegisterValues] = useState(initialRegisterState);

  function handleLoginChange(event) {
    const { name, value } = event.target;
    setLoginValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  function handleRegisterChange(event) {
    const { name, value } = event.target;
    setRegisterValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    await onLogin(loginValues);
    setLoginValues(initialLoginState);
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    await onRegister(registerValues);
    setRegisterValues(initialRegisterState);
  }

  return (
    <section className="auth-panel">
      <div className="auth-panel-copy">
        <p className="eyebrow">Planner Access</p>
        <h2>
          {mode === "register"
            ? "Create an account to save your trips"
            : "Sign in to manage your planner"}
        </h2>
        <p>
          You can browse the inspiration board without an account, but planner
          trips and itinerary edits are private to each user.
        </p>
      </div>

      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

      {mode === "login" ? (
        <form className="auth-form" onSubmit={handleLoginSubmit}>
          <label>
            Email
            <input
              autoComplete="email"
              name="email"
              onChange={handleLoginChange}
              required
              type="email"
              value={loginValues.email}
            />
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              name="password"
              onChange={handleLoginChange}
              required
              type="password"
              value={loginValues.password}
            />
          </label>
          <button type="submit">Login</button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleRegisterSubmit}>
          <label>
            Name
            <input
              autoComplete="name"
              name="name"
              onChange={handleRegisterChange}
              required
              value={registerValues.name}
            />
          </label>
          <label>
            Email
            <input
              autoComplete="email"
              name="email"
              onChange={handleRegisterChange}
              required
              type="email"
              value={registerValues.email}
            />
          </label>
          <label>
            Password
            <input
              autoComplete="new-password"
              name="password"
              onChange={handleRegisterChange}
              required
              type="password"
              value={registerValues.password}
            />
          </label>
          <button type="submit">Create Account</button>
        </form>
      )}
    </section>
  );
}

AuthPanel.propTypes = {
  errorMessage: PropTypes.string,
  mode: PropTypes.oneOf(["login", "register"]),
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
};

AuthPanel.defaultProps = {
  errorMessage: "",
  mode: "login",
};

export default AuthPanel;

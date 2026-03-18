const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
const AUTH_TOKEN_KEY = "triptrack_auth_token";

function getStoredToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

function getAuthHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || "Request failed.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getTrips() {
  return request("/trips");
}

export function storeAuthToken(token) {
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getCurrentToken() {
  return getStoredToken();
}

export function register(payload) {
  return request("/auth/register", {
    body: JSON.stringify(payload),
    headers: {},
    method: "POST",
  });
}

export function login(payload) {
  return request("/auth/login", {
    body: JSON.stringify(payload),
    headers: {},
    method: "POST",
  });
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function createTrip(payload) {
  return request("/trips", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function updateTrip(tripId, payload) {
  return request(`/trips/${tripId}`, {
    body: JSON.stringify(payload),
    method: "PUT",
  });
}

export function deleteTrip(tripId) {
  return request(`/trips/${tripId}`, {
    method: "DELETE",
  });
}

export function getActivities(tripId) {
  return request(`/activities?tripId=${encodeURIComponent(tripId)}`);
}

export function createActivity(payload) {
  return request("/activities", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function updateActivity(activityId, payload) {
  return request(`/activities/${activityId}`, {
    body: JSON.stringify(payload),
    method: "PUT",
  });
}

export function deleteActivity(activityId) {
  return request(`/activities/${activityId}`, {
    method: "DELETE",
  });
}

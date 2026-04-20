const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
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

export function register(payload) {
  return request("/auth/register", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function login(payload) {
  return request("/auth/login", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function logout() {
  return request("/auth/logout", {
    method: "POST",
  });
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

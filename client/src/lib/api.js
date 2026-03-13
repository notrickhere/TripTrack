const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
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

export function createTrip(payload) {
  return request("/trips", {
    body: JSON.stringify(payload),
    method: "POST",
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

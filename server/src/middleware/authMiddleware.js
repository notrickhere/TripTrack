export function attachOptionalUser(request, _response, next) {
  next();
}

export function requireAuth(request, response, next) {
  if (!request.isAuthenticated || !request.isAuthenticated()) {
    response.status(401).json({ message: "Authentication required." });
    return;
  }

  next();
}

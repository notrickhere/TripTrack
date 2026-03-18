import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "development-secret";

export function attachOptionalUser(request, _response, next) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    request.user = null;
    next();
    return;
  }

  const token = authorizationHeader.slice("Bearer ".length);

  try {
    request.user = jwt.verify(token, JWT_SECRET);
  } catch (_error) {
    request.user = null;
  }

  next();
}

export function requireAuth(request, response, next) {
  attachOptionalUser(request, response, () => {
    if (!request.user) {
      response.status(401).json({ message: "Authentication required." });
      return;
    }

    next();
  });
}

export function signAuthToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

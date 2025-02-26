import jwt, { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import logger from "../../app/helpers/logger";
import config from "../../app/config";

// Define an extended interface for the Socket object to include decodedToken
interface AuthenticatedSocket extends Socket {
  decodedToken?: JwtPayload | string;
}

const socketAuthMiddleware = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  // Retrieve token from different possible locations
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.token ||
    socket.handshake.headers?.authorization;

  if (!token) {
    return next(new Error("Authentication error: Token not provided."));
  }

  // Verify the token
  jwt.verify(token, config.jwt_access_secret as string, (err: any, decoded: any) => {
    if (err) {
      console.error(err);
      logger.error({
        message: err.message,
        status: err.status || 500,
        method: "socket-event",
        url: "socket-auth-middleware",
        stack: err.stack,
      });
      return next(new Error("Authentication error: Invalid token."));
    }

    socket.decodedToken = decoded; // Attach decoded token to the socket
    next();
  });
};

export default socketAuthMiddleware;

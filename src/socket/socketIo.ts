import { Server, Socket } from "socket.io";
import socketAuthMiddleware from "./auth/auth";
import { DecodedToken } from "../types";
import logger from "../app/helpers/logger";

// Extend the Socket interface to include the decodedToken
interface AuthenticatedSocket extends Socket {
  decodedToken?: DecodedToken;
}

// Define active users type properly
let activeUsers: Record<string, DecodedToken & { id: string }> = {};

const socketIO = (io: Server) => {
  

  // middleware to authenticate the socket connection
  io.use(socketAuthMiddleware);

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('connected', socket?.id);
    const user = socket.decodedToken

    // Ensure user and user.userId exist before modifying activeUsers
    if (user && user.userId) {
      try {
        if (!activeUsers[user.userId]) {
          activeUsers[user.userId] = { ...user, id: user.userId };
          console.log(`User Id: ${user.userId} is just connected.`);
        } else {
          console.log(`User Id: ${user.userId} is already connected.`);
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        logger.error(error, "-- socket.io connection error --");
      }
    }

    // for creating new chat
    // socket.on("add-new-chat", (data, callback) => addNewChat(socket, data, callback));

    // for adding new message
    // socket.on("add-new-message", (data, callback) => addNewMessage(socket, data, callback));

    // for sharing live location
    // socket.on('live-location-share', (data, callback) => userLiveLocationShare(socket, data, callback));

    //call this to show is typing
    socket.on("typing", function (data) {
      const roomId = data.chatId.toString();
      const message = user?.fullName + " is typing...";
      socket.broadcast.emit(roomId, { message: message });
    });

    //get active users
    // socket.on('get-active-users', (data, callback) => getActiveUsers(socket, data, callback, activeUsers));




    socket.on('disconnect', () => {
      if (user?.userId) {
      delete activeUsers[user?.userId];
      console.log(`User ID: ${user?.userId} just disconnected`);
      }
    });


  });
};

module.exports = socketIO;

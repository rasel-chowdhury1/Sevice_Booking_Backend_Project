

import { Router } from "express";
import { notificationController } from "./notification.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";

export const notificationRoutes = Router();

// Route to create a new notification
notificationRoutes
    .post(
        "/", 
        notificationController.createNotification
    );

// Route to get notifications by recipient ID
notificationRoutes
    .get(
        "/myNotifactions", 
        auth(USER_ROLE.GUIDE,USER_ROLE.SEEKER),
        notificationController.getNotificationsByRecipient
    );

// Route to mark a notification as read
notificationRoutes
    .patch(
        "/:notificationId/read", 
        notificationController.markNotificationAsRead
    );

// Route to delete a notification
notificationRoutes
    .delete(
        "/:notificationId", 
        notificationController.deleteNotification
    );
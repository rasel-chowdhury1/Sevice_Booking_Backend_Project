import Notification from "./notification.model";
import { INotification } from "./notification.interface";

// Create a new notification
const createNotification = async (notificationData: Partial<INotification>): Promise<INotification> => {
    const notification = new Notification(notificationData);
    return await notification.save();
};

// Get notifications by recipient ID
const getNotificationsByRecipientId = async (recipientId: string): Promise<INotification[]> => {
    return await Notification.find({ recipient_id: recipientId }).sort({ created_at: -1 }).exec();
};

// Mark a notification as read
const markNotificationAsRead = async (id: string): Promise<INotification | null> => {
    return await Notification.findByIdAndUpdate(
        id,
        { is_read: true },
        { new: true }
    ).exec();
};

// Delete a notification by ID
const deleteNotificationById = async (id: string): Promise<void> => {
    await Notification.findByIdAndDelete(id).exec();
};



export const notificationService = {
    createNotification,
    getNotificationsByRecipientId,
    markNotificationAsRead,
    deleteNotificationById
}
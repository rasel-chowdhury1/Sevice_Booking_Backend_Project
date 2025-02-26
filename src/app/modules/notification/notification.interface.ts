import { Document, ObjectId } from "mongoose";

export type TNotificationType = "info" | "success" | "error" | "warning" | "endRequest" | "review" | "calender";

export interface INotification extends Document {
    user_id: string | ObjectId; // User who will sent the notification
    recipient_id: string | ObjectId; // User who will receive the notification
    type: TNotificationType; // Type of notification (info, success, error, warning)
    title: string; // Title of the notification
    message: string; // Notification content/message
    data: string;
    is_read: boolean; // Status of the notification: read or unread
    created_at: Date; // Timestamp of when the notification was created
}

import mongoose, { Schema } from "mongoose";
import { INotification } from "./notification.interface";

const notificationSchema: Schema = new Schema<INotification>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, 
    }, // Reference to the User model
    recipient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, // Reference to the User model
    type: {
        type: String,
        enum: ["info", "success", "error", "warning", "acceptEndRequest", "endRequest","review", "calender", "report", "refund"],
        required: true,
    }, // Notification type
    title: {
        type: String,
        required: true,
    }, // Notification title
    message: {
        type: String,
        required: true,
    },
    data:{
        type: String,
        default:""
    }, // Notification message content
    is_read: {
        type: Boolean,
        default: false,
    }, // Read status
    created_at: {
        type: Date,
        default: Date.now,
    }, // Timestamp
});

const Notification = mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;

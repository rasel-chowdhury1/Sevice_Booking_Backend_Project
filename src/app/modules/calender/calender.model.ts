import mongoose, { Schema } from "mongoose";// Assuming you have an interface defined for ICalendar
import { ICalendar } from "./calender.interface";

const calendarSchema: Schema = new Schema<ICalendar>({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    }, // Reference to the Event model
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, // Reference to the User model
    isDeleted: {
        type: Boolean,
        default: false,
    }, // Flag to mark if the event is deleted
}, { timestamps: true });

const Calendar = mongoose.model<ICalendar>("Calendar", calendarSchema);

export default Calendar;

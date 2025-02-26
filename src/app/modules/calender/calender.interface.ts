import { Document, ObjectId } from "mongoose";


export interface ICalendar extends Document {
    event_id: ObjectId;
    user_id: ObjectId;
    isDeleted: boolean;
}

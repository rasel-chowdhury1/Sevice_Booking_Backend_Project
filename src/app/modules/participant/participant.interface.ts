import { Document, ObjectId } from "mongoose";


export interface IParticipant extends Document {
    event_id: ObjectId;
    user_id: ObjectId;
    status: "registered" | "cancelled";
}

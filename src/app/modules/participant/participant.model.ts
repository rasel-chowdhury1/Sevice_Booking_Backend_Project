import mongoose, { Schema } from "mongoose";
import { IParticipant } from "./participant.interface";

const participantSchema: Schema = new Schema<IParticipant>({
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
    status: {
        type: String,
        enum: ["registered", "cancelled"],
        required: true,
    }, // Registration status
}, { timestamps: true });

const Participant = mongoose.model<IParticipant>("Participant", participantSchema);

export default Participant;
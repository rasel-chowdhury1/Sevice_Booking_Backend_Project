
import AppError from "../../error/AppError";
import Event from "../event/event.models";
import { User } from "../user/user.models";
import Participant from "./participant.model";
import httpStatus from 'http-status';

// Register a new participant
const registerParticipant = async (userId: string, eventId: string) => {
     // 1️⃣ Validate if the event exists
     const event = await Event.findById(eventId);
     if (!event) {
       throw new AppError(httpStatus.NOT_FOUND, "Event not found");
     }
 
     // 2️⃣ Validate if the user exists
     const user = await User.findById(userId);
     if (!user) {
       throw new AppError(httpStatus.NOT_FOUND, "User not found");
     }
 
     // 3️⃣ Check if user is already registered for this event
     const existingParticipant = await Participant.findOne({ event_id: eventId, user_id: userId });
     if (existingParticipant) {
       throw new AppError(httpStatus.BAD_REQUEST, "User is already registered for this event");
     }
 
     // 4️⃣ Check if the event has space for more participants
     const participantCount = await Participant.countDocuments({ event_id: eventId });
     if (participantCount >= event.maxParticipants) {
       throw new AppError(httpStatus.BAD_REQUEST, "Event is already full");
     }
 
     // 5️⃣ Register the user for the event
     const participant = new Participant({
       event_id: eventId,
       user_id: userId,
       status: "registered",
     });
 
     await participant.save();
 
     return participant;
};

// Get participants by event ID
const getParticipantsByEvent = async (eventId: string) => {
    return await Participant.find({ event_id: eventId });
};

// Update participant status
const updateParticipantStatus = async (id: string, status: "registered" | "cancelled") => {
    return await Participant.findByIdAndUpdate(id, { status }, { new: true });
};

// Delete a participant
const deleteParticipant = async (id: string) => {
    return await Participant.findByIdAndDelete(id);
};

export const participantService = {
    registerParticipant,
    getParticipantsByEvent,
    updateParticipantStatus,
    deleteParticipant
};

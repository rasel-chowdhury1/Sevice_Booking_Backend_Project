import AppError from "../../error/AppError";
import Event from "../event/event.models";
import { User } from "../user/user.models";
import httpStatus from 'http-status';
import Calendar from "./calender.model";
import mongoose from "mongoose";

// 1️⃣ Register a user for a calendar event
const createCalendarEvent = async (userId: string, eventId: string) => {
    // 2️⃣ Validate if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
        throw new AppError(httpStatus.NOT_FOUND, "Event not found");
    }

    // 3️⃣ Validate if the user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // 4️⃣ Check if the user is already registered for the event
    const existingEntry = await Calendar.findOne({ event_id: eventId, user_id: userId });
    if (existingEntry) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is already registered for this event");
    }

    // 5️⃣ Check if the event has space for more participants
    // Assuming the event model has a `maxParticipants` field
    const participantCount = await Calendar.countDocuments({ event_id: eventId });
    if (participantCount >= event.maxParticipants) {
        throw new AppError(httpStatus.BAD_REQUEST, "Event is already full");
    }

    // 6️⃣ Register the user for the event
    const calendarEntry = new Calendar({
        event_id: eventId,
        user_id: userId,
        isDeleted: false, // Default to false
    });

    await calendarEntry.save();

    return calendarEntry;
};

// Get calendar entries for a user
const getCalendarEventByUser = async (userId: string) => {
    try {
      const calendarEvents = await Calendar.aggregate([
        {
          $match: { user_id: new mongoose.Types.ObjectId(userId), isDeleted: false },
        },
        {
          $lookup: {
            from: 'events',
            localField: 'event_id',
            foreignField: '_id',
            as: 'eventDetails',
          },
        },
        {
          $unwind: '$eventDetails',
        },
        {
          $lookup: {
            from: 'participants', // ✅ Check participation
            let: { event_id: '$event_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$event_id', '$$event_id'] }, // Match event ID
                      { $eq: ['$user_id', new mongoose.Types.ObjectId(userId)] }, // Match user ID
                    ],
                  },
                },
              },
            ],
            as: 'userParticipation',
          },
        },
        {
          $addFields: {
            'eventDetails.isJoined': { $gt: [{ $size: '$userParticipation' }, 0] }, // ✅ True if user has joined
          },
        },
        {
          $project: {
            user_id: 1,
            event_id: 1,
            isDeleted: 1,
            createdAt: 1,
            updatedAt: 1,
            eventDetails: 1, // ✅ Include event details with `isJoined`
          },
        },
      ]);
  
      return calendarEvents;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch calendar events');
    }
  };
  
  
// // Get calendar entries for a user
// const getCalendarEventByUser = async (userId: string) => {
//     const result =  await Calendar.find({ user_id: userId, isDeleted: false }).populate('event_id');
//     return result;
// };

// Update calendar entry status (soft delete)
const updateCalendarEventStatus = async (id: string, isDeleted: boolean) => {
    const result = await Calendar.findByIdAndUpdate(id, { isDeleted }, { new: true });
    return result;
};

// Soft delete a calendar entry (mark as deleted)
const deleteCalendarEvent = async (id: string) => {
    const entry = await Calendar.findById(id);
    if (!entry) {
        throw new AppError(httpStatus.NOT_FOUND, "Calendar entry not found");
    }

    entry.isDeleted = true;
    await entry.save();

    return entry;
};

// Get calendar entries by event ID
const getCalendarEventByEventId = async (eventId: string) => {
    return await Calendar.find({ event_id: eventId, isDeleted: false }).populate('user_id');
};

// Get a calendar entry by its ID
const getCalendarEventById = async (id: string) => {
    const result = await Calendar.findById(id).populate('user_id').populate('event_id');
    return result;
};

export const calendarService = {
    createCalendarEvent,
    getCalendarEventByUser,
    updateCalendarEventStatus,
    deleteCalendarEvent,
    getCalendarEventByEventId,
    getCalendarEventById,
};

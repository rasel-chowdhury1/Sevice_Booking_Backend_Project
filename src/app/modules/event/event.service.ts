import { unlink } from 'fs/promises';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { IEvent } from './event.interface';
import Event from './event.models';

const createEvent = async (eventData: Partial<IEvent>) => {
  try {
    const { longitude, latitude, ...rest } = eventData;

    if (longitude !== undefined && latitude !== undefined) {
      rest.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }
    // Attempt to create the event
    const newEvent = await Event.create(rest);

    if (!newEvent) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create the event.',
      );
    }

    return newEvent;
  } catch (error) {
    console.error('Event creation failed:', error);

    // If event creation fails, delete the uploaded files
    try {
      if (eventData.bannerImage) {
        await unlink(`public/${eventData.bannerImage}`);
      }

      if (eventData.descriptionImage) {
        await unlink(`public/${eventData.descriptionImage}`);
      }

      if (eventData.coHosts) {
        for (const coHost of eventData.coHosts) {
          if (coHost.image) {
            await unlink(`public/${coHost.image}`);
          }
        }
      }
    } catch (deleteError) {
      console.error('Error deleting uploaded files:', deleteError);
    }

    throw error; // Re-throw the original error to handle it elsewhere
  }
};

// ============= get Nearest events ================
const getNearestEvents = async (userId: string, projects?: {}) => {

  console.log("nearest event of user id ---->>> ", userId)
  try {
    // 1️⃣ Fetch user details
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // 2️⃣ Extract user location
    const { location } = user;

    if (
      !location ||
      !location.coordinates ||
      location.coordinates.length !== 2
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'User location is missing or invalid',
      );
    }

    const [longitude, latitude] = location.coordinates;

    console.log('==== User Location ===', { longitude, latitude });

    // ✅ Ensure `location` field has a `2dsphere` index
    await Event.collection.createIndex({ location: '2dsphere' });

    // 3️⃣ Query nearest events
    const events = await Event.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          distanceField: 'distance',
          maxDistance: 30000, // ✅ 30km max distance filter
          spherical: true,
        },
      },

      {
        $lookup: {
          from: 'participants', // ✅ Check participation
          let: { event_id: '$_id' },
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
        $lookup: {
          from: 'calendars', // ✅ Check participation
          let: { event_id: '$_id' },
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
          as: 'userCalendar',
        },
      },

      {
        $addFields: {
          isJoined: { $gt: [{ $size: '$userParticipation' }, 0] }, // ✅ True if user has joined
          isCalendar: { $gt: [{ $size: '$userCalendar' }, 0] }, // ✅ True if user has calendar
          type: 'event',
        },
      },

      {
        $match: {
          createdBy: { $ne: user._id },
          isDeleted: false, // ✅ Ignore deleted events
          status: 'active', // ✅ Only active events
          date: { $gte: new Date() }, // ✅ Only future events
        },
      },

      {
        $sort: { distance: 1 }, // ✅ Sort by closest distance
      },

      {
        $project: projects || {
          title: 1,
          description: 1,
          descriptionImage: 1,
          date: 1,
          time: 1,
          bannerImage: 1,
          createdBy: 1,
          coHosts: 1,
          location: 1,
          address: 1,
          maxParticipants: 1,
          status: 1,
          distance: 1, // ✅ Return distance in meters
          isJoined: 1,
          isCalendar: 1,
          type: 1,
        },
      },
    ]);

    console.log({ events });

    return events;
  } catch (error) {
    console.error('Error fetching nearest events:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, errorMessage);
  }
};

// ============== get upcomming events  start ==============
const getUpcomingEventsForUser = async (userId: string) => {
  try {
    // 1️⃣ Check if the user is a participant in any future events
    const events = await Event.aggregate([
      {
        $lookup: {
          from: 'participants',
          let: { event_id: '$_id' },
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
        $match: {
          isDeleted: false, // ✅ Ignore deleted events
          status: 'active', // ✅ Only active events
          date: { $gte: new Date() }, // ✅ Only future events
          'userParticipation.0': { $exists: true }, // ✅ User must be a participant
        },
      },
      {
        $sort: { date: 1 }, // ✅ Sort by event date (soonest first)
      },
      {
        $project: {
          title: 1,
          description: 1,
          descriptionImage: 1,
          date: 1,
          time: 1,
          bannerImage: 1,
          createdBy: 1,
          coHosts: 1,
          location: 1,
          address: 1,
          maxParticipants: 1,
          status: 1,
        },
      },
    ]);

    return events;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, errorMessage);
  }
};
// ============== get upcomming events  end ==============


// ============== get features events  start ==============
const getFeatureEventsForUser = async (userId: string) => {
  try {
    // Aggregation pipeline to join Events with Users and Participants
    const events = await Event.aggregate([
      {
        $match: {
          createdBy: { $ne: userId }, // Only events not created by the given user
          date: { $gte: new Date() }, // Event date is today or in the future
          isDeleted: { $ne: true }, // Exclude deleted events
          status: { $ne: 'cancelled' }, // Exclude cancelled events
        },
      },
      {
        $lookup: {
          from: 'users', // Join with the User collection
          localField: 'createdBy', // The field in Event model to match
          foreignField: '_id', // The field in User model to match
          as: 'creator', // The alias for the joined user data
        },
      },
      {
        $unwind: '$creator', // Unwind the creator array to access user data directly
      },
      {
        $match: {
          'creator.isSubcription': true, // Only include events where the creator has a subscription
        },
      },
      {
        $lookup: {
          from: 'participants', // Join with the Participant collection
          localField: '_id', // Match Event ID
          foreignField: 'event_id', // Match the event_id in the Participant collection
          as: 'participants', // Alias for the participants data
        },
      },
      {
        $match: {
          'participants.user_id': { $ne: new mongoose.Types.ObjectId(userId) }, // Ensure the user is not a participant
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          descriptionImage: 1,
          createdBy: 1,
          date: 1,
          time: 1,
          address: 1,
          location: 1,
          maxParticipants: 1,
          bannerImage: 1,
          coHosts: 1,
          status: 1,
        },
      },
    ]);

    return events;

  } catch (error) {
    console.error('Error fetching feature events for user:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, errorMessage);
  }
};

// ============== get features events  end ==============

// ============== get created events start ==============
const getMyCreatedEvents = async (userId: string) => {
  console.log('========= user id === ', userId);

  try {
    const event = await Event.find({ createdBy: userId, isDeleted: false }); // Ensure isDeleted is false

    console.log('===== My event === ', event);

    if (!event) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Event not found or has been deleted.',
      );
    }

    return event;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to fetch the event.',
    );
  }
};
// ============== get created events end ==============

const updateEvent = async (eventId: string, eventData: Partial<IEvent>) => {
  try {
    // Find the existing event by ID
    const existingEvent = await Event.findById(eventId);

    if (!existingEvent) {
      throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
    }

    // Handle image updates
    if (
      eventData.bannerImage &&
      existingEvent.bannerImage !== eventData.bannerImage
    ) {
      // Delete the old banner image
      if (existingEvent.bannerImage) {
        await unlink(`public/${existingEvent.bannerImage}`).catch((err) =>
          console.error('Error deleting old banner image:', err),
        );
      }
    }

    if (
      eventData.descriptionImage &&
      existingEvent.descriptionImage !== eventData.descriptionImage
    ) {
      // Delete the old description image
      if (existingEvent.descriptionImage) {
        await unlink(`public/${existingEvent.descriptionImage}`).catch((err) =>
          console.error('Error deleting old description image:', err),
        );
      }
    }

    if (eventData.coHosts && existingEvent.coHosts) {
      for (let i = 0; i < eventData.coHosts.length; i++) {
        const newCoHost = eventData.coHosts[i];
        const oldCoHost = existingEvent.coHosts[i];

        // If the co-host's image is updated, delete the old image
        if (newCoHost.image && oldCoHost?.image !== newCoHost.image) {
          if (oldCoHost?.image) {
            await unlink(`public/${oldCoHost.image}`).catch((err) =>
              console.error('Error deleting old co-host image:', err),
            );
          }
        }
      }
    }

    // Update the event with new data
    const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validation
    });

    if (!updatedEvent) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update the event',
      );
    }

    return updatedEvent;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

const getAllEvents = async (
  query: Record<string, unknown>,
): Promise<{ events: IEvent[]; meta: Record<string, number> }> => {
  try {
    const modelQuery = Event.find({ isDeleted: false }).populate({
      path: 'createdBy',
      select: 'fullName email image', // Select specific fields from the User model
    });; // Only fetch events where isDeleted is false
    // Use QueryBuilder for filtering, searching, sorting, pagination, and fields
    const queryBuilder = new QueryBuilder<IEvent>(modelQuery, query)
      .search(['title']) // Search within title and description
      .filter()
      .sort()
      .fields()
      .paginate();

    // Execute the query to fetch filtered events
    const events = await queryBuilder.modelQuery.exec();

    // Fetch total count and pagination info
    const meta = await queryBuilder.countTotal();
    return { events, meta };
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to fetch events.',
    );
  }
};

const getEventById = async (eventId: string): Promise<IEvent> => {
  try {
    const event = await Event.findOne({ _id: eventId, isDeleted: false }); // Ensure isDeleted is false

    if (!event) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Event not found or has been deleted.',
      );
    }

    return event;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to fetch the event.',
    );
  }
};

const deleteEvent = async (user_id: string, eventId: string): Promise<void> => {
  try {
    const event = await Event.findById(eventId);

    

    if (!event) {
      throw new AppError(httpStatus.NOT_FOUND, 'Event not found.');
    }

     // Ensure that only the creator of the event can delete it
     if (event.createdBy.toString() !== user_id) {
      throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to delete this event.');
    }

    // Mark the event as deleted
    event.isDeleted = true;
    await event.save();
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to delete the event.',
    );
  }
};

export const eventService = {
  createEvent,
  getNearestEvents,
  getUpcomingEventsForUser,
  getFeatureEventsForUser,
  getMyCreatedEvents,
  updateEvent,
  getAllEvents,
  getEventById,
  deleteEvent,
};

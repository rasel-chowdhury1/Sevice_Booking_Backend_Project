import mongoose, { Schema } from 'mongoose';
import { IEvent } from './event.interface';

const eventSchema: Schema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    description: {
      type: String,
      required: true,
    },
    descriptionImage: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    // ✅ Location (Used for Mapping Features)
    address: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    maxParticipants: {
      type: Number,
      default: 10,
      required: true,
    },
    bannerImage: {
      type: String,
    },
    coHosts: [
      {
        name: { type: String, required: true },
        image: { type: String }, // Optional, stores image URL/path
        title: { type: String, required: true }, // E.g., Speaker, Organizer
      },
    ],
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    blockedUsers: {
      type: [Schema.Types.ObjectId],
      default: []
    }
  },
  { timestamps: true },
);

// ✅ Ensure `location` has a geospatial index
eventSchema.index({ location: '2dsphere' });

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;

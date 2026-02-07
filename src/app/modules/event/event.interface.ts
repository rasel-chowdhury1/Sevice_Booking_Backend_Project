import { Document, ObjectId } from 'mongoose';

// Enum for event status
export type TEventStatus = 'active' | 'cancelled' | 'completed';

// Interface for a single co-host
export interface ICoHost {
  name: string; // Co-host's name
  image?: string; // URL or path to the co-host's image
  title: string; // Co-host's title (e.g., Speaker, Organizer)
}

// Main Event Interface
export interface IEvent extends Document {
  title: string; // Event title
  description: string; // Event description
  descriptionImage?: string;
  bannerImage?: string; // URL or path to the event banner image
  createdBy: ObjectId; // Reference to the User who created the event
  date: Date; // Event date
  time: string; // Event time
  address?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };// Event location
  longitude?: string;
  latitude?: string;
  maxParticipants: number; // Maximum allowed participants
  coHosts: ICoHost[]; // Array of co-hosts
  status: TEventStatus; // Event status (active, cancelled, completed)
  isDeleted: boolean;
  createdAt: Date; // Automatically added by Mongoose
  updatedAt: Date; // Automatically added by Mongoose
  blockedUsers?: ObjectId[];
}

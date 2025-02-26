import { Document, ObjectId } from "mongoose";

export type TBookingStatus = 'pending' | 'confirmed' | 'inProgress' | 'endRequest' | 'done' | 'cancelled';

export const TBookingStatus = ['pending' , 'confirmed' , 'inProgress', 'endRequest', 'done' , 'cancelled']



export interface IBooking extends Document {
    user_id: ObjectId;
    guide_id: ObjectId;
    booking_date: Date;
    booking_time: string; // Format: "HH:mm"
    status?: TBookingStatus;
    total_price: number;
    commission?: number;
}
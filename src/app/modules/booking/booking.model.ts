// booking.model.ts
import mongoose, { Schema } from 'mongoose';
import { IBooking } from './booking.interface';

const bookingSchema: Schema = new Schema<IBooking>({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // Refers to User model
    guide_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // Refers to User model
    booking_date: { 
        type: Date, 
        required: true 
    },
    booking_time: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/, // Validates HH:mm format
    },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'inProgress', 'endRequest', 'done', 'cancelled'], 
        default: "pending",
    },
    total_price: { 
        type: Number, 
        required: true 
    },
    commission: { 
        type: Number, 
        required: false,
        default: 0 
    },
});


const Booking = mongoose.model<IBooking>("Booking", bookingSchema)

export default Booking;

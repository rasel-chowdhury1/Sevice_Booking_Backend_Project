import mongoose, { Schema } from 'mongoose';
import { ISubscription } from './subscription.interface';

const subcriptionSchema: Schema = new Schema<ISubscription>(
    {
        created: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        duration: {
            type: Number, // in days
            required: true,
        },
        features: {type: [String], default: []},
        isDeleted: {type: Boolean, default:false}
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const Subcription  = mongoose.model<ISubscription>(
    'Subcription',
    subcriptionSchema,
);
export default Subcription;

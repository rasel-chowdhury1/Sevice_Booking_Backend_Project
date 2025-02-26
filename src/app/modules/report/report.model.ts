import mongoose, { Schema } from 'mongoose';
import { IReport } from './report.interface';


const reportSchema: Schema = new Schema<IReport>(
    {
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    reportId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
    },
    comment: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 500,
    }
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const Report  = mongoose.model<IReport>(
    'Report',
    reportSchema,
);
export default Report;

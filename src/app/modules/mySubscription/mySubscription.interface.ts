
import { ObjectId } from "mongoose";

export interface IMySubscription {
  _id?: string;
  user: ObjectId;
  expiryDate: Date;
  subscription?: ObjectId; 
}

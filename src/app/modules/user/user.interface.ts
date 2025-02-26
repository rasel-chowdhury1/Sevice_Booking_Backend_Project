import { Model } from 'mongoose';

import { gender, USER_ROLE } from './user.constants';

export interface TUserCreate {
  fullName?: string;
  email: string;
  password: string;
  phone?: string;
  role: (typeof USER_ROLE)[keyof typeof USER_ROLE];
  about?: string;
  gender?: (typeof gender)[keyof typeof gender];
  document?: string;
  age?: string;
  availability?: string[]; 
  activityPreferences?: string[];
  interests?: string[]; 
  skills?: string[]; 
  photos?: string[];
  address?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  rating?: number;
  points?: number;
  notificationSettings: {
    generalNotification: boolean;
    subscription: boolean;
  };
  privacySettings: {
      profileView: "public" | "private";
      contactPermission: "anyone" | "verifiedUsers";
  };
  adminVerified?: Boolean,
  isSubcription?: Boolean,
  paypalEmail?: String,
  fcmToken?: String;
  isBlocked?: Boolean,
  myFee?: { day: number; amount: number }[];
  latitude?: string;
  longitude?: string;
  deletePhotos?: string[]
}

export interface TUser extends TUserCreate {
  _id: string;
  image: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface DeleteAccountPayload {
  password: string;
}

export interface UserModel extends Model<TUser> {
  isUserExist(email: string): Promise<TUser>;
  isUserActive(email: string): Promise<TUser>;
  IsUserExistById(id: string): Promise<TUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}

export type IPaginationOption = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

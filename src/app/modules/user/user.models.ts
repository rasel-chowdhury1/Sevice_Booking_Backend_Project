import bcrypt from 'bcrypt';
import { Error, model, Schema } from 'mongoose';
import config from '../../config';
import { Role } from './user.constants';
import { TUser, UserModel } from './user.interface';

const userSchema = new Schema<TUser>(
  {
    image: {
      type: String,
      default: '',
    },
    fullName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: Role,
    },
    mainRole: {
      type: String,
      enum: Role,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phoneCountryCode: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    about: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      default: "Male"
    },
    document: {
        type: String,
        default: '',
      },
    age: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    availability: {
      type: [String], // Array of strings representing availability
      default: [],
    },
    activityPreferences: {
      type: [String], // Array of activity preferences
      default: [],
    },
    interests: {
      type: [String], // Array of interests
      default: [],
    },
    skills: {
      type: [String], // Array of skills
      default: [],
    },
    photos: {
      type: [String], // Array of URLs or file paths
      default: [],
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
    rating: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0
    },
    // notificationSettings: {
    //   generalNotification: {
    //       type: Boolean,
    //       default: true,
    //   },
    //   subscription: {
    //       type: Boolean,
    //       default: false,
    //   },
    // },
    // privacySettings: {
    //   profileView: {
    //       type: String,
    //       enum: ["public", "private"],
    //       default: "public",
    //   },
    //   contactPermission: {
    //       type: String,
    //       enum: ["anyone", "verifiedUsers"],
    //       default: "anyone",
    //   },
    // },
    adminVerified: {
      type: Boolean,
      default: false
    },
    isSubcription:{
      type: Boolean,
      default: false
    },
    paypalEmail: {
      type: String,
      default: false
    },
    fcmToken: {
      type: String,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    myFee: { day: { type: Number }, amount: { type: Number } }, 
    isLookingGuide: {
      type: Boolean,
      default: false
    },
    // Add the wallet and transaction fields
    wallet: {
      balance: {
        type: Number,
        default: 0,
      },
      transactions: [
        {
          type: {
            type: String,
            enum: ['deposit', 'payment', 'withdrawal', 'refund'],
            required: true,
          },
          amount: {
            type: Number,
            required: true,
          },
          referenceId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'type',
          },
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    // ✅ Users this user has blocked
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

// ✅ Ensure MongoDB applies the 2dsphere index
userSchema.index({ location: '2dsphere' });


// userSchema.index({ fullName: "text" });

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// set '' after saving password
userSchema.post(
  'save',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function (error: Error, doc: any, next: (error?: Error) => void): void {
    doc.password = '';
    next();
  },
);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password; // Remove password field
  return user;
};

// filter out deleted documents
userSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// userSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
//   next();
// });

userSchema.statics.isUserExist = async function (email: string) {

  return await User.findOne({ email: email }).select('+password');
};



userSchema.statics.isUserActive = async function (email: string) {
  return await User.findOne({
    email: email,
    isDeleted: false,
    isActive: true,
  }).select('+password');
};

userSchema.statics.isLookingForGuide = async function(id: string){
  return await User.findById(id).select("")
}

userSchema.statics.IsUserExistById = async function (id: string) {
  return await User.findById(id).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const User = model<TUser, UserModel>('User', userSchema);

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  dateOfBirth?: Date;
  gender?: string;
  location?: string;

  // Preferences
  goesToGym?: boolean;
  workoutFrequency?: string;
  favoriteGenres?: string[];
  favoriteArtists?: string[];
  listenHoursPerDay?: string;
  preferredPlatform?: string;

  // Additional info
  occupation?: string;
  education?: string;
  languages?: string[];

  // Activity preferences
  likesMorningListening?: boolean;
  likesEveningListening?: boolean;
  listensDuringWorkout?: boolean;
  listensDuringWork?: boolean;
  listensDuringCommute?: boolean;

  // Connected services
  spotifyConnected?: boolean;
  youtubeConnected?: boolean;
  spotifyId?: string;
  youtubeId?: string;

  // Account info
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String },
  location: { type: String },

  // Preferences
  goesToGym: { type: Boolean, default: false },
  workoutFrequency: { type: String },
  favoriteGenres: [{ type: String }],
  favoriteArtists: [{ type: String }],
  listenHoursPerDay: { type: String },
  preferredPlatform: { type: String },

  // Additional info
  occupation: { type: String },
  education: { type: String },
  languages: [{ type: String }],

  // Activity preferences
  likesMorningListening: { type: Boolean, default: false },
  likesEveningListening: { type: Boolean, default: false },
  listensDuringWorkout: { type: Boolean, default: false },
  listensDuringWork: { type: Boolean, default: false },
  listensDuringCommute: { type: Boolean, default: false },

  // Connected services
  spotifyConnected: { type: Boolean, default: false },
  youtubeConnected: { type: Boolean, default: false },
  spotifyId: { type: String },
  youtubeId: { type: String },

  // Account info
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create or get the model
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

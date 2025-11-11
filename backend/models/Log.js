import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'AVATAR_UPLOADED', 'PROFILE_UPDATED']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Log = mongoose.model('Log', logSchema);

export default Log;

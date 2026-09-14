const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    originalFilename: {
      type: String,
      required: true,
    },
    audioRef: {
      type: String,
      required: true,
    },
    voiceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    behaviorScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    contentScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    trustScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    transcript: {
      type: String,
      default: '',
    },
    modelVersion: {
      type: String,
      default: '1.0.0-placeholder',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Analysis', analysisSchema);

import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  session: { type: String, required: true },
  date: { type: String, required: true },
  day: { type: String, required: true },
  timing: { type: String, required: true },
  subjects: { type: Map, of: String, default: {} }
}, { timestamps: true });

timetableSchema.index({ session: 1, date: 1 }, { unique: true });

export default mongoose.model('Timetable', timetableSchema);

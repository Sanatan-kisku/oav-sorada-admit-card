import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  admissionNo: { type: String, trim: true },
  name: { type: String, required: true, trim: true },
  className: { type: String, required: true, trim: true },
  section: { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, trim: true },
  gender: { type: String, trim: true },
  dob: { type: String, required: true, trim: true },
  fatherName: { type: String, trim: true },
  motherName: { type: String, trim: true },
  houseName: { type: String, trim: true }
}, { timestamps: true });

studentSchema.index({ className: 1, section: 1, rollNo: 1, dob: 1 }, { unique: true });

export default mongoose.model('Student', studentSchema);

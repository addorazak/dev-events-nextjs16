import { Schema, model, Document, Model, Types } from "mongoose";
import Event from "./event.model";

/**
 * Booking document interface with strong typing
 * Represents a user booking for an event
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition with validation rules
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event reference is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: validate that the referenced event exists
 * This prevents orphaned bookings pointing to non-existent events
 * Throws error immediately if event is not found
 */
bookingSchema.pre<IBooking>("save", async function () {
  if (this.isModified("eventId") || this.isNew) {
    const eventExists = await Event.findById(this.eventId).select("_id").lean();
    if (!eventExists) {
      throw new Error(`Event with ID ${this.eventId} does not exist`);
    }
  }
});

// Create and export the model
const Booking: Model<IBooking> = model<IBooking>("Booking", bookingSchema);

export default Booking;

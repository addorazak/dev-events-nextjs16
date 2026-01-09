import { Schema, model, Document, Model } from "mongoose";
import slugify from "slugify";

/**
 * Event document interface with strong typing
 * Represents a single event in the system
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO format (YYYY-MM-DD)
  time: string; // HH:MM or HH:MM AM/PM format
  mode: "online" | "offline" | "hybrid";
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition with validation rules
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
      minlength: [10, "Overview must be at least 10 characters"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    mode: {
      type: String,
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be online, offline, or hybrid",
      },
      required: [true, "Event mode is required"],
    },
    audience: {
      type: String,
      required: [true, "Target audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      default: [],
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: slug generation, date/time normalization, and validation
 * - Generate URL-friendly slug from title only when title changes
 * - Validate date is in ISO format (YYYY-MM-DD)
 * - Validate time is not empty
 * - Ensure required fields are non-empty
 */
eventSchema.pre("save", async function () {
  // Regenerate slug only when title is modified or document is new
  if (this.isModified("title") || this.isNew) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  // Validate and normalize date format (YYYY-MM-DD)
  if (this.isModified("date") || this.isNew) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(this.date)) {
      throw new Error("Date must be in ISO format (YYYY-MM-DD)");
    }

    // Verify it's a valid date
    const dateObj = new Date(this.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date value");
    }
  }

  // Validate time is not empty
  if (this.isModified("time") || this.isNew) {
    if (!this.time || this.time.trim() === "") {
      throw new Error("Time cannot be empty");
    }
  }

  // Validate required fields are not empty strings
  const requiredFields = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "organizer",
  ];
  for (const field of requiredFields) {
    if (
      this.isModified(field) ||
      (this.isNew &&
        typeof this[field as keyof IEvent] === "string" &&
        (this[field as keyof IEvent] as string).trim() === "")
    ) {
      throw new Error(`${field} cannot be empty`);
    }
  }
});

// Create and export the model
const Event: Model<IEvent> = model<IEvent>("Event", eventSchema);

export default Event;

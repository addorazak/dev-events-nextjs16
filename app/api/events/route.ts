import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary will automatically use the CLOUDINARY_URL environment variable if it's defined

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    const eventData = Object.fromEntries(formData.entries());

    const file = formData.get("image") as unknown as File;

    // Check if file exists and is not a string (which happens if no file was uploaded or incorrect client-side data)
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "Image file is required and must be a valid file" },
        { status: 400 },
      );
    }

    const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { message: "Invalid image type or size exceeds limit" },
        { status: 400 },
      );
    }

    const tags = JSON.parse(formData.get("tags") as string);
    const agenda = JSON.parse(formData.get("agenda") as string);

    // Ensure it's a valid File object with arrayBuffer method
    if (typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { message: "The uploaded object is not a valid file" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "DevEvents" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        )
        .end(buffer);
    });

    eventData.image = (uploadResult as { secure_url: string }).secure_url;

    const createEvent = await Event.create({
      ...eventData,
      tags: tags,
      agenda: agenda,
    });

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: createEvent,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("Error creating event:", e);

    return NextResponse.json(
      {
        message: "Event creation failed",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Events fetched successfully",
        events,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("Error fetching events:", e);
    return NextResponse.json(
      {
        message: "Event fetching failed",
        error: e,
      },
      { status: 500 },
    );
  }
}

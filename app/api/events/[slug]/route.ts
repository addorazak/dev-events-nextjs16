import Event, { IEvent } from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    slug: string
  }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { slug } = await params;

    // --- Validation: Check if slug is provided ---
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { message: "Event slug is required" },
        { status: 400 },
      );
    }

    const sanitizedSlug = slug.trim().toLowerCase();

    // --- Find event by slug in the database ---
    const event: IEvent | null = await Event.findOne({
      slug: sanitizedSlug,
    }).lean();

    // --- Handle: Event not found ---
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // --- Success: Return event data ---
    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 },
    );
  } catch (e) {
    // console.error(e);

    // --- Handle: Unexpected server errors ---
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

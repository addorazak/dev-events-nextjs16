import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BookEvent from "./BookEvent";
import EventCard from "./EventCard";
import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => {
  return (
    <div className="flex flex-row gap-2 items-center">
      <Image src={icon} alt={alt} width={17} height={17} />
      <p>{label}</p>
    </div>
  );
};

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
  return (
    <div className="agenda">
      <h2>Event Agenda</h2>
      <ul>
        {agendaItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const EventTags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex flex-row gap-2 flex-wrap">
      {tags.map((tag) => (
        <div className="pill" key={tag}>
          {tag}
        </div>
      ))}
    </div>
  );
};

const SimilarEventsSection = async ({ slug }: { slug: string }) => {
  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

  return (
    <div className="w-full flex-col gap-4 pt-20">
      <h2 className="pb-5">Similar Events</h2>
      <div className="events">
        {similarEvents && similarEvents.length > 0 ? (
          similarEvents.map((similarEvent: IEvent) => (
            <EventCard key={similarEvent.title} {...similarEvent} />
          ))
        ) : (
          <p>No similar events found.</p>
        )}
      </div>
    </div>
  );
};

const EventDetails = async ({ slug }: { slug: string }) => {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not set");
  }

  let event;
  try {
    const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!request.ok) {
      if (request.status === 404) {
        return notFound();
      }
      throw new Error(`Failed to fetch event: ${request.statusText}`);
    }

    const response = await request.json();
    event = response.event;

    if (!event) {
      return notFound();
    }
  } catch (error) {
    console.error("Error fetching event data:", error);
    return notFound();
  }

  const {
    description,
    image,
    overview,
    date,
    time,
    location,
    organizer,
    mode,
    agenda,
    audience,
    tags,
  } = event;

  if (!description) return notFound();

  const bookings = 10;

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p className="mt-2">{description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image src={image} alt="Event Banner" width={800} height={800} />

          <section className="flex-col-gap-2">
            <h1>Overview</h1>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
            <EventDetailItem
              icon="/icons/calendar.svg"
              alt="calendar"
              label={date}
            />
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
            <EventDetailItem
              icon="/icons/pin.svg"
              alt="location"
              label={location}
            />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailItem
              icon="/icons/audience.svg"
              alt="audience"
              label={audience}
            />
          </section>
          <EventAgenda agendaItems={agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>

        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} other people who have already booked their spot!
              </p>
            ) : (
              <p>Be the first to book your spot!</p>
            )}

            <BookEvent eventId={event._id} slug={slug} />
          </div>
        </aside>
      </div>

      <Suspense fallback={<div>Loading similar events...</div>}>
        <SimilarEventsSection slug={slug} />
      </Suspense>
    </section>
  );
};

export default EventDetails;

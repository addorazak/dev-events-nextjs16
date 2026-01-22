import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
import { events as dummyEvents } from "@/lib/constants";
import { Suspense } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventsList = async () => {
  let events: IEvent[] = dummyEvents as IEvent[];

  try {
    if (BASE_URL) {
      const response = await fetch(`${BASE_URL}/api/events`, {
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const data = await response.json();
        events = data.events;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch from MongoDB, using dummy data:", error);
  }

  return (
    <div className="mt-7 space-y-7">
      <h3>Featured Events</h3>

      <ul className="events list-none">
        {events?.length ? (
          events.map((event: IEvent) => (
            <li key={event.slug}>
              <EventCard {...event} />
            </li>
          ))
        ) : (
          <li>No events</li>
        )}
      </ul>
    </div>
  );
};

const Page = () => {
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>

      <ExploreBtn />

      <Suspense fallback={<div>Loading events...</div>}>
        <EventsList />
      </Suspense>
    </section>
  );
};

export default Page;

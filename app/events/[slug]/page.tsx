import EventDetails from "@/components/EventDetails";
import { Suspense } from "react";

const EventDetailsContent = async ({ slug }: { slug: string }) => {
  return (
    <main>
      <Suspense fallback={<div>Loading event details...</div>}>
        <EventDetails slug={slug} />
      </Suspense>
    </main>
  );
};

const ParamsWrapper = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  return <EventDetailsContent slug={slug} />;
};

const EventDetailsPage = ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParamsWrapper params={params} />
    </Suspense>
  );
};

export default EventDetailsPage;

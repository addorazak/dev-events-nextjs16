export interface Event {
    title: string;
    image: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}

export const events: Event[] = [
    {
        title: "Next.js Conf 2026",
        image: "/images/event1.png",
        slug: "nextjs-conf-2026",
        location: "San Francisco, CA",
        date: "2026-10-25",
        time: "09:00 AM",
    },
    {
        title: "React Summit",
        image: "/images/event2.png",
        slug: "react-summit",
        location: "Amsterdam, NL",
        date: "2026-06-12",
        time: "10:00 AM",
    },
    {
        title: "Web3 Hackathon",
        image: "/images/event3.png",
        slug: "web3-hackathon",
        location: "Remote",
        date: "2026-03-15",
        time: "08:00 AM",
    },
    {
        title: "AI Developers Meetup",
        image: "/images/event4.png",
        slug: "ai-developers-meetup",
        location: "London, UK",
        date: "2026-02-20",
        time: "06:30 PM",
    },
    {
        title: "Vue Amsterdam",
        image: "/images/event5.png",
        slug: "vue-amsterdam",
        location: "Amsterdam, NL",
        date: "2026-02-12",
        time: "09:00 AM",
    },
    {
        title: "Rust Conf",
        image: "/images/event6.png",
        slug: "rust-conf",
        location: "Portland, OR",
        date: "2026-09-14",
        time: "10:00 AM",
    },
];

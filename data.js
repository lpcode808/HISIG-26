/* ---------------------------------------------------------------------------
   All content lives here. Nothing else needs editing to launch a new event.

   Replace the placeholder values below with the real program. Times are plain
   strings so they render exactly as written on the official schedule -- no
   timezone math, no parsing surprises.

   Session fields:
     day      required, must match one of DATA.days[].id
     start    required, e.g. "9:00 AM"
     end      optional, e.g. "10:15 AM"
     title    required
     track    optional, groups + populates the track filter
     room     optional
     speakers optional array of names; matched by name to DATA.speakers
     abstract optional, shown when the session is expanded
     type     optional: "break" | "plenary" | "session" (default "session")
--------------------------------------------------------------------------- */

const DATA = {
  event: {
    name: "Conference 2026",
    shortName: "Conference 2026",
    kicker: "Annual Meeting",
    tagline: "Replace this line with the event's one-sentence description.",
    dates: "Month 00–00, 2026",
    location: "City, State",
    format: "In person",
    programNote: "",
    registerUrl: "#",
    registerNote: "Registration details go here.",
    officialUrl: "https://example.org/",
    venue: {
      name: "Venue Name",
      address: "000 Street, City, State 00000",
      notes: "Parking, transit, and accessibility notes go here."
    }
  },

  days: [
    { id: "d1", label: "Day 1", date: "Monday, Month 00" },
    { id: "d2", label: "Day 2", date: "Tuesday, Month 00" }
  ],

  sessions: [
    {
      day: "d1",
      start: "8:30 AM",
      end: "9:00 AM",
      title: "Registration & Coffee",
      type: "break",
      room: "Main Lobby"
    },
    {
      day: "d1",
      start: "9:00 AM",
      end: "10:00 AM",
      title: "Opening Keynote",
      type: "plenary",
      room: "Grand Ballroom",
      speakers: ["First Last"],
      abstract: "One or two sentences describing the talk."
    },
    {
      day: "d1",
      start: "10:15 AM",
      end: "11:15 AM",
      title: "Concurrent Session Title",
      track: "Track A",
      room: "Room 101",
      speakers: ["Second Person"],
      abstract: "One or two sentences describing the session."
    },
    {
      day: "d1",
      start: "10:15 AM",
      end: "11:15 AM",
      title: "Another Concurrent Session",
      track: "Track B",
      room: "Room 102",
      speakers: ["Third Person"]
    },
    {
      day: "d2",
      start: "9:00 AM",
      end: "10:00 AM",
      title: "Day Two Plenary",
      type: "plenary",
      room: "Grand Ballroom",
      speakers: ["First Last"]
    },
    {
      day: "d2",
      start: "10:15 AM",
      end: "11:15 AM",
      title: "Closing Panel",
      track: "Track A",
      room: "Room 101",
      speakers: ["Second Person", "Third Person"]
    }
  ],

  speakers: [
    { name: "First Last",     title: "Role",  org: "Organization", bio: "Short bio." },
    { name: "Second Person",  title: "Role",  org: "Organization" },
    { name: "Third Person",   title: "Role",  org: "Organization" }
  ]
};

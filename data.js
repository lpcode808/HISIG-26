/* ---------------------------------------------------------------------------
   ALL CONTENT LIVES HERE. Nothing else needs editing to launch a new event.

   Times are plain strings rendered verbatim, so they match the official
   schedule exactly. The only place a real clock is used is the NOW / Up Next
   badge, which reads `start24`/`end24` + the day's `date` + `event.timeZone`.

   Session fields
     day       required   must match a DATA.days[].id
     start     required   display string, e.g. "9:00 AM"
     end       optional   display string
     start24   optional   "HH:MM" 24h, powers the NOW / Up Next badge
     end24     optional   "HH:MM" 24h
     title     required
     type      optional   "session" (default) | "plenary" | "break"
     track     optional   groups sessions and fills the track filter
     room      optional
     speakers  optional   array of names, matched to DATA.speakers by name
     abstract  optional   official description
     summary   optional   plain-language "why this matters" line

   Speaker fields: name (required), title, org, bio.
--------------------------------------------------------------------------- */

const DATA = {
  event: {
    name: "Conference 2026",
    shortName: "Conference 2026",
    kicker: "Annual Meeting",
    tagline: "Replace this line with the event's one-sentence description.",
    dates: "June 1-2, 2026",
    location: "City, State",
    timeZone: "America/Chicago",   // IANA zone; drives NOW / Up Next
    storagePrefix: "conf26",       // namespaces localStorage keys per event
    registerUrl: "",
    registerNote: "Registration details go here.",
    officialUrl: "https://example.org/",
    venue: {
      name: "Venue Name",
      address: "000 Street, City, State 00000",
      notes: "Parking, transit, and accessibility notes go here."
    }
  },

  // `date` is the calendar date in ISO form; it anchors the live badge.
  days: [
    { id: "d1", label: "Day 1", date: "2026-06-01", dateLabel: "Monday, June 1" },
    { id: "d2", label: "Day 2", date: "2026-06-02", dateLabel: "Tuesday, June 2" }
  ],

  sessions: [
    {
      day: "d1", start: "8:30 AM", end: "9:00 AM",
      start24: "08:30", end24: "09:00",
      title: "Registration & Coffee", type: "break", room: "Main Lobby"
    },
    {
      day: "d1", start: "9:00 AM", end: "10:00 AM",
      start24: "09:00", end24: "10:00",
      title: "Opening Keynote", type: "plenary", room: "Grand Ballroom",
      speakers: ["First Last"],
      abstract: "The official description of the opening keynote goes here.",
      summary: "Plain-language note on why this session is worth your time."
    },
    {
      day: "d1", start: "10:15 AM", end: "11:15 AM",
      start24: "10:15", end24: "11:15",
      title: "Concurrent Session Title", track: "Track A", room: "Room 101",
      speakers: ["Second Person"],
      abstract: "The official session description goes here."
    },
    {
      day: "d1", start: "10:15 AM", end: "11:15 AM",
      start24: "10:15", end24: "11:15",
      title: "Another Concurrent Session", track: "Track B", room: "Room 102",
      speakers: ["Third Person"],
      abstract: "Two sessions sharing a start time group into one slot."
    },
    {
      day: "d1", start: "12:00 PM", end: "1:00 PM",
      start24: "12:00", end24: "13:00",
      title: "Lunch", type: "break", room: "Terrace"
    },
    {
      day: "d2", start: "9:00 AM", end: "10:00 AM",
      start24: "09:00", end24: "10:00",
      title: "Day Two Plenary", type: "plenary", room: "Grand Ballroom",
      speakers: ["First Last"],
      abstract: "The official description of the day two plenary goes here."
    },
    {
      day: "d2", start: "10:15 AM", end: "11:15 AM",
      start24: "10:15", end24: "11:15",
      title: "Closing Panel", track: "Track A", room: "Room 101",
      speakers: ["Second Person", "Third Person"],
      abstract: "The official panel description goes here."
    }
  ],

  speakers: [
    { name: "First Last",    title: "Role", org: "Organization", bio: "Short bio." },
    { name: "Second Person", title: "Role", org: "Organization" },
    { name: "Third Person",  title: "Role", org: "Organization" }
  ]
};

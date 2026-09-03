/* ---------------------------------------------------------------------------
   ALL CONTENT LIVES HERE. Nothing else needs editing to launch a new event.

   Times are plain display strings rendered verbatim, so they match the official
   schedule exactly. `start24`/`end24` (24h, in event.timeZone) additionally
   drive the NOW / Up Next badge and the computed UTC line -- a session without
   them still renders, it just gets neither.

   Session fields
     day       required   must match a DATA.days[].id
     start     required   display string, e.g. "9:00 AM"
     end       optional   display string
     start24   optional   "HH:MM" 24h in event.timeZone
     end24     optional   "HH:MM" 24h in event.timeZone
     title     required
     type      optional   "session" (default) | "plenary" | "break"
     track     optional   groups sessions and fills the track filter
     room      optional
     sponsor   optional   credit line shown on the card
     speakers  optional   array of names, matched to DATA.speakers by name
     abstract  optional   official description
     summary   optional   plain-language "why this matters" line
     links     optional   array of { label, url } shown as a row of links

   Speaker fields: name (required), title, org, bio, url.
   `url` makes the "title, org" line a link -- use the destination the official
   program page points at for that person (their org page, faculty bio, etc.).
--------------------------------------------------------------------------- */

const DATA = {
  event: {
    name: "HiSIG 2026",
    shortName: "HiSIG 2026",
    kicker: "Hawaiʻi School on Internet Governance",
    tagline: "Navigating Global Digital Governance",
    dates: "Friday, September 4, 2026",
    location: "Mililani, Hawaiʻi",
    timeZone: "Pacific/Honolulu",   // HST (UTC−10); drives NOW / Up Next + UTC line
    storagePrefix: "hisig26",       // namespaces localStorage keys per event
    registerUrl: "",
    registerNote: "",
    officialUrl: "https://www.hisig.org/program/",
    venue: {
      name: "Servpac — Activity Room, Mililani Tech Park",
      address: "200 Kahelu Ave, Mililani, HI 96789",
      notes: "Doors open at 8:30 am. All times are Hawaiʻi Standard Time (HST, UTC−10)."
    },
    sponsors: [
      { text: "Technical Production sponsored by the Internet Society",
        url: "https://www.internetsociety.org/" },
      { text: "Facilities sponsored by Servpac", url: "https://servpac.com/" }
    ],
    /* Footer credit for whoever built the site. Clear `text` to drop the line. */
    credit: {
      text: "Made at the TechZone — Hawaiʻi School for Girls at La Pietra",
      url: "https://www.hawaiischoolforgirls.org/academics/techzone"
    }
  },

  days: [
    { id: "d1", label: "Friday", date: "2026-09-04", dateLabel: "Friday, September 4" }
  ],

  sessions: [
    {
      day: "d1", start: "8:30 AM", end: "9:00 AM",
      start24: "08:30", end24: "09:00",
      title: "Registration / Breakfast",
      type: "break",
      sponsor: "Sponsored by Servpac"
    },
    {
      day: "d1", start: "9:00 AM", end: "9:15 AM",
      start24: "09:00", end24: "09:15",
      title: "Blessings and Welcome Messages",
      type: "plenary",
      speakers: ["Burt Lum"],
      abstract: "Welcome and opening remarks by the HiSIG 2026 Chair, ServPac host, and other introductions by the MC."
    },
    {
      day: "d1", start: "9:15 AM", end: "10:00 AM",
      start24: "09:15", end24: "10:00",
      title: "Keynote — State of the Internet",
      type: "plenary",
      speakers: ["Vint Cerf"],
      abstract: "The Internet is one of the most transformative innovations in human history. By democratizing access to information, the Internet has revolutionized how we exchange ideas, conduct business, and connect with others. Indeed, the Internet has become the lifeblood of our global society.\n\nThis session will provide a brief history of the Internet in Hawaii and discuss how the Internet continues to evolve and develop. Our goal is to ensure that the Internet continues to be an incredible force for good."
    },
    {
      day: "d1", start: "10:00 AM", end: "10:15 AM",
      start24: "10:00", end24: "10:15",
      title: "Break and Networking",
      type: "break",
      sponsor: "Sponsored by Servpac"
    },
    {
      day: "d1", start: "10:15 AM", end: "11:15 AM",
      start24: "10:15", end24: "11:15",
      title: "Understanding Internet Governance",
      speakers: ["Fiona Alexander", "Ron da Silva"],
      abstract: "Review the basic concepts of Internet governance, its stakeholders, and the fundamental principles guiding its development. Everything rides on the Internet. Does the term Internet Governance also include A.I., data and digital technologies?"
    },
    {
      day: "d1", start: "11:15 AM", end: "12:15 PM",
      start24: "11:15", end24: "12:15",
      title: "The Multistakeholder Model",
      speakers: ["Naela Sarras", "Jen Chung", "Avri Doria"],
      abstract: "The concept used in Internet Governance is widely known as the Multistakeholder Model is second nature to many folks especially those involved with ICANN, IGF, and ISOC. This session that will explore the historical context of this term and its evolution as the de facto standard for Internet organizations. We will also discuss how this process remains inclusive of all voices, with a specific focus on multilingual and indigenous perspectives."
    },
    {
      day: "d1", start: "12:15 PM", end: "1:00 PM",
      start24: "12:15", end24: "13:00",
      title: "Lunch",
      type: "break",
      sponsor: "Sponsored by the Internet Society"
    },
    {
      day: "d1", start: "1:00 PM", end: "2:00 PM",
      start24: "13:00", end24: "14:00",
      title: "Indigenous Knowledge in the Digital Age",
      speakers: ["Sharayah Lane", "Leimomi Bong", "Olin Kealoha Lagon", "Richard Ng"],
      abstract: "In the digital age, Indigenous Knowledge is no longer just ancestral heritage; it is a vital pillar of data sovereignty. As AI evolves, the focus shifts toward “Sovereign AI”, ensuring Indigenous communities control how their traditional wisdom is digitized, protected, and utilized, preventing extraction while fostering innovation that respects cultural protocols and self-determination."
    },
    {
      day: "d1", start: "2:00 PM", end: "3:00 PM",
      start24: "14:00", end24: "15:00",
      title: "Digital Equity and Inclusive Internet Access",
      speakers: ["Colin Rhinesmith", "Monique Tate", "Burt Lum"],
      abstract: "At a time when the world is accelerating towards an increasingly digital future, it is paramount to ensure that everyone, regardless of their ethnic, gender, age and socio-economic background, has access to the Internet and the skills to navigate and utilize it effectively."
    },
    {
      day: "d1", start: "3:00 PM", end: "4:00 PM",
      start24: "15:00", end24: "16:00",
      title: "Trust, Safety, and Risk in a Connected AI World",
      speakers: ["Edmon Chung", "Graeme Bunton", "David Huberman"],
      abstract: "This panel explores how trust is built and broken in a world where AI systems are increasingly networked across devices, platforms, and critical services. We’ll highlight the upside of connected AI through better personalization, faster decisions, and improved accessibility. This alongside real tradeoffs like expanded attack surfaces, privacy leakage, bias and unequal impacts at scale, and cascading failures when one component goes wrong. Panelists will discuss practical approaches to safety and risk management, including secure-by-design architectures, human oversight, transparency and auditability, governance and compliance, and incident response strategies that keep innovation moving without eroding public confidence."
    },
    {
      day: "d1", start: "4:30 PM", end: "6:30 PM",
      start24: "16:30", end24: "18:30",
      title: "Pau Hana Reception",
      room: "604 Clubhouse, 199 Leilehua Golf Course Rd, Wahiawa, HI 96786",
      sponsor: "Sponsored by the Internet Society · Special mahalo to ID8",
      abstract: "Special viewing of The 100th, Seeds of Aloha (time permitting).",
      summary: "Different venue from the daytime program — about a 15 minute drive from Mililani Tech Park.",
      links: [
        { label: "604 Clubhouse", url: "https://604clubhouse.com/" },
        { label: "The 100th, Seeds of Aloha", url: "https://100thfilm.org/" },
        { label: "ID8", url: "https://id8.org/" }
      ]
    }
  ],

  speakers: [
    { name: "Burt Lum",           title: "Chair and Master of Ceremony", org: "HiSIG 2026 · Internet Society Hawaiʻi",
      url: "" },
    { name: "Vint Cerf",          title: "Chief Internet Evangelist",    org: "Google",
      url: "https://research.google/people/author32412/?type=google" },
    { name: "Fiona Alexander",    title: "IGF MAG",                      org: "American University",
      url: "https://www.american.edu/sis/faculty/fionaa.cfm" },
    { name: "Ron da Silva",       title: "",                             org: "IGF-USA",
      url: "https://igfusa.us/" },
    { name: "Naela Sarras",       title: "",                             org: "ICANN",
      url: "https://www.icann.org/en/announcements/details/naela-sarras-appointed-icann-vice-president-of-stakeholder-engagement-in-north-america-17-9-2020-en" },
    { name: "Jen Chung",          title: "VP Policy",                    org: "Dot.Asia",
      url: "https://www.intgovforum.org/en/content/chung-jennifer" },
    { name: "Avri Doria",         title: "",                             org: "Technicalities",
      url: "https://www.icann.org/resources/pages/teg-member-biographies-2019-02-13-en" },
    { name: "Sharayah Lane",      title: "",                             org: "Internet Society",
      url: "https://www.internetsociety.org/author/lane/" },
    { name: "Leimomi Bong",       title: "",                             org: "Office of Indigenous Knowledge",
      url: "https://research.hawaii.edu/oiki/" },
    { name: "Olin Kealoha Lagon", title: "Serial Social Entrepreneur",   org: "",
      url: "https://www.linkedin.com/in/olinlagon" },
    { name: "Richard Ng",         title: "",                             org: "IndigiDAO",
      url: "https://solve.mit.edu/solutions/90275" },
    { name: "Colin Rhinesmith",   title: "",                             org: "University of Illinois Urbana-Champaign",
      url: "https://ischool.illinois.edu/people/colin-rhinesmith" },
    { name: "Monique Tate",       title: "",                             org: "Community Tech New York",
      url: "https://www.communitytechny.org/community-tech-lab" },
    { name: "Edmon Chung",        title: "",                             org: "Dot.Asia",
      url: "https://www.dot.asia/" },
    { name: "Graeme Bunton",      title: "",                             org: "NetBeacon",
      url: "https://netbeacon.org/" },
    { name: "David Huberman",     title: "",                             org: "ICANN",
      url: "https://www.icann.org/profiles/116347" }
  ]
};

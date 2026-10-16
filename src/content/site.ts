// Every fact on the site comes from globalvirtualexperts.com (exported Oct 2026).
// Copy has been rewritten to be short and plain; nothing here is invented.

export const contact = {
  email: "hello@globalvirtualexperts.com",
  careersEmail: "careers@globalvirtualexperts.com",
  phone: "(206) 455-8605",
  phoneHref: "tel:+12064558605",
  salesPhone: "(206) 876-8829",
  salesPhoneHref: "tel:+12068768829",
  location: "Seattle, WA, USA",
  depositLink: "https://link.fastpaydirect.com/payment-link/69bc7bf0c1b7344f595a5f73",
  youtube: "https://www.youtube.com/@gvecareers",
  instagram: "https://www.instagram.com/gvecareers/",
  googleBusinessProfile: "https://share.google/J4HIrJlOjA3Ttos4z",
};

export const nav = [
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/client-stories", label: "Client Stories" },
  { href: "/stories", label: "Meet the Experts" },
  { href: "/about", label: "About" },
];

export type TaskGroup = { title: string; items: string[] };
export type Service = {
  slug: string;
  name: string;
  short: string;
  /** The page heading: names the service so search engines and readers see it first. */
  tagline: string;
  intro: string;
  seoTitle: string;
  metaDescription: string;
  group: "Construction & trades" | "Admin & operations" | "Sales & marketing" | "Design & web";
  groups: TaskGroup[];
  proof?: { text: string; person?: string };
};

export const services: Service[] = [
  {
    slug: "project-management",
    name: "Project management",
    short: "Permits, job schedules, subs, change orders.",
    tagline: "Virtual project management support.",
    seoTitle: "Virtual Project Management Support",
    metaDescription:
      "Get a virtual assistant for permits, job schedules, subcontractors, COIs and lien waivers, change orders, and job costs, in tools like Buildertrend and JobTread.",
    intro:
      "Get help with permits, job schedules, subs and vendors, and change orders, in tools like Buildertrend and JobTread.",
    group: "Construction & trades",
    groups: [
      { title: "Permits & paperwork", items: ["Prepare and track permit applications", "Keep crew documents current"] },
      { title: "Job schedules", items: ["Build and update job schedules", "Rework plans when things change"] },
      { title: "Subs & vendors", items: ["Coordinate subcontractors and vendors", "Collect COIs and lien waivers"] },
      { title: "Change orders & job costs", items: ["Write up and track change orders", "Track job costs and material orders"] },
      { title: "Updates", items: ["Keep homeowners and crews informed", "Send you a daily task report"] },
      { title: "Project software", items: ["Keep Buildertrend or JobTread up to date", "Keep project files current"] },
    ],
    proof: {
      text: "At Silver Peak Design Build, Kate moved into pre-production management in her first year, handling permits, crew documents and material orders.",
      person: "kate",
    },
  },
  {
    slug: "cad-drafting",
    name: "CAD drafting",
    short: "Plans, models, as-builts.",
    tagline: "Virtual CAD drafting support.",
    seoTitle: "Remote CAD Drafting Services",
    metaDescription:
      "Hire a remote CAD drafter for 2D plans, 3D models, as-builts, revisions, and renderings for architecture, construction, and engineering projects.",
    intro:
      "2D plans, 3D models, as-builts and revisions for architecture, construction and engineering projects.",
    group: "Construction & trades",
    groups: [
      { title: "2D & 3D drafting", items: ["Plans and 3D models", "MEP drafting and detailing", "Structural and civil layouts"] },
      { title: "Design development", items: ["Concepts turned into technical drawings", "Construction documents to industry standards"] },
      { title: "As-builts & revisions", items: ["As-builts from field measurements", "Revisions that meet project requirements"] },
      { title: "Coordination", items: ["Work with your team, PMs and engineers", "Fold in design changes quickly"] },
      { title: "3D renderings", items: ["Show clients the proposed design", "Prepare renderings for proposals and presentations"] },
    ],
    proof: {
      text: "Kate works directly with homeowners and builders, turning renovation ideas into buildable plans, from kitchen upgrades to full extensions.",
      person: "kate",
    },
  },
  {
    slug: "dispatch-logistics",
    name: "Dispatch & logistics",
    short: "Crews, service calls, routes.",
    tagline: "Virtual dispatch and logistics support.",
    seoTitle: "Virtual Dispatch & Logistics Support",
    metaDescription:
      "Get a virtual dispatcher to schedule crews and service calls, plan routes, update customers, and keep records current in Jobber or ServiceTitan.",
    intro:
      "Get help scheduling crews and service calls, planning routes, and updating customers, in tools like Jobber and ServiceTitan.",
    group: "Construction & trades",
    groups: [
      { title: "Dispatch", items: ["Schedule crews and service calls", "Coordinate drivers and customers in real time", "Keep Jobber or ServiceTitan current"] },
      { title: "Load planning", items: ["Plan daily routes", "Manage pickups and deliveries", "Handle last-minute changes"] },
      { title: "Customer updates", items: ["Real-time shipment status", "Handle delays and complaints"] },
      { title: "Fleet & inventory", items: ["Maintenance schedules and safety compliance", "Fuel and cost tracking", "Stock levels and supplier restocks"] },
      { title: "Reporting", items: ["Shipment and delivery data", "Delivery performance reports"] },
    ],
  },
  {
    slug: "executive-assistant",
    name: "Executive & admin assistance",
    short: "Inbox, calendar, documents, follow-ups.",
    tagline: "Executive virtual assistant support.",
    seoTitle: "Executive Virtual Assistant Services",
    metaDescription:
      "Hire an executive virtual assistant for email, scheduling, documents, client follow-ups, data entry, and travel bookings. Screened and supported by GVE.",
    intro:
      "An assistant for email, scheduling, documents, client follow-ups, and travel bookings.",
    group: "Admin & operations",
    groups: [
      { title: "Email & calendar", items: ["Sort and prioritize email", "Book meetings and appointments", "Keep the calendar matched to your priorities"] },
      { title: "Documents", items: ["Create and edit docs, sheets and decks", "Keep digital files organized", "Prepare reports and summaries"] },
      { title: "Client follow-ups", items: ["Answer client emails and inquiries", "Send follow-ups on time", "Keep a professional tone on every channel"] },
      { title: "Projects & tasks", items: ["Track deadlines and milestones", "Manage task lists", "Send updates to your team"] },
      { title: "Data entry", items: ["Keep client databases accurate", "Maintain records", "Pull reports when you need them"] },
      { title: "Travel & expenses", items: ["Book flights, hotels and transport", "Track spending against budget", "Prepare expense reports"] },
    ],
  },
  {
    slug: "bookkeeping",
    name: "Bookkeeping",
    short: "Invoices, reconciliation, reports.",
    tagline: "Virtual bookkeeping for your business.",
    seoTitle: "Virtual Bookkeeping Services",
    metaDescription:
      "Hire a virtual bookkeeper for invoices, reconciliation, payroll, and job costs in QuickBooks, with organized records for your accountant.",
    intro:
      "Help with invoices, reconciliation, payroll, and job costs in QuickBooks, plus reports for your accountant.",
    group: "Admin & operations",
    groups: [
      { title: "Payables & receivables", items: ["Pay vendors and send invoices", "Track bills, receipts and payments", "Follow up on collections"] },
      { title: "Reconciliation", items: ["Reconcile bank and card accounts monthly", "Catch discrepancies early", "Report on cash flow"] },
      { title: "Reporting", items: ["Prepare financial statements and custom reports", "Track job costs, income and expenses"] },
      { title: "Payroll", items: ["Run payroll on time", "Manage employee data and deductions"] },
      { title: "Expenses & budget", items: ["Categorize expenses and receipts", "Track spending against budget"] },
      { title: "Tax prep support", items: ["Prepare documents for filing", "Give your accountant accurate records"] },
    ],
    proof: {
      text: "Hannah, our Finance Manager, built her bookkeeping skills working hands-on with our accountant.",
      person: "hannah",
    },
  },
  {
    slug: "customer-support",
    name: "Customer support",
    short: "Email, phone, chat and social.",
    tagline: "Virtual customer support assistants.",
    seoTitle: "Virtual Customer Support Services",
    metaDescription:
      "Hire a virtual customer support assistant to answer email, calls, chat, and social messages, follow up on issues, and keep customer records current.",
    intro:
      "An assistant to answer questions, follow up on issues, and update customer records by email, phone, chat, or social media.",
    group: "Admin & operations",
    groups: [
      { title: "Inquiries", items: ["Answer email, calls and chat", "Book service calls and appointments", "Escalate complex issues to the right person"] },
      { title: "Problem solving", items: ["Resolve complaints", "Troubleshoot product or service issues", "Check back to make sure it's fixed"] },
      { title: "Accounts & orders", items: ["Handle account questions", "Manage subscriptions and updates", "Process orders and returns"] },
      { title: "Feedback", items: ["Collect customer feedback", "Report patterns and suggest fixes"] },
      { title: "Onboarding & retention", items: ["Walk new customers through setup", "Check in with existing ones"] },
    ],
  },
  {
    slug: "sales-and-crm",
    name: "Lead outreach & CRM",
    short: "Leads, estimate follow-ups, CRM updates.",
    tagline: "Virtual assistants for leads and CRM.",
    seoTitle: "Lead Outreach & CRM Virtual Assistants",
    metaDescription:
      "Get a virtual assistant to research leads, contact prospects, book appointments, and keep your CRM pipeline and follow-ups up to date.",
    intro:
      "Get help researching leads, following up on estimates and bids, booking appointments, and updating your CRM.",
    group: "Sales & marketing",
    groups: [
      { title: "Prospecting", items: ["Find and qualify leads", "Build targeted contact lists"] },
      { title: "Outreach", items: ["Cold calls, email and social outreach", "Steady follow-up with every prospect"] },
      { title: "Appointment setting", items: ["Book calls and demos", "Confirm meetings and prep the details"] },
      { title: "CRM", items: ["Keep your pipeline current", "Track reminders and follow-ups", "Report on leads and conversions"] },
      { title: "Estimates & bids", items: ["Send estimates and follow up with homeowners", "Spot where prospects drop off"] },
    ],
  },
  {
    slug: "marketing",
    name: "Social media & email marketing",
    short: "Posts, campaigns, SEO, ads.",
    tagline: "Social media and email marketing support.",
    seoTitle: "Social Media & Email Marketing Assistants",
    metaDescription:
      "Hire a virtual marketing assistant to create and schedule social posts, send email campaigns, support SEO and ads, and report on results.",
    intro:
      "Get help creating posts, sending email campaigns, managing ads, and tracking results.",
    group: "Sales & marketing",
    groups: [
      { title: "Social media", items: ["Create and schedule posts", "Manage comments and community", "Run social campaigns and ads"] },
      { title: "Email marketing", items: ["Campaigns and follow-up sequences", "Manage and segment your lists", "Track opens and clicks"] },
      { title: "SEO", items: ["Keyword research", "On-page and off-page optimization", "Track rankings and traffic"] },
      { title: "Paid ads", items: ["Google and Facebook ads", "Manage ad budgets", "Targeted campaigns"] },
      { title: "Reporting", items: ["Report website traffic, conversions, and ad results"] },
    ],
  },
  {
    slug: "copywriting",
    name: "Copywriting",
    short: "Web pages, blogs, emails, ads.",
    tagline: "Virtual copywriting for your business.",
    seoTitle: "Virtual Copywriting Services",
    metaDescription:
      "Get a virtual copywriter for website pages, blog posts, emails, ads, and sales materials, written for your customers and for search engines.",
    intro:
      "Website pages, blog posts, emails, ads and sales materials, written for your customers and for search engines.",
    group: "Sales & marketing",
    groups: [
      { title: "Website copy", items: ["Pages written for readers and search", "Product and service descriptions"] },
      { title: "Blogs & articles", items: ["Research and write blog posts", "Edit articles for clarity and search"] },
      { title: "Email", items: ["Newsletters, promotions, and follow-up emails", "Subject lines and calls to action"] },
      { title: "Social & ads", items: ["On-brand social posts", "Ad copy for Facebook, Instagram and LinkedIn"] },
      { title: "Sales materials", items: ["Brochures, flyers and sales letters", "eBooks and whitepapers that capture leads"] },
    ],
  },
  {
    slug: "graphic-design",
    name: "Graphic design",
    short: "Logos, social graphics, print, presentations.",
    tagline: "Virtual graphic design support.",
    seoTitle: "Virtual Graphic Design Services",
    metaDescription:
      "Hire a virtual graphic designer for logos, social graphics, print materials, presentations, and web assets that follow your brand guidelines.",
    intro:
      "Get help designing logos, social graphics, print materials, and presentations using your brand guidelines.",
    group: "Design & web",
    groups: [
      { title: "Branding", items: ["Logos, colors and brand guidelines", "One look across digital and print"] },
      { title: "Marketing materials", items: ["Brochures, flyers and business cards", "Banners and ad graphics"] },
      { title: "Social graphics", items: ["Posts, covers and ads", "Reusable on-brand templates"] },
      { title: "Web & app", items: ["Page layouts and visual assets", "UI elements for apps"] },
      { title: "Presentations", items: ["Pitch and client presentations", "Charts and slide layouts"] },
      { title: "Illustration", items: ["Custom illustrations and icons", "Infographics"] },
    ],
  },
  {
    slug: "web-development",
    name: "Web development",
    short: "Builds, updates, fixes.",
    tagline: "Virtual web development support.",
    seoTitle: "Virtual Web Development Services",
    metaDescription:
      "Hire a virtual web developer for custom builds, online stores, updates, and fixes on WordPress, Shopify, Magento, and more.",
    intro:
      "Custom builds, online stores, updates and fixes on WordPress, Shopify, Magento and more.",
    group: "Design & web",
    groups: [
      { title: "Custom sites", items: ["Build business websites", "Create layouts for phones, tablets, and desktop"] },
      { title: "Maintenance", items: ["Updates and security", "Bug fixes and speed improvements"] },
      { title: "Online stores", items: ["Set up checkout", "Create product catalogs and store pages"] },
      { title: "CMS work", items: ["WordPress, Shopify and Magento", "Custom themes and plugins"] },
      { title: "SEO & analytics", items: ["Search best practices", "Analytics set up and reported"] },
      { title: "Redesigns", items: ["Refresh design and usability", "Add features as you grow"] },
    ],
  },
];

export const team = [
  { name: "Alma", role: "Managing Director", img: "/team/alma.webp" },
  { name: "Ernest", role: "Technical Operations Manager", img: "/team/ernest.webp" },
  { name: "Anna", role: "Operations & Growth Lead", img: "/team/anna.webp" },
  { name: "Hannah", role: "Finance Manager & Bookkeeper", img: "/team/hannah.webp" },
  { name: "Laila", role: "Sales Development Rep", img: "/team/laila.webp" },
  { name: "Kate", role: "Architectural Drafter & Designer", img: "/team/kate.webp" },
  { name: "Jimbert", role: "Social Media & Content Manager", img: "/team/jimbert.webp" },
  { name: "Mae", role: "General Admin Assistant", img: "/team/mae.webp" },
  { name: "Loury", role: "General Admin Assistant", img: "/team/loury.png" },
  { name: "Roe", role: "Executive Admin", img: "/team/roe.webp" },
  { name: "Bern", role: "Executive Admin", img: "/team/bern.png" },
  { name: "Joy", role: "Executive Admin", img: "/team/joy.webp" },
  { name: "Rej", role: "Executive Admin", img: "/team/rej.webp" },
  { name: "Aina", role: "Executive Admin", img: "/team/aina.webp" },
  { name: "Jay", role: "Executive Admin", img: "/team/jay.webp" },
  { name: "MJ", role: "Executive Admin", img: "/team/mj.webp" },
  { name: "Irene", role: "Executive Admin", img: "/team/irene.webp" },
  { name: "Jermaine", role: "Executive Admin", img: "/team/jermaine.webp" },
];

// Short, verbatim excerpts from reviews published on the current site.
export const testimonials = [
  { quote: "I used to work 12+ hours a day—now I work smarter, not harder.", name: "Marcus", role: "Consultant" },
  { quote: "I've reclaimed my evenings, and for the first time in years, I don't wake up in a panic.", name: "Sarah", role: "Founder" },
  { quote: "I don't think it would be possible for me to do my job effectively without the help and suggestions we've received.", name: "Martha", role: "Manager" },
  { quote: "GVE is fantastic, they have helped me to get started with my first VEA and given her all the support for her to be successful.", name: "Josiah", role: "CEO" },
  { quote: "Their team came in like a calm breeze, organizing my digital life and taking small—but essential—tasks off my plate.", name: "John", role: "Service Provider" },
];

export const partners = [
  { name: "Calistar Management", img: "/partners/calistar-management.png" },
  { name: "Big Bear Automatic Gates", img: "/partners/big-bear-logo.jpg" },
  { name: "onebio.space", img: "/partners/onebio.png" },
  { name: "Navo Builders", img: "/partners/navo-builders.webp" },
  { name: "High Desert Homes", img: "/partners/high-desert-homes.png" },
  { name: "Hill Mortgage", img: "/partners/hill-mortgage.png" },
  { name: "The Window & Door Shoppe", img: "/partners/window-door-shoppe.png" },
  { name: "Izozi", img: "/partners/izozi.png" },
  { name: "Silver Peak Design Build", img: "/partners/silver-peak.png" },
  { name: "Antler Tax & Accounting", img: "/partners/antler.png" },
  { name: "MW Design Workshop", img: "/partners/mw-design.png" },
  { name: "River Roofing", img: "/partners/river-roofing.png" },
  { name: "Truss Payments", img: "/partners/truss.png" },
];

// Video IDs and these short captions were checked against the current success-story page.
export const stories = [
  { name: "Ernest", role: "Technical Operations Manager", img: "/team/ernest.webp", video:"vVj07FcQABo", text: "Manages GVE’s technical systems and daily operations." },
  { name: "Evander", role: "Executive Admin", video:"Je7Di4CWWk4", text: "Supports calendars, content, and bookkeeping." },
  { name: "Hannah", role: "Finance Manager & Bookkeeper", img: "/team/hannah.webp", video:"hgE0tnptJb8", text: "Developed her bookkeeping skills alongside GVE’s accountant." },
  { name: "Boy", role: "Draftsman & Designer", video:"-TWxzWlfukA", text: "Supports drafting and design for professionals and homeowners." },
  { name: "Kate", role: "Architectural Drafter & Designer", img: "/team/kate.webp", video:"GawQr_6qCKk", text: "Turns renovation ideas into plans for homeowners and builders." },
  { name: "Loury", role: "General Admin Assistant", img: "/team/loury.png", video:"rG7ysQoPUP4", text: "Handles email, calendars, graphics, social media, and calls." },
];

export const faq: { topic: string; items: { q: string; a: string }[] }[] = [
  {
    topic: "The Experts",
    items: [
      { q: "Who will I be working with?", a: "Skilled professionals based in the Philippines. Each one passes a multi-step screening with assessments and interviews." },
      { q: "Do they speak English well?", a: "Yes. Spoken and written English is part of our hiring criteria." },
      { q: "What can I hand off?", a: "Permits and paperwork, job schedules, estimate follow-ups, bookkeeping, customer calls, email and calendar, social media, research and more." },
      { q: "Is my Expert shared with other clients?", a: "Full-time Experts work only for you during their hours. Part-time Experts may support another client, but your booked hours are yours alone." },
    ],
  },
  {
    topic: "Hours",
    items: [
      { q: "What hours will they work?", a: "You choose. Most clients book 4- or 8-hour shifts during their business hours." },
      { q: "Can they work in my time zone?", a: "Yes. Most of our clients are in the U.S., and we also work with businesses in Europe and Australia." },
      { q: "Weekends and holidays?", a: "Yes, if you need it. We build the schedule around your business." },
    ],
  },
  {
    topic: "Getting started",
    items: [
      { q: "How do I start?", a: "Request a free call. After you pay the search deposit, we prepare your job description for your approval, screen candidates, and schedule final interviews so you can choose your Expert." },
      { q: "How long does hiring take?", a: "Usually 5–10 business days. If you need someone sooner, we may have pre-vetted Experts ready to go." },
      { q: "Can I interview candidates first?", a: "Yes. You get a shortlist and you pick who you work with." },
      { q: "What happens after I choose?", a: "We finalize your service agreement, set a start date, help with onboarding and assign you a client success manager." },
    ],
  },
  {
    topic: "Pricing",
    items: [
      { q: "How much does it cost?", a: "It depends on the role, experience level and hours. Pricing is a flat monthly rate, all-inclusive. Contact us for a quote." },
      { q: "Is there a search deposit?", a: "Yes. A $1,000 deposit starts the search. It is refundable if we do not present at least two qualified candidates who match the job description we both approved. See Start your search for the full terms." },
      { q: "How do I pay?", a: "ACH transfer through our secure payment portal, or any major credit card. Card payments carry a 3.5% transaction fee." },
    ],
  },
  {
    topic: "Tracking & support",
    items: [
      { q: "How do I see what's getting done?", a: "A time tracker records hours, and you get a daily report of completed tasks." },
      { q: "Who do I call if something's off?", a: "Your client success manager. They handle feedback, changes and concerns." },
      { q: "What if it's not the right fit?", a: "We'll replace your Expert promptly, at no extra cost." },
    ],
  },
  {
    topic: "Security & tools",
    items: [
      { q: "How is my data protected?", a: "Every Expert signs a strict NDA and is trained in data protection, secure file handling and confidentiality." },
      { q: "Can they sign my NDA too?", a: "Yes." },
      { q: "What equipment do they use?", a: "Reliable internet, headsets and computers. Experts work in tools like QuickBooks, Buildertrend, JobTread, Jobber and ServiceTitan, and we train them on any other software you use." },
      { q: "Can they make international calls?", a: "Yes, with access to the tools you authorize, such as VoIP." },
    ],
  },
];

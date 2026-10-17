// One page per business type, for people searching for a virtual assistant in their trade.
// Tasks, tools and client names are the ones GVE confirmed for each kind of client.
import { segments, type Segment, type SegmentId } from './segments';

export type IndustryTask = { title: string; items: string[]; service: string };
export type Industry = {
  id: SegmentId;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  tasks: IndustryTask[];
  tools: string[];
  /** Client logos shown on the page, by their names in `partners`. */
  clients: string[];
  /** A client interview from client-stories.ts, or the founder's story. */
  story?: 'founder' | string;
  faq: string[];
};

export const industries: Industry[] = [
  {
    id: 'builders', slug: 'contractors-remodelers',
    seoTitle: 'Virtual Assistants for Contractors & Remodelers',
    metaDescription: 'Hire a virtual assistant for your construction business: permits, job schedules, subcontractors, change orders, estimates, and bookkeeping in Buildertrend, JobTread, and QuickBooks.',
    title: 'Virtual assistants for contractors and remodelers.',
    intro: 'Hand off permits, job schedules, change orders, and homeowner updates to a screened Expert who works your hours.',
    tasks: [
      { title: 'Permits & paperwork', items: ['Prepare and track permit applications', 'Keep crew documents current'], service: 'project-management' },
      { title: 'Job schedules', items: ['Build and update job schedules', 'Coordinate subcontractors and vendors'], service: 'project-management' },
      { title: 'Change orders & job costs', items: ['Write up and track change orders', 'Track job costs and material orders'], service: 'project-management' },
      { title: 'Subs, COIs & lien waivers', items: ['Collect COIs and lien waivers', 'Keep subcontractor records current'], service: 'project-management' },
      { title: 'Estimates & homeowners', items: ['Send estimates and follow up with homeowners', 'Keep homeowners updated'], service: 'sales-and-crm' },
      { title: 'Drafting', items: ['2D plans, 3D models and as-builts', 'Revisions and renderings'], service: 'cad-drafting' },
    ],
    tools: ['Buildertrend', 'JobTread', 'QuickBooks'],
    clients: ['Silver Peak Design Build', 'Navo Builders', 'High Desert Homes'],
    story: 'founder',
    faq: ['How long does hiring take?', 'Can they work in my time zone?', 'What equipment do they use?', 'How much does it cost?'],
  },
  {
    id: 'roofing', slug: 'roofing-trades',
    seoTitle: 'Virtual Assistants for Roofing Companies & Trades',
    metaDescription: 'Hire a virtual assistant for your roofing or trade business: estimate follow-ups, crew schedules, material orders, invoices, and payroll in QuickBooks, Buildertrend, and JobTread.',
    title: 'Virtual assistants for roofing companies and trades.',
    intro: 'Hand off estimate follow-ups, crew schedules, material orders, and invoices to a screened Expert who works your hours.',
    tasks: [
      { title: 'Estimates & follow-ups', items: ['Send estimates and follow up with homeowners', 'Book inspections and appointments'], service: 'sales-and-crm' },
      { title: 'Crew schedules', items: ['Build and update crew schedules', 'Keep homeowners and crews informed'], service: 'project-management' },
      { title: 'Material orders & job costs', items: ['Track material orders', 'Track job costs and change orders'], service: 'project-management' },
      { title: 'Permits & paperwork', items: ['Prepare and track permit applications', 'Collect COIs and lien waivers'], service: 'project-management' },
      { title: 'Invoices & payroll', items: ['Send invoices and track payments', 'Run payroll on time'], service: 'bookkeeping' },
      { title: 'Customer calls', items: ['Answer calls, email and chat', 'Book service calls and appointments'], service: 'customer-support' },
    ],
    tools: ['QuickBooks', 'Buildertrend', 'JobTread'],
    clients: ['River Roofing', 'The Window & Door Shoppe', 'Big Bear Automatic Gates'],
    story: 'river-roofing',
    faq: ['How long does hiring take?', 'Can they work in my time zone?', 'What equipment do they use?', 'How much does it cost?'],
  },
  {
    id: 'home-services', slug: 'home-services',
    seoTitle: 'Virtual Assistants for Home Service Businesses',
    metaDescription: 'Hire a virtual assistant for your home service business: service calls and dispatch in Jobber or ServiceTitan, customer messages, review requests, and invoices.',
    title: 'Virtual assistants for home service businesses.',
    intro: 'Hand off service calls, dispatch, customer messages, and invoices to a screened Expert who works your hours.',
    tasks: [
      { title: 'Service calls & dispatch', items: ['Schedule crews and service calls', 'Plan daily routes'], service: 'dispatch-logistics' },
      { title: 'Customer messages', items: ['Answer calls, email and chat', 'Book service calls and appointments'], service: 'customer-support' },
      { title: 'Review requests', items: ['Send review requests after each job', 'Book the next service'], service: 'customer-support' },
      { title: 'Estimates & follow-ups', items: ['Send estimates and follow up', 'Keep your CRM current'], service: 'sales-and-crm' },
      { title: 'Invoices', items: ['Send invoices and log payments', 'Reconcile accounts monthly'], service: 'bookkeeping' },
      { title: 'Job software', items: ['Keep Jobber or ServiceTitan current', 'Keep customer records accurate'], service: 'dispatch-logistics' },
    ],
    tools: ['Jobber', 'ServiceTitan', 'QuickBooks'],
    clients: [],
    faq: ['How long does hiring take?', 'Can they work in my time zone?', 'Weekends and holidays?', 'How much does it cost?'],
  },
  {
    id: 'property', slug: 'property-management',
    seoTitle: 'Virtual Assistants for Property Managers',
    metaDescription: 'Hire a virtual assistant for your property management business: work orders, tenant messages, vendor scheduling, owner reports, and bookkeeping in QuickBooks.',
    title: 'Virtual assistants for property managers.',
    intro: 'Hand off work orders, tenant messages, vendor scheduling, and owner reports to a screened Expert who works your hours.',
    tasks: [
      { title: 'Work orders', items: ['Log and track work orders', 'Keep tenants updated'], service: 'customer-support' },
      { title: 'Tenant messages', items: ['Answer tenant calls, email and chat', 'Send rent reminders'], service: 'customer-support' },
      { title: 'Vendor scheduling', items: ['Book plumbers, landscapers and other vendors', 'Confirm visits with tenants'], service: 'executive-assistant' },
      { title: 'Owner reports', items: ['Track rent collected and expenses', 'Prepare monthly owner statements'], service: 'bookkeeping' },
    ],
    tools: ['QuickBooks'],
    clients: ['Calistar Management'],
    faq: ['How long does hiring take?', 'Can they work in my time zone?', 'How is my data protected?', 'How much does it cost?'],
  },
];

export function segmentFor(industry: Industry): Segment {
  return segments.find(s => s.id === industry.id)!;
}
export function industryFor(id: SegmentId) {
  return industries.find(industry => industry.id === id)!;
}

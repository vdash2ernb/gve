// Business types a visitor can pick on the homepage. Each one swaps the homepage 3D sheets,
// the caption above them and the chapter 01 task chips, and sets where the Services page opens.
// Every task here was confirmed by GVE as work its Experts do for that kind of client.
import type { Kind } from '@/components/folio/FolioCanvas';
import type { Service } from './site';

/** Text drawn on one 3D sheet. `rows` are list lines; `messages` alternate customer, then Expert. */
export type SheetText = { title: string; sub?: string; rows?: string[]; footer?: string; messages?: string[] };
export type Sheet = { kind: Kind; text?: SheetText };
export type SegmentId = 'builders' | 'roofing' | 'home-services' | 'property';
export type Segment = {
  id: SegmentId;
  label: string;
  caption: string;
  chips: string[];
  sheets: [Sheet, Sheet, Sheet, Sheet];
  services: { group: Service['group']; slug: string };
};

// Shown before a visitor picks a business type.
export const generalSheets: [Sheet, Sheet, Sheet, Sheet] = [{ kind: 'plans' }, { kind: 'schedule' }, { kind: 'accounts' }, { kind: 'clients' }];
export const generalCaption = 'Hand off the office work behind every job.';
export const generalChips = ['Permits & paperwork', 'Estimates & follow-ups', 'Job schedules', 'Invoices & payroll'];

export const segments: Segment[] = [
  {
    id: 'builders', label: 'Builders & remodelers',
    caption: 'Hand off permits and change orders.',
    chips: ['Permit sets', 'Job schedules', 'Change orders', 'Homeowner updates'],
    sheets: [
      { kind: 'plans', text: { title: 'PERMIT SET', footer: 'PLANS / PERMIT SET / REVISIONS' } },
      { kind: 'schedule', text: { title: 'JOB SCHEDULE', rows: ['Permit submitted', 'Materials ordered', 'Crew booked'] } },
      { kind: 'accounts', text: { title: 'CHANGE ORDERS', sub: 'Approvals and job costs', rows: ['Change order sent', 'Approval received', 'Job costs updated'] } },
      { kind: 'clients', text: { title: 'HOMEOWNER UPDATES', rows: ['Weekly update sent', 'Selections confirmed', 'Walkthrough booked'] } },
    ],
    services: { group: 'Construction & trades', slug: 'project-management' },
  },
  {
    id: 'roofing', label: 'Roofing & trades',
    caption: 'Hand off estimates and crew schedules.',
    chips: ['Estimate follow-ups', 'Crew schedules', 'Material orders', 'Invoices & payroll'],
    sheets: [
      { kind: 'clients', text: { title: 'ESTIMATE FOLLOW-UPS', rows: ['Estimate sent', 'Homeowner callback', 'Inspection booked'] } },
      { kind: 'schedule', text: { title: 'CREW SCHEDULE', rows: ['Crew booked Monday', 'Inspection set', 'Homeowner notified'] } },
      { kind: 'logistics', text: { title: 'MATERIAL ORDERS', sub: 'Supplier to job site', footer: 'ORDERS / DELIVERIES / STATUS' } },
      { kind: 'accounts', text: { title: 'INVOICES & PAYROLL', sub: 'Jobs and payroll', rows: ['Invoices', 'Payroll', 'Job costs'] } },
    ],
    services: { group: 'Construction & trades', slug: 'project-management' },
  },
  {
    id: 'home-services', label: 'Home services',
    caption: 'Hand off service calls and invoices.',
    chips: ['Service calls', 'Customer messages', 'Review requests', 'Invoices'],
    sheets: [
      { kind: 'logistics', text: { title: 'SERVICE CALLS', sub: 'Booked in Jobber or ServiceTitan', footer: 'TECHS / ROUTES / STATUS' } },
      { kind: 'support', text: { title: 'CUSTOMER MESSAGES', sub: 'Email, phone, and chat' } },
      { kind: 'clients', text: { title: 'REVIEW REQUESTS', rows: ['Job complete', 'Review request sent', 'Next service booked'] } },
      { kind: 'accounts', text: { title: 'INVOICES', sub: 'Jobs and payments', rows: ['Invoices sent', 'Payments logged', 'Reconciliation'] } },
    ],
    services: { group: 'Construction & trades', slug: 'dispatch-logistics' },
  },
  {
    id: 'property', label: 'Property management',
    caption: 'Hand off work orders and tenant messages.',
    chips: ['Work orders', 'Tenant messages', 'Vendor scheduling', 'Owner reports'],
    sheets: [
      { kind: 'schedule', text: { title: 'WORK ORDERS', rows: ['Leak reported', 'Plumber booked', 'Tenant notified'] } },
      { kind: 'support', text: { title: 'TENANT MESSAGES', sub: 'Email, phone, and chat', messages: ['The sink is leaking.', 'Plumber booked for 10am.', 'When is rent due?', 'The 1st. Reminder sent.'], footer: 'ALL TENANTS ANSWERED' } },
      { kind: 'clients', text: { title: 'VENDOR SCHEDULING', rows: ['Plumber · Tuesday', 'Landscaper · Thursday', 'HVAC check · Friday'] } },
      { kind: 'accounts', text: { title: 'OWNER REPORTS', sub: 'Monthly statements', rows: ['Rent collected', 'Expenses', 'Owner statement'] } },
    ],
    services: { group: 'Admin & operations', slug: 'customer-support' },
  },
];

// The choice lasts for this browser visit only, so the Services page can open on the matching group.
// Read it with useSyncExternalStore(subscribeSegment, readSegment, () => null).
const KEY = 'gve-business-type';
const listeners = new Set<() => void>();
let current: SegmentId | null | undefined;
export function readSegment(): SegmentId | null {
  if (current === undefined) {
    try { const id = sessionStorage.getItem(KEY); current = segments.some(s => s.id === id) ? id as SegmentId : null; } catch { current = null; }
  }
  return current;
}
export function saveSegment(id: SegmentId | null) {
  current = id;
  try { if (id) sessionStorage.setItem(KEY, id); else sessionStorage.removeItem(KEY); } catch { /* storage blocked: the choice lasts until the page closes */ }
  listeners.forEach(listener => listener());
}
export function subscribeSegment(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

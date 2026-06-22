export interface Supplier {
  id: string;
  name: string;
  role: string;
  status: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  leadTime: string;
  supplyType: string;
  supplies: string;
  notes: string;
  _u: number;
}

export interface ResourceLink {
  label: string;
  url: string;
  type: string;
}

export interface Product {
  id: string;
  name: string;
  rev: string;
  status: string;
  dimensions: string;
  priceBand: string;
  leadTime: string;
  finishes: string;
  specs: string;
  brochures: ResourceLink[];
  _u: number;
}

export interface ResearchEntry {
  id: string;
  title: string;
  type: string;
  jurisdiction: string;
  summary: string;
  owner: string;
  date: string;
  link: string;
  _u: number;
}

export interface Improvement {
  id: string;
  title: string;
  product: string;
  status: string;
  impact: string;
  owner: string;
  date: string;
  _u: number;
}

export interface PlanIncludes {
  sitePlan: boolean;
  structural: boolean;
  anchorage: boolean;
  utilities: boolean;
  elevations: boolean;
}

export interface BuildPlan {
  id: string;
  name: string;
  product: string;
  version: string;
  date: string;
  status: string;
  includes: PlanIncludes;
  specs: string;
  cuts: string;
  notes: string;
  pdfLink: string;
  _u: number;
}

export interface SalesResource {
  id: string;
  label: string;
  type: string;
  url: string;
  note: string;
  _u: number;
}

export interface CommEntry {
  id: string;
  date: string;
  channel: string;
  note: string;
}

export interface DealDocument {
  id: string;
  type: string;
  url: string;
  shared: boolean;
  date: string;
}

export interface Deal {
  id: string;
  name: string;
  contact: string;
  type: string;
  location: string;
  product: string;
  value: number;
  stage: string;
  health: string;
  nextAction: string;
  nextDue: string;
  notes: string;
  source: string;
  comms: CommEntry[];
  documents?: DealDocument[];
  created: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  channel: string;
  startDate: string;
  endDate: string;
  budget: string;
  audience: string;
  goal: string;
  results: string;
  link: string;
  notes: string;
  _u: number;
}

export interface MarketingEvent {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  status: string;
  audience: string;
  cost: string;
  leads: string;
  notes: string;
  link: string;
  _u: number;
}

export interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  channel: string;
  publishDate: string;
  author: string;
  topic: string;
  url: string;
  notes: string;
  _u: number;
}

export interface Testimonial {
  id: string;
  name: string;
  project: string;
  type: string;
  quote: string;
  rating: string;
  date: string;
  source: string;
  approved: string;
  link: string;
  _u: number;
}

export interface WebPresence {
  id: string;
  label: string;
  platform: string;
  url: string;
  handle: string;
  status: string;
  notes: string;
  _u: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  location: string;
  product: string;
  status: string;
  startDate: string;
  targetComplete: string;
  siteStatus: string;
  buildPartner: string;
  value: string;
  depositPaid: string;
  balanceDue: string;
  permitStatus: string;
  electricalStatus: string;
  craneDate: string;
  notes: string;
  _u: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  location: string;
  product: string;
  installDate: string;
  warrantyExpires: string;
  satisfaction: string;
  referralSource: string;
  referralsGiven: string;
  testimonial: string;
  notes: string;
  _u: number;
}

export interface FinanceEntry {
  id: string;
  label: string;
  type: string;
  category: string;
  amount: string;
  date: string;
  status: string;
  job: string;
  vendor: string;
  invoice: string;
  qbRef: string;
  notes: string;
  _u: number;
}

export interface HubData {
  suppliers: Supplier[];
  products: Product[];
  research: ResearchEntry[];
  improvements: Improvement[];
  plans: BuildPlan[];
  resources: SalesResource[];
  campaigns: Campaign[];
  events: MarketingEvent[];
  content: ContentItem[];
  testimonials: Testimonial[];
  webPresence: WebPresence[];
  projects: Project[];
  customers: Customer[];
  finance: FinanceEntry[];
}

export interface SalesData {
  deals: Deal[];
  lastSync: number | null;
}

export type SectionId =
  | 'pipeline'
  | 'suppliers' | 'products' | 'research' | 'improvements' | 'plans' | 'resources'
  | 'campaigns' | 'events' | 'content' | 'testimonials' | 'webPresence'
  | 'projects' | 'customers' | 'finance';

export interface Stage {
  key: string;
  label: string;
  code: string;
  prob: number;
  heat: string;
  blurb: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'reslist' | 'includes';
  opts?: string[];
  ph?: string;
  req?: boolean;
  mono?: boolean;
  addLabel?: string;
}

export interface SectionDef {
  id: SectionId;
  label: string;
  title: string;
  desc: string;
  lede: string;
  titleField: string;
  icon: string;
  fields: FieldDef[];
}

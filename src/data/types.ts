export interface LinkItem {
  label: string;
  href: string;
  kind: 'github' | 'linkedin' | 'blog' | 'email' | 'rss' | 'repo';
  external?: boolean;
}

export interface StackItem {
  name: string;
  note?: string;
}

export interface StackGroup {
  id: string;
  title: string;
  description: string;
  items: StackItem[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  org: string;
  period: string;
  current: boolean;
  summary: string;
  highlights: string[];
  tags: string[];
}

export interface EducationItem {
  id: string;
  title: string;
  org: string;
  period: string;
  detail: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  org: string;
  year: string;
}

export interface ServiceItem {
  id: 'asesoria' | 'diseno-web' | 'automatizacion';
  name: string;
  tagline: string;
  forWho: string;
  what: string[];
  process: { title: string; description: string }[];
  deliverables: string[];
  cta: string;
}

export interface ClassroomItem {
  id: string;
  title: string;
  summary: string;
  topics: string[];
}

export interface LearningPathItem {
  id: string;
  title: string;
  level: string;
  duration: string;
  outcome: string;
  topics: string[];
}

export interface FossTool {
  name: string;
  category: string;
  why: string;
}

export interface PromoService {
  id: ServiceItem['id'];
  code: string;
  label: string;
}

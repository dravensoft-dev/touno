import { ReputationFact, ReputationSubject } from './reputation.model';
import { Role } from './session';

export type ManualSection = 'tutorial' | 'reputacion';

export interface ManualStep {
  readonly title: string;
  readonly body: string;
}

export interface ManualChapter {
  readonly section: ManualSection;
  readonly title: string;
  readonly summary: string;
  readonly steps: readonly ManualStep[];
  readonly gains: readonly string[];
  readonly limits: readonly string[];
  readonly subject?: ReputationSubject;
  readonly counted: readonly ReputationFact[];
}

export interface ManualEntry {
  readonly role: Role;
  readonly title: string;
  readonly lede: string;
  readonly description: string;
  readonly icon: string;
  readonly chapters: readonly ManualChapter[];
}

const SECTION_LABELS: Record<ManualSection, string> = {
  tutorial: 'Tutorial',
  reputacion: 'Reputación',
};

export function sectionLabel(section: ManualSection): string {
  return SECTION_LABELS[section];
}

export function pathOfRole(role: Role): string {
  return `/manual/${role}`;
}

import { Injectable, signal } from '@angular/core';
import { MANUAL } from './manual.data';
import { ManualChapter, ManualEntry, ManualSection, pathOfRole } from './manual.model';
import { Role } from './session';

@Injectable({ providedIn: 'root' })
export class Manual {
  private readonly entryList = signal<readonly ManualEntry[]>(MANUAL);

  readonly all = this.entryList.asReadonly();

  byRole(role: string): ManualEntry | undefined {
    return this.all().find((one) => one.role === role);
  }

  chapter(role: Role, section: ManualSection): ManualChapter | undefined {
    return this.byRole(role)?.chapters.find((one) => one.section === section);
  }

  pathOf(role: Role): string {
    return pathOfRole(role);
  }
}

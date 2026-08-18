import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ArenaButton, ArenaFooter, ArenaUnauthCard } from '@dravensoft/arena-angular';
import { Profile, Session } from '../../../domain/session';

@Component({
  selector: 'app-sign-in',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaUnauthCard, ArenaFooter, ArenaButton],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private readonly router = inject(Router);

  protected readonly session = inject(Session);

  protected enter(profile: Profile): void {
    this.session.enter(profile.role);
    void this.router.navigateByUrl(profile.home);
  }
}

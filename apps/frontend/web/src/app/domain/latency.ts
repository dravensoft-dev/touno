import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export function withLatency<T>(value: T, ms = 320): Promise<T> {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    return Promise.resolve(value);
  }

  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

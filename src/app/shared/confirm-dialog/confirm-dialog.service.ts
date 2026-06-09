import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface DialogRequest {
  config: ConfirmConfig;
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly request$ = new Subject<DialogRequest | null>();

  open(config: ConfirmConfig): Promise<boolean> {
    return new Promise(resolve => {
      this.request$.next({ config, resolve });
    });
  }
}

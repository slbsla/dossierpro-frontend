import { Injectable } from '@angular/core';

export interface EmSelectedEntity {
  code: string;
  name: string;
  sector?: string;
}

@Injectable({ providedIn: 'root' })
export class EmSessionService {
  private readonly KEY = 'dp_em_entity';
  private _entity: EmSelectedEntity | null = null;

  constructor() {
    this.loadFromStorage();
  }

  get entity(): EmSelectedEntity | null { return this._entity; }
  get code(): string | null { return this._entity?.code ?? null; }
  get isSelected(): boolean { return this._entity !== null; }

  select(entity: EmSelectedEntity): void {
    this._entity = entity;
    try { localStorage.setItem(this.KEY, JSON.stringify(entity)); } catch { }
  }

  clear(): void {
    this._entity = null;
    try { localStorage.removeItem(this.KEY); } catch { }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) this._entity = JSON.parse(raw) as EmSelectedEntity;
    } catch {
      this._entity = null;
    }
  }
}

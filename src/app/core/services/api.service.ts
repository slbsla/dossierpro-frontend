import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardAdmin, DashboardEm, EntityOrg, EntityMng, EntityUser,
  Dossier, UserPref, PageResponse
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly API = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ---- Admin ----
  getAdminDashboard(): Observable<DashboardAdmin> {
    return this.http.get<DashboardAdmin>(`${this.API}/admin/dashboard`);
  }

  getEntities(page = 0, size = 8): Observable<PageResponse<EntityOrg>> {
    return this.http.get<PageResponse<EntityOrg>>(`${this.API}/admin/entities`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getEntity(code: string): Observable<EntityOrg> {
    return this.http.get<EntityOrg>(`${this.API}/admin/entities/${code}`);
  }

  createEntity(data: Partial<EntityOrg>): Observable<EntityOrg> {
    return this.http.post<EntityOrg>(`${this.API}/admin/entities`, data);
  }

  updateEntity(code: string, data: Partial<EntityOrg>): Observable<EntityOrg> {
    return this.http.put<EntityOrg>(`${this.API}/admin/entities/${code}`, data);
  }

  deleteEntity(code: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/admin/entities/${code}`);
  }

  getEntityManagers(page = 0, size = 8): Observable<PageResponse<EntityMng>> {
    return this.http.get<PageResponse<EntityMng>>(`${this.API}/admin/entity-managers`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getEntityManager(ref: string): Observable<EntityMng> {
    return this.http.get<EntityMng>(`${this.API}/admin/entity-managers/${ref}`);
  }

  createEntityManager(data: Partial<EntityMng>): Observable<EntityMng> {
    return this.http.post<EntityMng>(`${this.API}/admin/entity-managers`, data);
  }

  updateEntityManager(ref: string, data: Partial<EntityMng>): Observable<EntityMng> {
    return this.http.put<EntityMng>(`${this.API}/admin/entity-managers/${ref}`, data);
  }

  deleteEntityManager(ref: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/admin/entity-managers/${ref}`);
  }

  // ---- EM ----
  getEmDashboard(): Observable<DashboardEm> {
    return this.http.get<DashboardEm>(`${this.API}/em/dashboard`);
  }

  getEmUsers(page = 0, size = 8, prospectOnly = false, sortBy = '', sortDir = ''): Observable<PageResponse<EntityUser>> {
    let params = new HttpParams().set('page', page).set('size', size).set('prospectOnly', prospectOnly);
    if (sortBy)  params = params.set('sortBy', sortBy);
    if (sortDir) params = params.set('sortDir', sortDir);
    return this.http.get<PageResponse<EntityUser>>(`${this.API}/em/users`, { params });
  }

  getEmUser(ref: string): Observable<EntityUser> {
    return this.http.get<EntityUser>(`${this.API}/em/users/${ref}`);
  }

  createEmUser(data: Partial<EntityUser>): Observable<EntityUser> {
    return this.http.post<EntityUser>(`${this.API}/em/users`, data);
  }

  updateEmUser(ref: string, data: Partial<EntityUser>): Observable<EntityUser> {
    return this.http.put<EntityUser>(`${this.API}/em/users/${ref}`, data);
  }

  deleteEmUser(ref: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/em/users/${ref}`);
  }

  toggleUserActive(ref: string): Observable<EntityUser> {
    return this.http.patch<EntityUser>(`${this.API}/em/users/${ref}/toggle-active`, {});
  }

  getPendingDossiers(page = 0, size = 8): Observable<PageResponse<Dossier>> {
    return this.http.get<PageResponse<Dossier>>(`${this.API}/em/dossiers/pending`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getValidatedDossiers(page = 0, size = 8): Observable<PageResponse<Dossier>> {
    return this.http.get<PageResponse<Dossier>>(`${this.API}/em/dossiers/validated`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getEmDossier(ref: string): Observable<Dossier> {
    return this.http.get<Dossier>(`${this.API}/em/dossiers/${ref}`);
  }

  rejectDossier(ref: string, motif: string): Observable<Dossier> {
    return this.http.post<Dossier>(`${this.API}/em/dossiers/${ref}/reject`, { motif });
  }

  generatePdf(ref: string): Observable<Blob> {
    return this.http.post(`${this.API}/em/dossiers/${ref}/generate-pdf`, {}, { responseType: 'blob' });
  }

  signDossier(ref: string): Observable<Dossier> {
    return this.http.post<Dossier>(`${this.API}/em/dossiers/${ref}/sign`, {});
  }

  downloadEmPdf(ref: string): Observable<Blob> {
    return this.http.get(`${this.API}/em/dossiers/${ref}/pdf`, { responseType: 'blob' });
  }

  // ---- User ----
  getUserDossiers(page = 0, size = 8, search = '', type = ''): Observable<PageResponse<Dossier>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search.trim()) params = params.set('search', search.trim());
    if (type.trim())   params = params.set('type', type.trim());
    return this.http.get<PageResponse<Dossier>>(`${this.API}/user/dossiers`, { params });
  }

  getUserDossier(ref: string): Observable<Dossier> {
    return this.http.get<Dossier>(`${this.API}/user/dossiers/${ref}`);
  }

  createDossier(data: any): Observable<Dossier> {
    return this.http.post<Dossier>(`${this.API}/user/dossiers`, data);
  }

  updateDossier(ref: string, data: any): Observable<Dossier> {
    return this.http.put<Dossier>(`${this.API}/user/dossiers/${ref}`, data);
  }

  deleteDossier(ref: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/user/dossiers/${ref}`);
  }

  submitDossier(ref: string): Observable<Dossier> {
    return this.http.post<Dossier>(`${this.API}/user/dossiers/${ref}/submit`, {});
  }

  downloadUserPdf(ref: string): Observable<Blob> {
    return this.http.get(`${this.API}/user/dossiers/${ref}/pdf`, { responseType: 'blob' });
  }

  exportUserDossiers(search = '', type = ''): Observable<Blob> {
    let params = new HttpParams();
    if (search.trim()) params = params.set('search', search.trim());
    if (type.trim())   params = params.set('type', type.trim());
    return this.http.get(`${this.API}/user/dossiers/export`, { params, responseType: 'blob' });
  }

  deleteMyAccount(): Observable<void> {
    return this.http.delete<void>(`${this.API}/user/dossiers/account`);
  }

  getUserProfile(): Observable<EntityUser> {
    return this.http.get<EntityUser>(`${this.API}/user/profile`);
  }

  updateUserProfile(data: Partial<EntityUser>): Observable<EntityUser> {
    return this.http.put<EntityUser>(`${this.API}/user/profile`, data);
  }

  uploadProfilePhoto(file: File): Observable<EntityUser> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<EntityUser>(`${this.API}/user/profile/photo`, formData);
  }

  getProfilePhotoUrl(): string {
    return `${this.API}/user/profile/photo`;
  }

  getUserPrefs(): Observable<UserPref> {
    return this.http.get<UserPref>(`${this.API}/user/preferences`);
  }

  saveUserPrefs(data: Partial<UserPref>): Observable<UserPref> {
    return this.http.put<UserPref>(`${this.API}/user/preferences`, data);
  }

  // ---- Public (no auth) ----
  searchPublicEntities(name: string): Observable<{code: string; name: string}[]> {
    return this.http.get<{code: string; name: string}[]>(`${this.API}/public/entities/search`, {
      params: new HttpParams().set('name', name)
    });
  }

  registerProspect(data: {firstName: string; lastName: string; telephone: string; email: string; entityCode: string; password: string}): Observable<any> {
    return this.http.post(`${this.API}/public/register`, data);
  }

  // ---- Activity Logs ----
  getAdminActivityLogs(page = 0, size = 8): Observable<any> {
    return this.http.get(`${this.API}/admin/activity-logs`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getEmActivityLogs(page = 0, size = 8): Observable<any> {
    return this.http.get(`${this.API}/em/activity-logs`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }
}

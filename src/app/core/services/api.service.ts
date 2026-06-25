import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardAdmin, DashboardEm, EntityOrg, EntityMng, EntityUser,
  Dossier, DossierArchive, DossierStatusHistory, UserPref, PageResponse, DossierUpload, UploadResult, UserDashboard, UserBankInfo, SupportMessage, ManagerRole, EmManagerInfo,
  Ticket, SchedulerExecution, SchedulerJob, SchedulerJobType
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {

 /**
  Direct run :   private readonly API = 'http://localhost:8080/api';
  Run with back end :   private readonly API = '/api';
  */

  private readonly API = '/api';

  constructor(private http: HttpClient) {}

  // ---- Admin ----
  getAppVersion(): Observable<{ version: string }> {
    return this.http.get<{ version: string }>(`${this.API}/public/version`);
  }

  getAdminDashboard(): Observable<DashboardAdmin> {
    return this.http.get<DashboardAdmin>(`${this.API}/admin/dashboard`);
  }

  getManagerRoles(): Observable<ManagerRole[]> {
    return this.http.get<ManagerRole[]>(`${this.API}/admin/roles`);
  }

  getEntities(page = 0, size = 8, entityManagerId?: string): Observable<PageResponse<EntityOrg>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (entityManagerId) params = params.set('entityManagerId', entityManagerId);
    return this.http.get<PageResponse<EntityOrg>>(`${this.API}/admin/entities`, { params });
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
  getEmMyEntities(q = ''): Observable<{code: string; name: string; sector: string}[]> {
    const params = q.length >= 2 ? new HttpParams().set('q', q) : new HttpParams();
    return this.http.get<{code: string; name: string; sector: string}[]>(`${this.API}/em/my-entities`, { params });
  }

  getEmDashboard(): Observable<DashboardEm> {
    return this.http.get<DashboardEm>(`${this.API}/em/dashboard`);
  }

  getEmManagers(): Observable<EmManagerInfo[]> {
    return this.http.get<EmManagerInfo[]>(`${this.API}/em/managers`);
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

  getPendingDossiers(page = 0, size = 8, search = ''): Observable<PageResponse<Dossier>> {
    let p = new HttpParams().set('page', page).set('size', size);
    if (search) p = p.set('search', search);
    return this.http.get<PageResponse<Dossier>>(`${this.API}/em/dossiers/pending`, { params: p });
  }

  getValidatedDossiers(page = 0, size = 8, search = '', statusFilter = ''): Observable<PageResponse<Dossier>> {
    let p = new HttpParams().set('page', page).set('size', size);
    if (search) p = p.set('search', search);
    if (statusFilter) p = p.set('statusFilter', statusFilter);
    return this.http.get<PageResponse<Dossier>>(`${this.API}/em/dossiers/validated`, { params: p });
  }

  getEmDossier(ref: string): Observable<Dossier> {
    return this.http.get<Dossier>(`${this.API}/em/dossiers/${ref}`);
  }

  getEmDossierHistory(ref: string): Observable<DossierStatusHistory[]> {
    return this.http.get<DossierStatusHistory[]>(`${this.API}/em/dossiers/${ref}/history`);
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

  archiveDossier(ref: string): Observable<DossierArchive> {
    return this.http.post<DossierArchive>(`${this.API}/em/dossiers/${ref}/archive`, {});
  }

  getArchives(page = 0, size = 8): Observable<PageResponse<DossierArchive>> {
    return this.http.get<PageResponse<DossierArchive>>(`${this.API}/em/archives`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  // ---- User ----
  getUserDashboard(): Observable<UserDashboard> {
    return this.http.get<UserDashboard>(`${this.API}/user/dossiers/dashboard`);
  }

  getUserDossiers(page = 0, size = 8, search = '', type = ''): Observable<PageResponse<Dossier>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search.trim()) params = params.set('search', search.trim());
    if (type.trim())   params = params.set('type', type.trim());
    return this.http.get<PageResponse<Dossier>>(`${this.API}/user/dossiers`, { params });
  }

  getUserDossier(ref: string): Observable<Dossier> {
    return this.http.get<Dossier>(`${this.API}/user/dossiers/${ref}`);
  }

  getUserDossierHistory(ref: string): Observable<DossierStatusHistory[]> {
    return this.http.get<DossierStatusHistory[]>(`${this.API}/user/dossiers/${ref}/history`);
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

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.API}/auth/change-password`, { currentPassword, newPassword });
  }

  deleteMyAccount(): Observable<void> {
    return this.http.delete<void>(`${this.API}/user/dossiers/account`);
  }

  // ---- Upload de masse ----
  getLastUploads(): Observable<DossierUpload[]> {
    return this.http.get<DossierUpload[]>(`${this.API}/user/uploads`);
  }

  downloadUploadTemplate(): Observable<Blob> {
    return this.http.get(`${this.API}/user/uploads/template`, { responseType: 'blob' });
  }

  uploadDossierFile(file: File): Observable<UploadResult> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UploadResult>(`${this.API}/user/uploads`, form);
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

  // ---- Infos Bancaires ----
  getBankInfo(): Observable<UserBankInfo> {
    return this.http.get<UserBankInfo>(`${this.API}/user/bank-info`);
  }

  saveBankInfo(data: Partial<UserBankInfo>): Observable<UserBankInfo> {
    return this.http.put<UserBankInfo>(`${this.API}/user/bank-info`, data);
  }

  deleteBankInfo(): Observable<void> {
    return this.http.delete<void>(`${this.API}/user/bank-info`);
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

  // ---- User Support ----
  getSupportMessages(): Observable<SupportMessage[]> {
    return this.http.get<SupportMessage[]>(`${this.API}/user/support`);
  }

  getSupportMessage(ref: string): Observable<SupportMessage> {
    return this.http.get<SupportMessage>(`${this.API}/user/support/${ref}`);
  }

  sendSupportMessage(data: {subject: string; email: string; message: string}): Observable<SupportMessage> {
    return this.http.post<SupportMessage>(`${this.API}/user/support`, data);
  }

  // ---- Support (tickets) ----
  getTickets(page = 0, size = 10, status = ''): Observable<PageResponse<Ticket>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<PageResponse<Ticket>>(`${this.API}/tickets`, { params });
  }

  getTicket(ref: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.API}/tickets/${ref}`);
  }

  createTicket(data: Partial<Ticket>): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.API}/tickets`, data);
  }

  updateTicket(ref: string, data: Partial<Ticket>): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.API}/tickets/${ref}`, data);
  }

  deleteTicket(ref: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/tickets/${ref}`);
  }

  // ---- EM Groups ----
  getEmGroups(): Observable<{groupReference: string; groupName: string; icon: string; memberCount: number}[]> {
    return this.http.get<any[]>(`${this.API}/em/groups`);
  }

  createEmGroup(data: {groupName: string; icon: string}): Observable<any> {
    return this.http.post(`${this.API}/em/groups`, data);
  }

  deleteEmGroup(ref: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/em/groups/${ref}`);
  }

  getGroupMembers(ref: string): Observable<{userReference: string; firstName: string; lastName: string}[]> {
    return this.http.get<any[]>(`${this.API}/em/groups/${ref}/members`);
  }

  addGroupMember(groupRef: string, userRef: string): Observable<void> {
    return this.http.post<void>(`${this.API}/em/groups/${groupRef}/members/${userRef}`, {});
  }

  removeGroupMember(groupRef: string, userRef: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/em/groups/${groupRef}/members/${userRef}`);
  }

  // ---- Admin Scheduler ----
  getSchedulerExecutions(page = 0, size = 10): Observable<PageResponse<SchedulerExecution>> {
    return this.http.get<PageResponse<SchedulerExecution>>(`${this.API}/admin/scheduler/executions`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getSchedulerJobs(): Observable<SchedulerJob[]> {
    return this.http.get<SchedulerJob[]>(`${this.API}/admin/scheduler/jobs`);
  }

  triggerSchedulerJob(jobType: SchedulerJobType): Observable<void> {
    return this.http.post<void>(`${this.API}/admin/scheduler/jobs/${jobType}/trigger`, {});
  }
}

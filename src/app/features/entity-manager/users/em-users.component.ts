import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { EntityUser, PageResponse } from '../../../core/models/models';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { AuthService } from '../../../core/services/auth.service';

export interface EmGroup {
  groupReference: string;
  groupName: string;
  icon: string;
  memberCount: number;
}
export interface GroupMember {
  userReference: string;
  firstName: string;
  lastName: string;
}

const GROUP_ICONS = [
  'group', 'groups', 'folder_shared', 'star', 'work', 'school',
  'home', 'favorite', 'flag', 'label', 'category', 'hub',
  'diversity_3', 'badge', 'apartment', 'business_center'
];

@Component({ selector: 'app-em-users', templateUrl: './em-users.component.html', styleUrls: ['./em-users.component.css'] })
export class EmUsersComponent implements OnInit {

  // ── Tab ──
  activeTab: 'users' | 'groups' | 'members' = 'users';

  // ── Users tab ──
  page: PageResponse<EntityUser> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  loading = false; showModal = false; editMode = false; selectedRef: string | null = null;
  showViewModal = false; viewUser: EntityUser | null = null;
  form!: FormGroup; error = ''; success = '';
  showPassword = false; showConfirmPassword = false;
  originalValues: any = {};
  prospectOnly = false;
  sortBy = '';
  sortDir: 'asc' | 'desc' | '' = '';

  /** Dernière adresse email auto-générée (permet de savoir si l'utilisateur l'a modifiée à la main). */
  private lastGeneratedEmail = '';
  private static readonly EMAIL_DOMAINS = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];

  // ── Groups shared state (tabs 2 & 3) ──
  groups: EmGroup[] = [];
  groupsLoading = false;
  selectedGroup: EmGroup | null = null;

  // ── Tab 2: group members ──
  groupMembers: GroupMember[] = [];
  membersLoading = false;

  // ── Tab 3: all users (flat list for assignment) ──
  allUsers: EntityUser[] = [];
  allUsersLoading = false;
  memberRefs = new Set<string>();   // refs already in selectedGroup
  assignBusy = new Set<string>();   // refs with in-flight request

  // ── Group create modal ──
  showGroupModal = false;
  groupForm!: FormGroup;
  groupIcons = GROUP_ICONS;
  groupError = '';

  constructor(private api: ApiService, private fb: FormBuilder, private confirm: ConfirmDialogService, private auth: AuthService) {}

  /** Entity Auditor / Entity Signataire : lecture seule, ne peuvent pas gérer les utilisateurs/groupes. */
  get canManageUsers(): boolean { return this.auth.canManageUsers; }

  ngOnInit() { this.load(); }

  // ──────────── Tab switch ────────────────────────────────────────────────
  switchTab(tab: 'users' | 'groups' | 'members') {
    this.activeTab = tab;
    if ((tab === 'groups' || tab === 'members') && this.groups.length === 0) {
      this.loadGroups();
    }
    if (tab === 'members' && this.allUsers.length === 0) {
      this.loadAllUsers();
    }
  }

  // ──────────── Users tab ─────────────────────────────────────────────────
  load(p = 0) {
    this.loading = true;
    this.api.getEmUsers(p, 8, this.prospectOnly, this.sortBy, this.sortDir).subscribe({
      next: r => { this.page = r; this.loading = false; },
      error: () => this.loading = false
    });
  }

  toggleProspectFilter() { this.prospectOnly = !this.prospectOnly; this.load(0); }

  sortBy3(field: string) {
    if (this.sortBy !== field) { this.sortBy = field; this.sortDir = 'asc'; }
    else if (this.sortDir === 'asc') { this.sortDir = 'desc'; }
    else { this.sortBy = ''; this.sortDir = ''; }
    this.load(0);
  }

  sortIcon(field: string): string {
    if (this.sortBy !== field) return 'unfold_more';
    return this.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  openCreate() {
    if (!this.canManageUsers) return;
    this.editMode = false; this.selectedRef = null; this.error = '';
    this.showPassword = false; this.showConfirmPassword = false;
    this.lastGeneratedEmail = '';
    this.form = this.fb.group({
      firstName:       ['', Validators.required],
      lastName:        ['', Validators.required],
      telephone:       [''],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required]
    });
    // Propose automatiquement une adresse email (nom.prenom ou nom-prenom + 2 chiffres
    // @gmail/hotmail/yahoo/outlook) dès que nom/prénom sont saisis ; reste modifiable et
    // ne se régénère plus si l'utilisateur a tapé sa propre adresse.
    this.form.get('firstName')!.valueChanges.subscribe(() => this.autoGenerateEmail());
    this.form.get('lastName')!.valueChanges.subscribe(() => this.autoGenerateEmail());
    this.showModal = true;
  }

  openEdit(u: EntityUser) {
    if (!this.canManageUsers) return;
    this.editMode = true; this.selectedRef = u.reference; this.error = '';
    this.originalValues = { firstName: u.firstName, lastName: u.lastName, telephone: u.telephone, email: u.email };
    this.form = this.fb.group({
      firstName: [u.firstName, Validators.required],
      lastName:  [u.lastName,  Validators.required],
      telephone: [u.telephone],
      email:     [u.email, [Validators.required, Validators.email]]
    });
    this.showModal = true;
  }

  /** Génère une proposition d'email tant que le champ est vide ou égal à la dernière valeur auto-générée. */
  private autoGenerateEmail() {
    const emailCtrl = this.form.get('email');
    if (!emailCtrl) return;
    const current = (emailCtrl.value || '').trim();
    if (current && current !== this.lastGeneratedEmail) return;
    const firstName = (this.form.get('firstName')!.value || '').trim();
    const lastName = (this.form.get('lastName')!.value || '').trim();
    if (!firstName || !lastName) return;
    const generated = this.generateEmail(firstName, lastName);
    this.lastGeneratedEmail = generated;
    emailCtrl.setValue(generated, { emitEvent: false });
  }

  private sanitizeForEmail(s: string): string {
    const noAccents = s.normalize('NFD').split('').filter(ch => ch.charCodeAt(0) < 0x0300 || ch.charCodeAt(0) > 0x036f).join('');
    return noAccents.toLowerCase().replace(/[^a-z]/g, '');
  }

  private generateEmail(firstName: string, lastName: string): string {
    const sep = Math.random() < 0.5 ? '.' : '-';
    const digits = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    const domain = EmUsersComponent.EMAIL_DOMAINS[Math.floor(Math.random() * EmUsersComponent.EMAIL_DOMAINS.length)];
    const fn = this.sanitizeForEmail(firstName);
    const ln = this.sanitizeForEmail(lastName);
    return `${ln}${sep}${fn}${digits}@${domain}`;
  }

  /** Vue lecture seule — toujours disponible, même pour les prospects ou les rôles non-EM. */
  openView(u: EntityUser) {
    this.viewUser = u;
    this.showViewModal = true;
  }

  resetForm() { this.form.patchValue(this.originalValues); this.error = ''; }

  save() {
    if (this.form.invalid) return;
    if (!this.editMode && this.form.value.password !== this.form.value.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.'; return;
    }
    const { confirmPassword, ...payload } = this.form.value;
    const obs = this.editMode ? this.api.updateEmUser(this.selectedRef!, payload) : this.api.createEmUser(payload);
    obs.subscribe({
      next: () => { this.showModal = false; this.load(this.page.page); this.success = this.editMode ? 'Utilisateur modifié.' : 'Utilisateur créé.'; setTimeout(() => this.success = '', 5000); },
      error: (e) => this.error = e?.error?.message || 'Erreur'
    });
  }

  async delete(u: import('../../../core/models/models').EntityUser) {
    if (!this.canManageUsers) return;
    const count = u.dossierCount ?? 0;
    const dossierInfo = count > 0
      ? ` Cet utilisateur possède <strong>${count} dossier(s)</strong> qui seront également supprimés.`
      : ' Cet utilisateur n\'a aucun dossier associé.';
    const ok = await this.confirm.open({
      title: 'Supprimer l\'utilisateur',
      message: `Supprimer <strong>${u.firstName} ${u.lastName}</strong> définitivement ?${dossierInfo}`,
      confirmLabel: 'Supprimer', type: 'danger'
    });
    if (!ok) return;
    this.api.deleteEmUser(u.reference).subscribe({
      next: () => { this.load(this.page.page); this.success = 'Utilisateur supprimé'; setTimeout(() => this.success = '', 3000); },
      error: (e) => this.confirm.open({ title: 'Erreur', message: e?.error?.message || 'Erreur', confirmLabel: 'OK', cancelLabel: ' ', type: 'warning' })
    });
  }

  async toggleActive(ref: string) {
    if (!this.canManageUsers) return;
    this.api.toggleUserActive(ref).subscribe({
      next: () => this.load(this.page.page),
      error: (e) => this.confirm.open({ title: 'Erreur', message: e?.error?.message || 'Erreur', confirmLabel: 'OK', cancelLabel: ' ', type: 'warning' })
    });
  }

  // ──────────── Groups shared ──────────────────────────────────────────────
  loadGroups() {
    this.groupsLoading = true;
    this.api.getEmGroups().subscribe({
      next: gs => { this.groups = gs; this.groupsLoading = false; },
      error: () => this.groupsLoading = false
    });
  }

  selectGroup(g: EmGroup) {
    this.selectedGroup = g;
    this.membersLoading = true;
    this.api.getGroupMembers(g.groupReference).subscribe({
      next: ms => {
        this.groupMembers = ms;
        this.memberRefs = new Set(ms.map(m => m.userReference));
        this.membersLoading = false;
      },
      error: () => this.membersLoading = false
    });
  }

  async deleteGroup(g: EmGroup) {
    if (!this.canManageUsers) return;
    const ok = await this.confirm.open({ title: 'Supprimer le groupe', message: `Supprimer "${g.groupName}" et retirer tous ses membres ?`, confirmLabel: 'Supprimer', type: 'danger' });
    if (!ok) return;
    this.api.deleteEmGroup(g.groupReference).subscribe({
      next: () => {
        this.groups = this.groups.filter(x => x.groupReference !== g.groupReference);
        if (this.selectedGroup?.groupReference === g.groupReference) {
          this.selectedGroup = null; this.groupMembers = []; this.memberRefs.clear();
        }
      }
    });
  }

  // ── Group create modal ──
  openGroupModal() {
    if (!this.canManageUsers) return;
    this.groupError = '';
    this.groupForm = this.fb.group({
      groupName: ['', Validators.required],
      icon: ['group']
    });
    this.showGroupModal = true;
  }

  selectIcon(icon: string) { this.groupForm.patchValue({ icon }); }

  saveGroup() {
    if (this.groupForm.invalid) return;
    this.api.createEmGroup(this.groupForm.value).subscribe({
      next: g => {
        this.groups.push(g);
        this.showGroupModal = false;
      },
      error: (e) => this.groupError = e?.error?.message || 'Erreur'
    });
  }

  // ──────────── Tab 3: member assignment ──────────────────────────────────
  loadAllUsers() {
    this.allUsersLoading = true;
    this.api.getEmUsers(0, 999).subscribe({
      next: r => { this.allUsers = r.content; this.allUsersLoading = false; },
      error: () => this.allUsersLoading = false
    });
  }

  isMember(userRef: string): boolean { return this.memberRefs.has(userRef); }
  isBusy(userRef: string): boolean { return this.assignBusy.has(userRef); }

  toggleMembership(userRef: string) {
    if (!this.canManageUsers || !this.selectedGroup || this.assignBusy.has(userRef)) return;
    this.assignBusy.add(userRef);
    const obs = this.isMember(userRef)
      ? this.api.removeGroupMember(this.selectedGroup.groupReference, userRef)
      : this.api.addGroupMember(this.selectedGroup.groupReference, userRef);

    obs.subscribe({
      next: () => {
        if (this.isMember(userRef)) {
          this.memberRefs.delete(userRef);
          this.groupMembers = this.groupMembers.filter(m => m.userReference !== userRef);
          this.selectedGroup!.memberCount--;
        } else {
          this.memberRefs.add(userRef);
          const u = this.allUsers.find(x => x.reference === userRef)!;
          this.groupMembers.push({ userReference: userRef, firstName: u.firstName, lastName: u.lastName });
          this.selectedGroup!.memberCount++;
        }
        this.assignBusy.delete(userRef);
        // sync group list count
        const g = this.groups.find(x => x.groupReference === this.selectedGroup?.groupReference);
        if (g) g.memberCount = this.selectedGroup!.memberCount;
      },
      error: () => this.assignBusy.delete(userRef)
    });
  }
}

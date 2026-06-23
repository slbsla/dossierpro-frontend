export enum Role { ADMIN = 'ADMIN', ENTITY_MANAGER = 'ENTITY_MANAGER', USER = 'USER', SYSTEM = 'SYSTEM' }
export enum DossierStatus { DRAFT = 'DRAFT', SUBMIT = 'SUBMIT', VALIDATED = 'VALIDATED', REJECTED = 'REJECTED', EXPIRED = 'EXPIRED' }
export enum DossierType { SINISTRE = 'SINISTRE', EER = 'EER', ADHESION = 'ADHESION' }
export enum EntitySector { ASSURANCE = 'ASSURANCE', BANQUE = 'BANQUE', COMMERCE = 'COMMERCE' }
export enum Theme { LIGHT = 'LIGHT', DARK = 'DARK' }
export enum Language { FR = 'FR', EN = 'EN' }
export enum TicketType { BUG = 'BUG', ENHANCEMENT = 'ENHANCEMENT', GROSSE_EVOLUTION = 'GROSSE_EVOLUTION' }
export enum TicketStatus { OUVERT = 'OUVERT', EN_COURS = 'EN_COURS', CLOTURE = 'CLOTURE' }

export interface UserInfo {
  uniqueReference: string;
  role: Role;
  isFirstConnexion: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  telephone?: string;
  entityCode?: string;
  roleName?: string;
}

export interface EntityOrg {
  code: string;
  name: string;
  sector: EntitySector;
  adresse?: string;
  numero?: string;
  ligne?: string;
  postcode?: string;
  ville?: string;
  description?: string;
  entityManagerId?: string;
  entityManagerName?: string;
  extraManagers?: ManagerSummary[];
  isActive: boolean;
  pendingDossiersCount?: number;
  userCount?: number;
  creationDate?: string;
}

export interface ManagerSummary {
  reference: string;
  firstName: string;
  lastName: string;
  roleName?: string;
}

export interface EmManagerInfo {
  reference: string;
  firstName: string;
  lastName: string;
  telephone?: string;
  roleName?: string;
  isYou: boolean;
  isPrimaryEm: boolean;
}

export interface EntityMng {
  reference: string;
  firstName: string;
  lastName: string;
  telephone?: string;
  fonction?: string;
  roleId?: number;
  roleName?: string;
  entityCode?: string;
  entityName?: string;
  entityCount?: number;
  extraManagerCount?: number;
  creationDate?: string;
}

export interface EntityUser {
  reference: string;
  firstName: string;
  lastName: string;
  telephone?: string;
  email?: string;
  entityCode?: string;
  isActive: boolean;
  isFirstConnexion: boolean;
  isProspect?: boolean;
  hasPhoto?: boolean;
  creationDate?: string;
  dossierCount?: number;
}

export interface Dossier {
  reference: string;
  libelle: string;
  description?: string;
  status: DossierStatus;
  type?: DossierType;
  amount?: number;
  userReference: string;
  userFullName?: string;
  entityCode?: string;
  entityUpdator?: string;
  rejectMotif?: string;
  creationDate?: string;
  lastModifDate?: string;
  expirationDate?: string;
  validationDate?: string;
  submitDate?: string;
  rejectDate?: string;
  hasPdf: boolean;
  motif?: string;
  budgetDepart?: number;
  nombrePart?: number;
  immatriculation?: string;
}

export interface DossierStatusHistory {
  status: DossierStatus;
  date: string;
}

export interface UserPref {
  userReference: string;
  formatDate: string;
  formatAmount: string;
  preferredLanguage: Language;
  theme: Theme;
  updatedAt?: string;
}

export interface DashboardAdmin {
  totalEntities: number;
  totalEntityManagers: number;
  totalUsers: number;
  totalDossiers: number;
  dossiersByStatus: Record<string, number>;
}

export interface DashboardEm {
  entityCode: string;
  entityName: string;
  entitySector?: string;
  entityAdresse?: string;
  entityCreationDate?: string;
  totalUsers: number;
  totalDossiers: number;
  pendingDossiers: number;
  validatedDossiers: number;
  rejectedDossiers: number;
  dossiersByStatus: Record<string, number>;
  emReference?: string;
  emFirstName?: string;
  emLastName?: string;
  emTelephone?: string;
  emFonction?: string;
  emCreationDate?: string;
}

export interface DossierArchive {
  id: number;
  timestamp: string;
  referenceDossier: string;
  referenceUser: string;
  referenceManager: string;
  referenceEntity: string;
  libelle: string;
  hash: string;
}

export interface ManagerRole {
  id: number;
  name: string;
  description: string;
}

export interface ActivityLog {
  id: number;
  userReference: string;
  object: string;
  action: string;
  dateCreation: string;
  description: string;
  value?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UserDashboard {
  totalDossiers: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  last10Days: { date: string; count: number }[];
}

export interface UserBankInfo {
  id?: number;
  userReference?: string;
  pays: string;
  nomBanque: string;
  adresseTitulaire?: string;
  nomTitulaire: string;
  iban: string;
  bicSwift: string;
  acceptedStorage: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DossierUpload {
  id: number;
  fileName: string;
  uploadDate: string;
  successCount: number;
  rejectedCount: number;
}

export interface Ticket {
  ticketRef: string;
  label: string;
  description?: string;
  type: TicketType;
  status: TicketStatus;
  creationDate: string;
  creatorReference?: string;
  creatorFullName?: string;
  mine?: boolean;
}

export interface SupportMessage {
  reference: string;
  subject: string;
  email: string;
  message: string;
  sentAt: string;
  entityCode?: string;
}

export interface UploadResult {
  successCount: number;
  rejectedCount: number;
  rejectedReasons: string[];
}

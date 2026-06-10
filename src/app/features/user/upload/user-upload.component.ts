import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { DossierUpload, UploadResult } from '../../../core/models/models';

type ModalStep = 'template' | 'pick' | 'loading' | 'result';

@Component({
  selector: 'app-user-upload',
  templateUrl: './user-upload.component.html'
})
export class UserUploadComponent implements OnInit {
  uploads: DossierUpload[] = [];
  loading = true;
  error = '';

  // Modal
  showModal = false;
  step: ModalStep = 'template';
  selectedFile: File | null = null;
  result: UploadResult | null = null;
  uploadError = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadUploads(); }

  loadUploads() {
    this.loading = true;
    this.api.getLastUploads().subscribe({
      next: data => { this.uploads = data; this.loading = false; },
      error: () => { this.error = 'Erreur lors du chargement des uploads.'; this.loading = false; }
    });
  }

  openModal() {
    this.showModal = true;
    this.step = 'template';
    this.selectedFile = null;
    this.result = null;
    this.uploadError = '';
  }

  closeModal() { this.showModal = false; }

  downloadTemplate() {
    this.api.downloadUploadTemplate().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template-dossiers.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  goToPickStep() { this.step = 'pick'; }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  processUpload() {
    if (!this.selectedFile) return;
    this.step = 'loading';
    this.uploadError = '';
    this.api.uploadDossierFile(this.selectedFile).subscribe({
      next: res => { this.result = res; this.step = 'result'; this.loadUploads(); },
      error: () => { this.uploadError = 'Erreur lors du traitement du fichier.'; this.step = 'pick'; }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}

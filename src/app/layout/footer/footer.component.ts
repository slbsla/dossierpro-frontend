import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  version = '';
  year = new Date().getFullYear();
  showCgu = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getAppVersion()
      .subscribe({ next: r => this.version = r.version, error: () => this.version = '1.0.1' });
  }
}

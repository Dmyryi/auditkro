import { Routes } from '@angular/router';
import { AuditTtComponent } from './audit-tt/audit-tt.component';

export const routes: Routes = [
  { path: ':id', component: AuditTtComponent }, // ':id' — динамический параметр
];

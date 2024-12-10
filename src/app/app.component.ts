import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuditTtComponent } from './audit-tt/audit-tt.component';
import { RouterModule, Routes } from '@angular/router'; // Импортируем RouterModule
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuditTtComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'auditkro';
}

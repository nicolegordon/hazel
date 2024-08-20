import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FileService } from '../file.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css'],
  standalone: true,
  imports: [MatSidenavModule, CommonModule, MatIconModule]
})
export class DocumentsComponent {
  constructor(public fileService: FileService) {}
}

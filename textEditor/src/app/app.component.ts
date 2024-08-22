import { Component } from '@angular/core';
import { FileService } from './file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public fileService: FileService) {}
  title = 'textEditor';
  ngOnInit() {
    // Get files to display in documents pane
    this.fileService.getFiles();
    // Get file that was last open
    this.fileService.getRecentFile();
  }
}

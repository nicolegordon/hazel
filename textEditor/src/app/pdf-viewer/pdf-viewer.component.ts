import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileService } from '../file.service';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import jsPDF from 'jspdf';
declare global {
  interface Window {
    onePageCanvas:any;
  }
}

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, 
    BrowserModule, MatButtonModule, MatIconModule]
})
export class PdfViewerComponent {
  constructor (public fileService: FileService) {}
  @ViewChild('textArea') _textArea: ElementRef | null = null;
  @ViewChild('content') _content: ElementRef | null = null;

  private unsub: Subject<void> = new Subject();
  public currentFile: any = {name: '', text: ''};

  public textForm: FormGroup = new FormGroup({
    text: new FormControl({value: '', disabled: true})
  })

  public findReplaceForm: FormGroup = new FormGroup({
    find: new FormControl({value: '', disabled: true}),
    replace: new FormControl({value: '', disabled: true})
  })
  public totalFindResults: number = 0;
  public currentFindResult: number = 0;
  private resultIndices: number[] = [];
  private findTextLength: number = 0;

  ngOnInit(): void {
    // Stream of what file is selection
    this.fileService.currentFile$.pipe(
      takeUntil(this.unsub))
      .subscribe((currentFile: any) => {
      this.currentFile = currentFile;
      // Set the text in the editor
      this.textForm.get('text')?.setValue(this.currentFile.text);
      // If no file is selected, disable text editor and find and replace
      if (this.currentFile.name != '') {
        this.textForm.get('text')?.enable();
        this.findReplaceForm.get('find')?.enable();
        this.findReplaceForm.get('replace')?.enable();
      }
      // Find search results based on new file
      this.findResults();
      // Reset current search number when file changes
      this.setCurrentFindResult(0);
    });

    // Stream of text in text editor
    this.textForm.get('text')?.valueChanges
      .pipe(debounceTime(400),
      takeUntil(this.unsub))
      .subscribe((text: string) => {
      this.currentFile.text = text;
      this.findResults();
      this.setCurrentFindResult(0);
    });

    // Stream of text find input box
    this.findReplaceForm.get('find')?.valueChanges
      .pipe(debounceTime(400),
      takeUntil(this.unsub))
      .subscribe(() => {
        // Find search results based on new search text
        this.findResults();
        // Reset current search number when search text changes
        this.setCurrentFindResult(0);
    });
  }

  ngOnDestroy(): void {
    this.unsub.next();
  }

  private findResults() {
    const searchText: string = this.findReplaceForm.get('find')?.value;
    this.findTextLength = searchText.length;
    // Return all indices where search text appears in the current file
    this.resultIndices = this.getIndicesOf(searchText, this.currentFile.text)
    // Set the number of results from the find
    this.totalFindResults = this.resultIndices.length;
  }

  private setCurrentFindResult(num: number): void {
    this.currentFindResult = num;
  }

  private getIndicesOf(searchStr: string, str: string, caseSensitive: boolean=true): number[] {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
  }

  public nextResult(): void {
    // If no find results, current result stays at 0
    if (this.totalFindResults === 0) {
      this.currentFindResult = 0
    } else if (this.currentFindResult < this.totalFindResults) {
      // If current result is less than the total number of results, go to next result
      this.currentFindResult += 1;
    } else {
      // If the curent result is equal to the total number of results, go back to first result
      this.currentFindResult = 1;
    }
    // Highlight current result in the editor
    this.setFocus();
  }

  public previousResult(): void {
    // If current result is more than 1, go to previous result
    if (this.currentFindResult > 1) {
      this.currentFindResult -= 1;
    } else {
      // If current result is less than or equal to 1, go back to last result
      this.currentFindResult = this.totalFindResults;
    }
    this.setFocus();
  }

  private setFocus(): void {
    const textArea = this._textArea!.nativeElement as HTMLTextAreaElement;
    textArea.focus();
    // Set the index range of the find result word
    const rangeStart: number = this.resultIndices[this.currentFindResult-1];
    const rangeEnd: number = rangeStart + this.findTextLength;
    // Highlight those indices
    textArea.setSelectionRange(rangeStart, rangeEnd);
    // Put cursor in text editor
    textArea.blur()
    textArea.focus();
  }

  public replaceResult(): void {
    // If there is no find text or there are no results of the find, do nothing
    if (this.isFindEmpty() || !this.doFindResultsExist()) {
      return
    }
    // Get indices of the current find result
    const rangeStart: number = this.resultIndices[this.currentFindResult-1];
    const rangeEnd: number = rangeStart + this.findTextLength;
    // Split the text before and after the find result
    const firstPart = this.currentFile.text.substr(0, rangeStart);
    const lastPart = this.currentFile.text.substr(rangeEnd);
    // Get the text that will replace the find result
    const replaceText = this.findReplaceForm.get('replace')?.value;
    // Concat the split text and the new text
    const newText = firstPart + replaceText + lastPart;
    // Set the new text value
    this.currentFile.text = newText;
    this.textForm.get('text')?.setValue(this.currentFile.text);
    // Find search results based on new editor text and go to next result
    this.findResults();
    this.setFocus();
  }

  public replaceAllResults(): void {
    // If there is no find text, do nothing
    if (this.isFindEmpty()) {
      return
    }
    // Set the new text value
    this.currentFile.text = this.currentFile.text.replaceAll(
      this.findReplaceForm.get('find')?.value, 
      this.findReplaceForm.get('replace')?.value
    );
    this.textForm.get('text')?.setValue(this.currentFile.text);
    // Find search results based on new editor text. All text replaced so current result is 0
    this.findResults();
    this.setCurrentFindResult(0);
  }

  private isFindEmpty(): boolean {
    return this.findReplaceForm.get('find')?.value == null || this.findReplaceForm.get('find')?.value == '';
  }

  private doFindResultsExist(): boolean {
    return this.resultIndices.length > 0;
  }

  public downloadAsPDF() {
    let doc = new jsPDF('p', 'pt', 'letter');
    doc.setFontSize(10);

    // Get text in text editor and save lines in a list
    const textArea: HTMLInputElement = (<HTMLInputElement>document.getElementById('textarea'));
    const textAreaList: string[] = textArea.value.split('\n');
    // At 10pt font, 60 lines will fit on one pdf page
    const linesPerPage: number = 60;
    // Loop 50 lines at a time
    for (let i = 0; i < textAreaList.length; i+=linesPerPage) {
      if (i !== 0) {
        doc.addPage('letter', 'p');
      };
      // Get the current 50 lines and concat them into one string
      const sublist = textAreaList.slice(i, i+linesPerPage).join('\n');
      // Add text to page
      doc.text(sublist, 50, 50);
    }
    doc.save(this.currentFile.name);
  }
}


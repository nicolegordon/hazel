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

  private unsub: Subject<void> = new Subject();
  public currentFile: any = {name: '', text: ''};

  public textForm: FormGroup = new FormGroup({
    text: new FormControl('')
  })

  public findReplaceForm: FormGroup = new FormGroup({
    find: new FormControl(''),
    replace: new FormControl('')
  })
  public totalFindResults: number = 0;
  public currentFindResult: number = 0;
  private resultIndices: number[] = [];
  private findTextLength: number = 0;

  ngOnInit(): void {
    this.fileService.currentFile$.pipe(
      takeUntil(this.unsub))
      .subscribe((currentFile: any) => {
      this.currentFile = currentFile;
      this.textForm.get('text')?.setValue(this.currentFile.text);
    });

    this.textForm.get('text')?.valueChanges
      .pipe(debounceTime(400),
      takeUntil(this.unsub))
      .subscribe((text: string) => {
      this.currentFile.text = text;
    });

    this.findReplaceForm.get('find')?.valueChanges
      .pipe(debounceTime(400),
      takeUntil(this.unsub))
      .subscribe(() => {
        this.findResults();
        this.setCurrentFindResult(0);
    });
  }

  ngOnDestroy(): void {
    this.unsub.next();
  }

  private findResults() {
    const searchText: string = this.findReplaceForm.get('find')?.value;
    this.findTextLength = searchText.length;
    this.resultIndices = this.getIndicesOf(searchText, this.currentFile.text)
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
    if (this.totalFindResults === 0) {
      this.currentFindResult = 0
    } else if (this.currentFindResult < this.totalFindResults) {
      this.currentFindResult += 1;
    } else {
      this.currentFindResult = 1;
    }
    this.setFocus();
  }

  public previousResult(): void {
    if (this.currentFindResult > 1) {
      this.currentFindResult -= 1;
    } else {
      this.currentFindResult = this.totalFindResults;
    }
    this.setFocus();
  }

  private setFocus(): void {
    const textArea = this._textArea!.nativeElement as HTMLTextAreaElement;
    textArea.focus();
    const rangeStart: number = this.resultIndices[this.currentFindResult-1];
    const rangeEnd: number = rangeStart + this.findTextLength;
    textArea.setSelectionRange(rangeStart, rangeEnd);
    textArea.blur()
    textArea.focus();
  }

  public replaceResult(): void {
    if (this.isFindEmpty()) {
      return
    }
    const rangeStart: number = this.resultIndices[this.currentFindResult-1];
    const rangeEnd: number = rangeStart + this.findTextLength;
    const firstPart = this.currentFile.text.substr(0, rangeStart);
    const lastPart = this.currentFile.text.substr(rangeEnd);
    const replaceText = this.findReplaceForm.get('replace')?.value;
    const newText = firstPart + replaceText + lastPart;
    this.currentFile.text = newText;
    this.textForm.get('text')?.setValue(this.currentFile.text);
    this.findResults();
    this.setFocus();
  }

  public replaceAllResults(): void {
    if (this.isFindEmpty()) {
      return
    }
    this.currentFile.text = this.currentFile.text.replaceAll(
      this.findReplaceForm.get('find')?.value, 
      this.findReplaceForm.get('replace')?.value
    );
    this.textForm.get('text')?.setValue(this.currentFile.text);
    this.findResults();
    this.setCurrentFindResult(0);
  }

  private isFindEmpty(): boolean {
    return this.findReplaceForm.get('find')?.value == null || this.findReplaceForm.get('find')?.value == '';
  }
}


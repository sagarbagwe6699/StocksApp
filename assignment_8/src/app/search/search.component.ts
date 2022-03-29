import { SearchService } from './../search.service';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ISearchQuery } from '../search';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  public suggestions = <ISearchQuery[]>[];
  public ticker = '';
  // public showDetails: boolean = false;
  public companyData = {};

  constructor(private service: SearchService, private router: Router) {}

  logit(event: any) {
    console.log(event.target.value);
    let val = event.target.value;
    this.service.getSugestions(val).subscribe(
      (data) => (this.suggestions = data),
      (error) => (this.suggestions = [])
    );
  }

  searchit(event: any) {
    console.log(event.target.value);
    this.ticker = event.target.value;
  }
  handleSearch() {
    console.log(this.ticker);
    this.service.ticker = this.ticker;
    this.router.navigate(['/search', this.ticker]);
    // this.showDetails = true;
  }

  ngOnInit(): void {
    if (!localStorage.getItem('wallet')) {
      localStorage.setItem('wallet', '25000');
    }
  }
}

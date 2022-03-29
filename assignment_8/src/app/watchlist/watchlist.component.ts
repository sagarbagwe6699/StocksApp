import { SearchService } from './../search.service';
import { forkJoin } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css'],
})
export class WatchlistComponent implements OnInit {
  watchlist: any = [];
  all_company_data: any;
  constructor(private service: SearchService) {}

  handleCross(ticker: string) {
    // Getting watchlist
    let watchlist: any = <string>localStorage.getItem('watchlist');
    watchlist = watchlist ? watchlist : '[]';
    watchlist = JSON.parse(watchlist);
    // If ticker is present then remove it
    if (watchlist.includes(ticker.toUpperCase())) {
      watchlist.splice(watchlist.indexOf(ticker.toUpperCase()), 1);
    }
    // Else add the ticker
    else {
      watchlist.push(ticker.toUpperCase());
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    this.watchlist = watchlist;
  }

  ngOnInit(): void {
    this.watchlist = localStorage.getItem('watchlist');
    this.watchlist = this.watchlist ? this.watchlist : '[]';
    this.watchlist = JSON.parse(this.watchlist);
    let temp = Object();
    for (let w of this.watchlist) {
      temp[w] = this.service.getDetails(w);
    }
    console.log(temp);
    forkJoin(temp).subscribe((data: any) => {
      this.all_company_data = data;
    });
    console.log(this.all_company_data);
  }
}

import { ISearchQuery } from './search';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  public ticker = '';
  public companyData = Object();
  public topNews: any = [];
  public insights = Object();
  daily_chart_data: any;
  constructor(private http: HttpClient) {}
  getSugestions(q: string): Observable<ISearchQuery[]> {
    return this.http.get<ISearchQuery[]>(
      `http://localhost:3000/autocomplete/${q}`
    );
  }
  getAllData(ticker: string) {
    this.getDetails(ticker);
    this.getNews(ticker);
    this.getInsights(ticker);
    return of(this.companyData);
  }

  getDetails(ticker: string) {
    if (
      Object.keys(this.companyData).length !== 0 &&
      ticker === this.companyData['company']['ticker']
    ) {
      console.log('Getting data from state');
      return of(this.companyData);
    } else {
      return this.http.get(`http://localhost:3000/company/${ticker}`).pipe(
        tap((data) => console.log(JSON.stringify(data))),
        tap((data) => (this.companyData = data))
      );
    }
  }
  getDailyChart(ticker: string) {
    return this.http.get(`http://localhost:3000/charts/${ticker}`).pipe(
      tap((data) => console.log(JSON.stringify(data))),
      tap((data) => (this.daily_chart_data = data))
    );
  }
  getNews(ticker: string) {
    if (
      this.topNews.length !== 0 &&
      ticker === this.companyData['company']['ticker']
    ) {
      console.log('Getting news data from state');
      return of(this.topNews);
    } else {
      return this.http.get(`http://localhost:3000/news/${ticker}`).pipe(
        tap((data) => console.log(JSON.stringify(data))),
        tap((data) => (this.topNews = data))
      );
    }
  }
  getInsights(ticker: string) {
    if (
      Object.keys(this.insights).length !== 0 &&
      ticker === this.companyData['company']['ticker']
    ) {
      console.log('Getting news data from state');
      return of(this.insights);
    } else {
      return this.http.get(`http://localhost:3000/insights/${ticker}`).pipe(
        tap((data) => console.log(JSON.stringify(data))),
        tap((data) => (this.insights = data))
      );
    }
  }
}

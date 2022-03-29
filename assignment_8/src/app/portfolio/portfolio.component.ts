import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
})
export class PortfolioComponent implements OnInit {
  companies = [];
  portfolio_companies: any = [];
  all_company_data: any;
  money_in_wallet = localStorage.getItem('wallet');
  constructor(private service: SearchService) {}

  sellStocks(ticker: string) {
    console.log(ticker);
    let quantity = 0;
    let index = 0;
    let history: any = localStorage.getItem('stocks_bought')
      ? localStorage.getItem('stocks_bought')
      : '[]';
    history = JSON.parse(<string>history);
    for (let obj of history) {
      if (obj['ticker'] == ticker) {
        for (let h of obj['history']) {
          quantity = quantity + h['quantity'];
        }
        break;
      }
      index = index + 1;
    }
    let money_earned = quantity * this.all_company_data[ticker]['summary']['c'];
    history.splice(index, 1);
    localStorage.setItem('stocks_bought', JSON.stringify(history));
    let wallet_money = parseFloat(<string>localStorage.getItem('wallet'));
    localStorage.setItem('wallet', (wallet_money + money_earned).toString());
    this.portfolio_companies = history;
  }

  ngOnInit(): void {
    this.companies = JSON.parse(<string>localStorage.getItem('stocks_bought'));
    for (let company of this.companies) {
      let q = 0;
      let tp = 0;
      let avg_p = 0;
      for (let entry of <any>company['history']) {
        q = q + entry['quantity'];
        tp = tp + entry['price'];
      }
      this.portfolio_companies.push({
        ticker: company['ticker'],
        avg_cost: tp / q,
        q: q,
        tp: tp,
      });
    }
    let temp = Object();
    for (let c of this.portfolio_companies) {
      temp[c['ticker']] = this.service.getDetails(c['ticker']);
    }
    forkJoin(temp).subscribe((data: any) => {
      this.all_company_data = data;
    });
  }
}

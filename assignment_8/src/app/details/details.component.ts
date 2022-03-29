import {
  Component,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SearchService } from '../search.service';
import { ISearchQuery } from '../search';
import { Observable } from 'rxjs';
import * as Highcharts from 'highcharts/highstock'; //sb-added - for highcharts
import IndicatorsCore from 'highcharts/indicators/indicators';
import vbp from 'highcharts/indicators/volume-by-price';

IndicatorsCore(Highcharts);
vbp(Highcharts);

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit {
  public companyData: any;
  summaryData: any;
  topNews: any;
  Insights: any;
  public ticker = '';
  search_ticker = '';
  quantity = 0;
  public price_to_buy = 0;
  public money_in_wallet = parseFloat(<string>localStorage.getItem('wallet'));
  public suggestions = <ISearchQuery[]>[];
  on_watchlist: any;
  //for highcharts
  isHighcharts = typeof Highcharts === 'object';
  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor: string = 'stockChart';
  date_close: any;
  // chartOptions1: any;
  // twoYrsAgo: any;
  // ohlc: any;
  // volume: any;
  dailyChartData: any;
  // chartOptions2: Highcharts.Options;

  constructor(
    private service: SearchService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  handleQuantity(event: any) {
    this.quantity = parseInt(event.target.value);
    this.price_to_buy = this.quantity * this.companyData['summary']['c'];
    if (this.price_to_buy) {
      console.log(this.price_to_buy);
    } else {
      this.price_to_buy = 0;
      console.log(0);
    }
  }

  handleStar() {
    // Getting watchlist
    let watchlist: any = <string>localStorage.getItem('watchlist');
    watchlist = watchlist ? watchlist : '[]';
    watchlist = JSON.parse(watchlist);
    // If ticker is present then remove it
    if (watchlist.includes(this.ticker.toUpperCase())) {
      watchlist.splice(watchlist.indexOf(this.ticker.toUpperCase()), 1);
    }
    // Else add the ticker
    else {
      watchlist.push(this.ticker.toUpperCase());
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    this.on_watchlist = !this.on_watchlist;
  }

  // handlingDailyChart() {
  //   this.date_close = []; // to remove previous chart data incase there is no data for next search
  //   var index = 0;
  //   var chartColor = 'black';
  //   // if(this.change < 0) { chartColor = 'red'; }
  //   // else if(this.change > 0) { chartColor = 'green'; }
  //   if (this.dailyChartData) {
  //     // if there is chart data in current search
  //     for (let i of this.dailyChartData['c']) {
  //       this.date_close.push([this.dailyChartData['t'][index], i]);
  //       index = index + 1;
  //     }
  //     console.log(this.date_close);
  //     this.chartOptions1 = {
  //       chart: {
  //         height: 400,
  //       },
  //       responsive: {
  //         rules: [
  //           {
  //             condition: {
  //               maxWidth: 500,
  //             },
  //           },
  //         ],
  //       },
  //       title: {
  //         // text: this.desc.ticker,
  //         text: 'tikcer',
  //         style: {
  //           color: 'grey',
  //         },
  //       },
  //       rangeSelector: {
  //         enabled: false,
  //       },
  //       time: {
  //         useUTC: false,
  //       },
  //       series: [
  //         {
  //           // name: this.desc.ticker,
  //           name: 'ticker',
  //           data: this.date_close,
  //           type: 'line',
  //           color: chartColor,
  //         },
  //       ],
  //       xAxis: {
  //         type: 'datetime',
  //         zoomEnabled: true,
  //         units: [
  //           ['minute', [30]],
  //           ['hour', [1]],
  //         ],
  //       },
  //       yAxis: [
  //         {
  //           opposite: true,
  //           height: '100%',
  //           offset: 0,
  //         },
  //       ],
  //       plotOptions: {
  //         series: {
  //           pointPlacement: 'on',
  //         },
  //       },
  //       navigator: {
  //         series: {
  //           type: 'area',
  //           fillColor: chartColor,
  //         },
  //       },
  //     };
  //   }
  // }

  buyStocks() {
    let flag = false;

    // Calculate remaining balance in wallet
    let curr_wallet_balance =
      parseFloat(<string>localStorage.getItem('wallet')) - this.price_to_buy;

    // Convert balance to string
    if (Number.isInteger(curr_wallet_balance)) {
      localStorage.setItem('wallet', curr_wallet_balance + '.0');
    } else {
      localStorage.setItem('wallet', curr_wallet_balance.toString());
    }

    // Get the previous stocks as an array of objects
    // [{
    //   "ticker": "AI",
    //   "history": [
    //     {
    //       "price": 100,
    //       "quantity": 2
    //     }
    //   ]
    // }]

    let prev_stocks = localStorage.getItem('stocks_bought')
      ? localStorage.getItem('stocks_bought')
      : '[]';
    let stocks: any[] = JSON.parse(<string>prev_stocks);

    for (let obj of stocks) {
      if (obj['ticker'] == this.ticker) {
        flag = true;
        obj['history'].push({
          price: this.price_to_buy,
          quantity: this.quantity,
        });
        break;
      }
    }
    if (!flag) {
      stocks.push({
        ticker: this.ticker,
        history: [
          {
            price: this.price_to_buy,
            quantity: this.quantity,
          },
        ],
      });
    }
    localStorage.setItem('stocks_bought', JSON.stringify(stocks));
  }

  sellStocks(ticker: string) {
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
    let money_earned = quantity * this.companyData['summary']['c'];
    history.splice(index, 1);
    localStorage.setItem('stocks_bought', JSON.stringify(history));
    let wallet_money = parseFloat(<string>localStorage.getItem('wallet'));
    localStorage.setItem('wallet', (wallet_money + money_earned).toString());
  }

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
    this.search_ticker = event.target.value;
  }

  handleSearch() {
    console.log(this.search_ticker);
    this.service.ticker = this.search_ticker;
    this.router.navigate(['/search', this.search_ticker]);

    // Subscribe to multiple services
    let deets = this.service.getDetails(this.search_ticker);
    let news = this.service.getNews(this.search_ticker);
    let insights = this.service.getInsights(this.search_ticker);
    forkJoin({
      CompantData: deets,
      NewsData: news,
      InsightsData: insights,
    }).subscribe((data) => {
      console.log(data);
      this.ticker = this.search_ticker;
      this.companyData = data['CompantData'];
      this.topNews = data['NewsData'];
      this.Insights = data['InsightsData'];
    });
    this.on_watchlist = JSON.parse(
      localStorage.getItem('watchlist')
        ? <string>localStorage.getItem('watchlist')
        : ''
    ).includes(this.search_ticker);
  }

  ngOnInit(): void {
    // this.handlingDailyChart();
    this.ticker = <string>this.activatedRoute.snapshot.paramMap.get('ticker');

    // Subscribe to multiple services
    let deets = this.service.getDetails(this.ticker);
    let news = this.service.getNews(this.ticker);
    let insights = this.service.getInsights(this.ticker);
    let daily_chart_data = this.service.getDailyChart(this.ticker);
    forkJoin({
      CompantData: deets,
      NewsData: news,
      InsightsData: insights,
      DailyChart: daily_chart_data,
    }).subscribe((data) => {
      console.log(data);
      this.companyData = data['CompantData'];
      this.topNews = data['NewsData'];
      this.Insights = data['InsightsData'];
      this.dailyChartData = data['DailyChart'];
    });
    this.on_watchlist = JSON.parse(
      localStorage.getItem('watchlist')
        ? <string>localStorage.getItem('watchlist')
        : ''
    ).includes(this.ticker);
  }
}

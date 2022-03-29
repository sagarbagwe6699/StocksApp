import { Component, Input, OnInit } from '@angular/core';
import { SearchService } from '../search.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.css'],
})
export class InsightsComponent implements OnInit {
  ticker = '';
  @Input() insights: any;
  constructor(
    private service: SearchService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {}
}

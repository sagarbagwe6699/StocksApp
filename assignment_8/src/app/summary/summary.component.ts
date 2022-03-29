import {
  Component,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
} from '@angular/core';
import { SearchService } from '../search.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
})
export class SummaryComponent implements OnInit {
  @Input() companyData: any;
  public ticker = '';
  constructor() {}

  ngOnInit(): void {}
}

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import * as carriers from "../../../resource/carriers";
import {CommonService} from "../../services/common.service";

@Component({
  selector: 'app-page-six',
  templateUrl: './page-six.component.html',
  styleUrls: ['./page-six.component.scss']
})
export class PageSixComponent implements OnInit {
  @Output() setInsurnaceType: EventEmitter<number> = new EventEmitter<number>();

  constructor(public commonService: CommonService) {

  }

  public insurances: object = carriers.data;

  ngOnInit() {
  }

  selectInsurance(value) {
    this.setInsurnaceType.emit(value);
  }
}

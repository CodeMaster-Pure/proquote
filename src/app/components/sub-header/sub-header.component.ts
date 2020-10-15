import {Component, Input, OnInit} from '@angular/core';
import {CommonService} from "../../services/common.service";
import * as config from "../../config/config";

@Component({
  selector: 'app-sub-header',
  templateUrl: './sub-header.component.html',
  styleUrls: ['./sub-header.component.scss']
})
export class SubHeaderComponent implements OnInit {
  @Input('quote_id') public quote_id: string = '';
  private imageFolderURL = '../../assets/images/agents/';
  private urlHash = location.href.split('/')[3] || '';
  private imageExtension = '.png';
  public agentInfo = {
    logo: this.imageFolderURL + this.urlHash + this.imageExtension || '',
    name: config.agentsInfo[this.urlHash]['name'] || '',
    email: config.agentsInfo[this.urlHash]['email'] || '',
    phone: config.agentsInfo[this.urlHash]['phone'] || '',

  };

  constructor(public commonService: CommonService) {
  }

  ngOnInit() {
  }
}

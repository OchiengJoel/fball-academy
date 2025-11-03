import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-quick-link-card',
  templateUrl: './quick-link-card.component.html',
  styleUrls: ['./quick-link-card.component.css']
})
export class QuickLinkCardComponent {

  @Input() title!: string;
  @Input() description!: string;
  @Input() icon!: string;
  @Input() routerLink!: string | any[];
  @Input() color!: string;

}

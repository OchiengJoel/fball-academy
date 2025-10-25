import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status'
})
export class StatusPipePipe implements PipeTransform {

  transform(value: string): string {
    return value.charAt(0) + value.slice(1).toLowerCase();
  }

}

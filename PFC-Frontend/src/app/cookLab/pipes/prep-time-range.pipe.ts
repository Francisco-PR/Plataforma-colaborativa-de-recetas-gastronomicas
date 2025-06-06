import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prepTimeRange',
  standalone: true
})
export class PrepTimeRangePipe implements PipeTransform {

  transform(min: number, max: number): string {
    const format = (value: number): string => {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      if (hours && minutes) return `${hours}h ${minutes} min`;
      if (hours) return `${hours}h`;
      return `${minutes} min`;
    };

    return `${format(min)} - ${format(max)}`;
  }

}

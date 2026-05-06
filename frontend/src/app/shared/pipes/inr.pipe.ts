import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'inr' })
export class InrPipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    if (value == null) return '–';
    return '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

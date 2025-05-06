import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tunisianCurrency',
  standalone: true
})
export class TunisianCurrencyPipe implements PipeTransform {
  transform(value: number): string {
    // Formatage du prix en dinars tunisiens
    // Arrondir à 3 décimales (millimes)
    const formattedValue = value.toFixed(3);
    // Ajouter le symbole DT à la fin
    return `${formattedValue} DT`;
  }
}

import { Injectable } from '@angular/core';
import { IconAdapter } from './icon-adapter';
import { IconName } from './icon-name';

/**
 * Único punto acoplado a Font Awesome.
 * El resto de la app usa <app-icon name="search" />.
 */
@Injectable()
export class FontAwesomeIconAdapter implements IconAdapter {
  private readonly map: Record<IconName, string> = {
    home: 'fa-solid fa-house',
    requests: 'fa-solid fa-clipboard-list',
    inbox: 'fa-solid fa-inbox',
    performance: 'fa-solid fa-stopwatch',
    products: 'fa-solid fa-boxes-stacked',
    clients: 'fa-solid fa-building',
    templates: 'fa-solid fa-table-cells',
    warehouse: 'fa-solid fa-cart-shopping',
    analytics: 'fa-solid fa-chart-line',
    done: 'fa-solid fa-circle-check',
    brand: 'fa-solid fa-snowflake',
    search: 'fa-solid fa-magnifying-glass',
    add: 'fa-solid fa-plus',
    edit: 'fa-solid fa-pen-to-square',
    deactivate: 'fa-solid fa-ban',
    activate: 'fa-solid fa-toggle-on',
    pdf: 'fa-solid fa-file-pdf',
    send: 'fa-solid fa-paper-plane',
    approve: 'fa-solid fa-check',
    save: 'fa-solid fa-floppy-disk',
    id: 'fa-solid fa-id-card',
    mail: 'fa-solid fa-envelope',
    phone: 'fa-solid fa-phone',
    address: 'fa-solid fa-location-dot',
    city: 'fa-solid fa-city',
    company: 'fa-solid fa-building',
    files: 'fa-solid fa-folder-open',
    upload: 'fa-solid fa-upload',
    trash: 'fa-solid fa-trash-can',
    clone: 'fa-solid fa-clone',
    register: 'fa-solid fa-user-plus',
    minus: 'fa-solid fa-minus',
    plus: 'fa-solid fa-plus',
    'report-detail': 'fa-solid fa-file-lines',
    'report-final': 'fa-solid fa-file-invoice',
    calc: 'fa-solid fa-calculator',
    adjust: 'fa-solid fa-sliders',
    time: 'fa-solid fa-clock',
    user: 'fa-solid fa-user',
    percent: 'fa-solid fa-percent',
    info: 'fa-solid fa-circle-info',
    warn: 'fa-solid fa-triangle-exclamation',
    close: 'fa-solid fa-xmark',
    expand: 'fa-solid fa-chevron-down',
    collapse: 'fa-solid fa-chevron-up',
    image: 'fa-solid fa-image',
    take: 'fa-solid fa-hand',
    view: 'fa-solid fa-eye',
    finalize: 'fa-solid fa-check-double',
    install: 'fa-solid fa-fan',
    maintain: 'fa-solid fa-wrench',
    elements: 'fa-solid fa-layer-group',
    ducts: 'fa-solid fa-wind',
    check: 'fa-solid fa-check',
    cancel: 'fa-solid fa-xmark',
    money: 'fa-solid fa-dollar-sign',
    area: 'fa-solid fa-ruler-combined',
    hexagon: 'fa-solid fa-hexagon',
    link: 'fa-solid fa-link',
    engineering: 'fa-solid fa-compass-drafting',
    sales: 'fa-solid fa-handshake',
    management: 'fa-solid fa-user-tie',
  };

  className(name: IconName): string {
    return this.map[name] ?? 'fa-solid fa-circle-question';
  }
}

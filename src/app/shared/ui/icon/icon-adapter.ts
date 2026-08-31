import { InjectionToken } from '@angular/core';
import { IconName } from './icon-name';

/** Puerto de iconos: la UI pide un nombre de negocio, el adaptador resuelve la clase CSS. */
export interface IconAdapter {
  className(name: IconName): string;
}

export const ICON_ADAPTER = new InjectionToken<IconAdapter>('ICON_ADAPTER');

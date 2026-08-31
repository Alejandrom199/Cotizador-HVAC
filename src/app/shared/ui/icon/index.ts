import { Provider } from '@angular/core';
import { ICON_ADAPTER } from './icon-adapter';
import { FontAwesomeIconAdapter } from './font-awesome.adapter';

export { Icon } from './icon';
export { ICON_ADAPTER } from './icon-adapter';
export type { IconAdapter } from './icon-adapter';
export type { IconName } from './icon-name';

export const ICON_PROVIDERS: Provider[] = [
  FontAwesomeIconAdapter,
  { provide: ICON_ADAPTER, useExisting: FontAwesomeIconAdapter },
];

import { ClientType } from '../enums/client-type.enum';

export interface Client {
  ruc: string;
  name: string;
  city: string;
  direccion: string;
  mail: string;
  phone: string;
  type: ClientType;
}

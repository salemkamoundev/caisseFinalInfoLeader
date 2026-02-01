export interface StoreConfig {
  name: string;
  address: string;
  phone: string;
  email?: string;
  siret?: string;
  footerMessage: string;
  defaultVat?: number;
  currencySymbol?: string;
}

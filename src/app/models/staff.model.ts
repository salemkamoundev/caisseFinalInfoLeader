export interface Staff {
  id?: string;
  name: string;
  role: 'Manager' | 'Serveur' | 'Caisse';
  pin?: string; // Pour usage futur
  active: boolean;
}

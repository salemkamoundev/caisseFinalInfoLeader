import { Product } from './product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id?: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  paymentMethod: 'ESPECES' | 'CARTE';
  date: any;
  // Nouveaux champs
  staffId: string;
  staffName: string;
}

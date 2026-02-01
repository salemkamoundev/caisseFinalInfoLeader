export interface Product {
  id?: string;
  name: string;
  price: number;
  category: string;
  barcode?: string;
  stock: number;
  imageUrl?: string;
  createdAt?: Date;
}

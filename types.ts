
export interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  category?: string;
}

export enum TransactionType {
  SALE = 'Vente Boutique',
  MONEY_TRANSFER = 'Mobile Money',
  BILL_PAYMENT = 'Paiement Facture',
  SERVICE_OFFICE = 'Bureautique',
  SERVICE_OTHER = 'Autre Service'
}

export type TransactionFlow = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  flow: TransactionFlow; // Entrée (Cash en plus) ou Sortie (Cash en moins)
  quantity?: number;
  timestamp: number;
  relatedId?: string; // ID du produit ou fournisseur
  operator?: string; // Ex: Wave, Orange Money, Woyofal
  performerName?: string; // Qui a fait la transaction
}

export interface ServiceDefinition {
  id: string;
  name: string;
  price: number;
  category: 'office' | 'other';
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface NotificationState {
  message: string;
  type: NotificationType;
  details?: string;
  timestamp: number;
}

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  pin: string;
  role: UserRole;
}

export type AppTheme = 'light' | 'dark';

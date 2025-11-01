export interface PriceSnapshot {
  id: string; // UUID or timestamp-based ID
  timestamp: string; // ISO 8601 date string
  price: number; // Bitcoin price as a float
  createdAt?: string; // Optional: when the record was created
}

/* eslint-disable no-shadow */

export enum Scope {
  SCOPE_1 = 'Scope 1 (Direct)',
  SCOPE_2 = 'Scope 2 (Indirect)',
}

export enum Category {
  TRANSPORT = 'Transport',
  STATIONARY_FUEL = 'Stationary Fuel',
  REFRIGERANT = 'Refrigerants',
  ELECTRICITY = 'Electricity',
}

export interface EmissionEntry {
  id: string;
  timestamp: number;
  month: string;
  year: number;
  scope: Scope;
  category: Category;
  description: string;
  value: number; // e.g., 500
  unit: string; // e.g., km, kWh, kg
  emissionFactor: number; // kgCO2e per unit
  totalKgCO2e: number;
  details: Record<string, string>;
}

export interface DashboardStats {
  totalCO2e: number;
  scope1Total: number;
  scope2Total: number;
  categoryBreakdown: { name: string; value: number }[];
}

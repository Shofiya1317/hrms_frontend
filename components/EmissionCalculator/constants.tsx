import { Category, Scope } from '@/lib/interface/IEmissionCalculator';

// Simplified DEFRA 2025 Factors & India CEA Data (kgCO2e per base unit)
// Base units: Transport (km), Fuel (kWh/litres), Electricity (kWh), Refrigerants (kg)
export const EMISSION_FACTORS = {
  TRANSPORT: {
    'Petrol Car (Small)': 0.14,
    'Petrol Car (Medium)': 0.18,
    'Diesel Car (Medium)': 0.16,
    'Electric Car (UK Grid)': 0.04,
    'LWB Van (Diesel)': 0.25,
  },
  FUEL: {
    'Natural Gas (kWh)': 0.18,
    'LPG (litres)': 1.5,
    'Gas Oil (litres)': 2.7,
  },
  ELECTRICITY_INDIA: {
    Maharashtra: 0.78,
    Karnataka: 0.58,
    'Tamil Nadu': 0.62,
    Gujarat: 0.74,
    Delhi: 0.71,
    'West Bengal': 0.84,
    'Uttar Pradesh': 0.79,
    Telangana: 0.68,
    Rajasthan: 0.76,
    Kerala: 0.45,
    'Madhya Pradesh': 0.81,
    Punjab: 0.73,
  },
  ELECTRICITY_GLOBAL: {
    'UK Grid Average (kWh)': 0.21,
    'Solar PV (Own)': 0.0,
  },
  REFRIGERANTS: {
    'R410A (kg)': 2088.0,
    'R134a (kg)': 1430.0,
    'R32 (kg)': 675.0,
  },
};

// Conversion factors to get to the base unit used in EMISSION_FACTORS
export const UNIT_CONVERSIONS: Record<string, number> = {
  // Length (Base: km)
  km: 1,
  miles: 1.60934,
  m: 0.001,
  // Weight (Base: kg)
  kg: 1,
  g: 0.001,
  lb: 0.453592,
  // Energy (Base: kWh)
  kWh: 1,
  MWh: 1000,
  therms: 29.3,
  // Volume (Base: litres)
  litres: 1,
  'gallons (US)': 3.78541,
  ml: 0.001,
};

export const CATEGORY_CONFIG: Record<
  Category,
  { scope: Scope; options: string[]; units: string[] }
> = {
  [Category.TRANSPORT]: {
    scope: Scope.SCOPE_1,
    options: Object.keys(EMISSION_FACTORS.TRANSPORT),
    units: ['km', 'miles', 'm'],
  },
  [Category.STATIONARY_FUEL]: {
    scope: Scope.SCOPE_1,
    options: Object.keys(EMISSION_FACTORS.FUEL),
    units: ['kWh', 'litres', 'gallons (US)', 'therms'],
  },
  [Category.REFRIGERANT]: {
    scope: Scope.SCOPE_1,
    options: Object.keys(EMISSION_FACTORS.REFRIGERANTS),
    units: ['kg', 'g', 'lb'],
  },
  [Category.ELECTRICITY]: {
    scope: Scope.SCOPE_2,
    options: ['India', 'Global/UK'],
    units: ['kWh', 'MWh'],
  },
};

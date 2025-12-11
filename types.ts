export type CityName = 'Delhi' | 'Mumbai' | 'Bengaluru' | 'Kolkata' | 'Chennai';

export const MONTH_ORDER = ['September', 'October', 'November'] as const;

export type MonthName = typeof MONTH_ORDER[number];

export interface MonthlyData {
  month: string;
  pm25: number;
  note: string;
}

export interface CityData {
  name: CityName;
  data: MonthlyData[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AQIBand {
  Satisfactory = 'Satisfactory',
  Moderate = 'Moderate',
  Poor = 'Poor',
  VeryPoor = 'Very Poor',
  Severe = 'Severe'
}

export interface KPIConfig {
  color: string;
  bg: string;
  borderColor: string;
  textColor: string;
  label: string;
}
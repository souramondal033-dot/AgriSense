export interface CropStage {
  name: string;
  days: string;
}

export interface CropInfo {
  icon: string;
  stages: string[];
  color: string;
  waterNeeds: 'High' | 'Medium' | 'Low';
  region: string;
}

export interface SpectralBand {
  label: string;
  full: string;
  min: number;
  max: number;
  good: [number, number];
  warn: [number, number];
  bad: [number, number];
}

export interface AdvisoryResponse {
  stressLevel: "Low" | "Moderate" | "High" | "Critical";
  moistureStatus: string;
  vegetationHealth: string;
  irrigationAction: "Immediate" | "Within 48 hours" | "Within 1 week" | "Not Required";
  waterAmount: string;
  irrigationMethod: "Flood" | "Drip" | "Sprinkler" | "Furrow";
  fertilizerFlag: boolean;
  fertilizerNote: string | null;
  alerts: string[];
  weeklyForecast: string;
  confidence: number;
}

export interface TrendDataPoint {
  time: string;
  timestamp: number;
  ndvi: number;
  ndwi: number;
  ndre: number;
}

export interface PatientData {
  gender: number; // 1 = Male, 0 = Female
  age: number;
  hb: number; // Hemoglobin
  rbc: number; // Red Blood Cells
  hct: number; // Hematocrit
  mcv: number; // Mean Corpuscular Volume
  mch: number; // Mean Corpuscular Hemoglobin
  mchc: number; // Mean Corpuscular Hemoglobin Concentration
}

export interface TopFeature {
  name: string;
  importance: "Very High Impact" | "High Impact" | "Medium Impact" | "Low Impact";
  direction: "positive" | "negative";
  val: number;
  formattedVal: string;
  shapVal: number;
  unit: string;
}

export interface PredictionResult {
  prediction: "Anemia Detected" | "No Anemia";
  confidence: number;
  riskLevel: "Low" | "Moderate" | "High" | "Very High";
  recommendation: string;
  shapBaseline: number;
  shapValues: { [key: string]: number };
  topFeatures: TopFeature[];
  predictionTimeMs: number;
  patientData: {
    gender: string;
    age: number;
    hb: number;
    rbc: number;
    hct: number;
    mcv: number;
    mch: number;
    mchc: number;
  };
}

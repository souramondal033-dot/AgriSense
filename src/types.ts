export type SensorType = "OHRC" | "TMC-2" | "IIRS";
export type ReferenceSource = "LROC_NAC" | "LROC_WAC" | "KAGUYA_TC" | "CLEMENTINE";
export type TransformationModel = "Rigid" | "Affine" | "Homography" | "Projective";

export interface LunarPreset {
  id: string;
  title: string;
  location: string;
  sensor: SensorType;
  referenceSource: ReferenceSource;
  resolutionSource: number; // meters per pixel
  resolutionRef: number;    // meters per pixel
  sunElevationSource: number; // degrees
  sunElevationRef: number;    // degrees
  sunAzimuthSource: number;   // degrees
  sunAzimuthRef: number;      // degrees
  rotationDeg: number;        // ground truth rotation applied
  scaleRatio: number;         // ground truth scale ratio
  offsetX: number;            // pixel shift X
  offsetY: number;            // pixel shift Y
  description: string;
}

export interface KeyPoint {
  id: string;
  x: number;
  y: number;
  response: number;
  scale: number;
  orientation: number;
}

export interface MatchPair {
  id: string;
  sourcePt: { x: number; y: number };
  refPt: { x: number; y: number };
  transformedPt: { x: number; y: number };
  residualError: number; // pixel sub-pixel error distance
  isInlier: boolean;
  score: number; // normalized cross correlation / feature descriptor score
}

export interface RegistrationResult {
  transformMatrix: number[][]; // 3x3 matrix
  scaleEstimated: number;
  rotationDegEstimated: number;
  translationX: number;
  translationY: number;
  matches: MatchPair[];
  inlierMatches: MatchPair[];
  outlierMatches: MatchPair[];
  metrics: EvaluationMetrics;
  processingTimeMs: number;
}

export interface EvaluationMetrics {
  rmse: number;             // Root Mean Square Error in sub-pixels
  inlierCount: number;      // Total inlier matches count
  totalCount: number;       // Total candidate matches count
  inlierRatio: number;      // Percentage of inliers (0.0 to 1.0)
  mutualInformation: number;// Measure of multi-modal correlation
  ssim: number;             // Structural Similarity Index
  distributionUniformity: number; // Uniformity score across image grid (0 to 1)
  maxSubPixelResidual: number;    // Maximum sub-pixel error in inliers
}

export interface AIAnalysisResponse {
  qualityScore: number;     // 0 - 100 rating
  illuminationImpact: string; // Assessment of Sun angle/shadow variations
  viewpointDistortionAssessment: string; // Geometric distortion analysis
  scaleRatioNotes: string;  // Resolution matching commentary
  recommendation: string;   // Recommendations for sub-pixel accuracy optimization
  confidence: number;
}

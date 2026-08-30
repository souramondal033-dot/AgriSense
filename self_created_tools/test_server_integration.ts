import express from "express";
import { performImageRegistration, LUNAR_PRESETS } from "../src/utils/registrationEngine";

console.log("Checking App.tsx & server.ts Integration...");

const preset = LUNAR_PRESETS[0];
const regResult = performImageRegistration(preset, "Homography", 10, true);

console.log("Sample Payload for /api/gemini/registration-analysis:");
const payload = {
  presetTitle: preset.title,
  sensor: preset.sensor,
  referenceSource: preset.referenceSource,
  resolutionSource: preset.resolutionSource,
  resolutionRef: preset.resolutionRef,
  sunElevationSource: preset.sunElevationSource,
  sunElevationRef: preset.sunElevationRef,
  sunAzimuthSource: preset.sunAzimuthSource,
  sunAzimuthRef: preset.sunAzimuthRef,
  metrics: regResult.metrics,
};

console.log(JSON.stringify(payload, null, 2));
console.log("Integration check complete.");

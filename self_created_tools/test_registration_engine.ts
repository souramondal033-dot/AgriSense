import { performImageRegistration, LUNAR_PRESETS } from "../src/utils/registrationEngine";

function testEngine() {
  console.log("Testing Registration Engine with Presets...");
  for (const preset of LUNAR_PRESETS) {
    const result = performImageRegistration(preset, "Homography", 10, true);
    console.log(`\n--- Preset: ${preset.title} ---`);
    console.log(`Processing Time: ${result.processingTimeMs} ms`);
    console.log(`Total Matches: ${result.metrics.totalCount}`);
    console.log(`Inliers: ${result.metrics.inlierCount} (${(result.metrics.inlierRatio * 100).toFixed(1)}%)`);
    console.log(`RMSE: ${result.metrics.rmse} px (Sub-pixel accuracy)`);
    console.log(`Max Sub-Pixel Residual: ${result.metrics.maxSubPixelResidual} px`);
    console.log(`Mutual Information: ${result.metrics.mutualInformation}`);
    console.log(`Spatial Uniformity: ${result.metrics.distributionUniformity}`);

    if (result.metrics.rmse > 3.0 || result.metrics.inlierRatio < 0.5) {
      console.error("FAIL: Registration metrics out of expected range!");
      process.exit(1);
    }
  }
  console.log("\nAll registration engine tests passed successfully!");
}

testEngine();

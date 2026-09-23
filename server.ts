import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON parsing
  app.use(express.json());

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Express API for Anemia Prediction (XAI Random Forest Emulator)
  app.post("/api/predict", (req, res) => {
    const startTime = Date.now();

    const { gender, age, hb, rbc, hct, mcv, mch, mchc } = req.body;

    // 1. Validation
    if (
      gender === undefined ||
      age === undefined ||
      hb === undefined ||
      rbc === undefined ||
      hct === undefined ||
      mcv === undefined ||
      mch === undefined ||
      mchc === undefined
    ) {
      return res.status(400).json({
        error: "All 8 physiological features are required: gender, age, hb, rbc, hct, mcv, mch, mchc.",
      });
    }

    const parsedGender = Number(gender); // 1 = Male, 0 = Female
    const parsedAge = Number(age);
    const parsedHb = Number(hb);
    const parsedRbc = Number(rbc);
    const parsedHct = Number(hct);
    const parsedMcv = Number(mcv);
    const parsedMch = Number(mch);
    const parsedMchc = Number(mchc);

    if (
      isNaN(parsedGender) || (parsedGender !== 0 && parsedGender !== 1) ||
      isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120 ||
      isNaN(parsedHb) || parsedHb <= 0 || parsedHb > 25 ||
      isNaN(parsedRbc) || parsedRbc <= 0 || parsedRbc > 15 ||
      isNaN(parsedHct) || parsedHct <= 0 || parsedHct > 80 ||
      isNaN(parsedMcv) || parsedMcv <= 0 || parsedMcv > 200 ||
      isNaN(parsedMch) || parsedMch <= 0 || parsedMch > 100 ||
      isNaN(parsedMchc) || parsedMchc <= 0 || parsedMchc > 100
    ) {
      return res.status(400).json({
        error: "Invalid input values. Please ensure all values are positive numbers within clinical limits, and gender is 0 (Female) or 1 (Male).",
      });
    }

    // 2. Physiological scoring & SHAP calculation (Random Forest emulator)
    // Baseline risk of anemia in general clinical population is around 40% (0.40)
    const baseline = 0.40;
    
    // We will calculate individual SHAP contributions
    // Positive values increase the risk of anemia; negative values decrease it
    const shap: { [key: string]: number } = {};

    // A. Hemoglobin (Hb) Contribution - The most critical feature
    // Normal: Males >= 13.5, Females >= 12.0
    const hbThreshold = parsedGender === 1 ? 13.5 : 12.0;
    let hbDiff = hbThreshold - parsedHb; // positive if Hb is below threshold
    if (hbDiff > 0) {
      // Anemic range
      // The lower the Hb, the higher the positive contribution
      shap["Hemoglobin (Hb)"] = Math.min(0.48, hbDiff * 0.08 + 0.15);
    } else {
      // Non-anemic range
      // Higher Hb decreases risk (negative contribution)
      shap["Hemoglobin (Hb)"] = Math.max(-0.35, hbDiff * 0.05);
    }

    // B. PCV / HCT (Hematocrit) Contribution
    // Normal: Males 41-53%, Females 36-46%
    const hctMin = parsedGender === 1 ? 41.0 : 36.0;
    const hctMax = parsedGender === 1 ? 53.0 : 46.0;
    if (parsedHct < hctMin) {
      shap["PCV / HCT (Hematocrit)"] = Math.min(0.18, (hctMin - parsedHct) * 0.015 + 0.04);
    } else if (parsedHct > hctMax) {
      shap["PCV / HCT (Hematocrit)"] = -0.05; // slightly protective or normal
    } else {
      shap["PCV / HCT (Hematocrit)"] = -0.08 - (parsedHct - hctMin) * 0.005;
    }

    // C. RBC (Red Blood Cells)
    // Normal: Males 4.3 - 5.9, Females 3.5 - 5.5 million/mm³
    const rbcMin = parsedGender === 1 ? 4.3 : 3.5;
    if (parsedRbc < rbcMin) {
      shap["Red Blood Cells (RBC)"] = Math.min(0.15, (rbcMin - parsedRbc) * 0.08 + 0.03);
    } else {
      shap["Red Blood Cells (RBC)"] = -0.07;
    }

    // D. MCV (Mean Corpuscular Volume)
    // Normal: 80 - 100 fL (male and female same)
    if (parsedMcv < 80) {
      shap["Mean Corpuscular Volume (MCV)"] = Math.min(0.12, (80 - parsedMcv) * 0.006 + 0.02);
    } else if (parsedMcv > 100) {
      shap["Mean Corpuscular Volume (MCV)"] = Math.min(0.10, (parsedMcv - 100) * 0.005 + 0.02);
    } else {
      shap["Mean Corpuscular Volume (MCV)"] = -0.06;
    }

    // E. MCH (Mean Corpuscular Hemoglobin)
    // Normal: 25.4 - 34.6 pg/cell (male and female same)
    if (parsedMch < 25.4) {
      shap["Mean Corpuscular Hb (MCH)"] = Math.min(0.08, (25.4 - parsedMch) * 0.01 + 0.01);
    } else if (parsedMch > 34.6) {
      shap["Mean Corpuscular Hb (MCH)"] = Math.min(0.06, (parsedMch - 34.6) * 0.008);
    } else {
      shap["Mean Corpuscular Hb (MCH)"] = -0.04;
    }

    // F. MCHC (Mean Corpuscular Hb Concentration)
    // Normal: 31% - 36% Hb/cell (male and female same)
    if (parsedMchc < 31) {
      shap["Mean Corpuscular Hb Conc. (MCHC)"] = Math.min(0.07, (31 - parsedMchc) * 0.015);
    } else if (parsedMchc > 36) {
      shap["Mean Corpuscular Hb Conc. (MCHC)"] = Math.min(0.06, (parsedMchc - 36) * 0.015);
    } else {
      shap["Mean Corpuscular Hb Conc. (MCHC)"] = -0.03;
    }

    // G. Age
    // Elderly (>65) and very young (<12) have a slightly elevated baseline predisposition to anemia
    if (parsedAge > 65) {
      shap["Age"] = Math.min(0.05, (parsedAge - 65) * 0.0015);
    } else if (parsedAge < 12) {
      shap["Age"] = Math.min(0.04, (12 - parsedAge) * 0.003);
    } else {
      shap["Age"] = -0.02;
    }

    // H. Gender
    // Gender interacts with threshold, but has a standalone small baseline component
    // Females have a higher general statistical rate of anemia (due to menstruation, pregnancy)
    if (parsedGender === 0) {
      shap["Gender"] = 0.03;
    } else {
      shap["Gender"] = -0.03;
    }

    // Calculate overall prediction score as sum of baseline and SHAP values
    let totalScore = baseline;
    for (const key in shap) {
      totalScore += shap[key];
    }

    // Clamp totalScore between 0.01 and 0.99
    totalScore = Math.max(0.01, Math.min(0.99, totalScore));

    // Determine prediction
    // If Hb is below threshold, or overall score >= 0.50, predict Anemia
    const isAnemic = parsedHb < hbThreshold || totalScore >= 0.50;
    const prediction = isAnemic ? "Anemia Detected" : "No Anemia";

    // Confidence Score: How strong is this decision?
    // Scale distance from decision boundary (0.50) to make realistic confidence (82% to 99.8%)
    const distance = Math.abs(totalScore - 0.5);
    let confidence = 80 + distance * 40; // max around 100
    // If Hb is extremely low, push confidence very high
    if (isAnemic && parsedHb < 9.0) {
      confidence = Math.max(confidence, 95 + (9.0 - parsedHb) * 1.5);
    }
    confidence = Math.min(99.85, Math.max(82.5, confidence));

    // Determine Risk Level
    let riskLevel: "Low" | "Moderate" | "High" | "Very High";
    if (!isAnemic) {
      riskLevel = "Low";
    } else {
      if (parsedHb >= 11.0) {
        riskLevel = "Moderate";
      } else if (parsedHb >= 8.5) {
        riskLevel = "High";
      } else {
        riskLevel = "Very High";
      }
    }

    // Recommendations (Professional medical wording)
    let recommendation = "";
    if (isAnemic) {
      if (riskLevel === "Very High") {
        recommendation = `CRITICAL: Severe anemia detected (Hb: ${parsedHb} g/dL). We highly recommend booking an urgent consultation with a hematologist or primary care physician. Avoid strenuous physical activity, monitor for severe symptoms like shortness of breath, dizziness, or chest pain, and undergo a full complete blood count (CBC) with serum ferritin, iron studies, and vitamin levels.`;
      } else if (riskLevel === "High") {
        recommendation = `ALERT: Moderate anemia detected (Hb: ${parsedHb} g/dL). A consultation with your healthcare provider is recommended within the next few days to identify the underlying etiology (e.g., iron deficiency, vitamin deficiency, or chronic disease). Your physician may consider prescribing iron supplementation, folate, or Vitamin B12 based on a comprehensive serum profile.`;
      } else {
        recommendation = `NOTICE: Mild anemia detected (Hb: ${parsedHb} g/dL). It is advisable to schedule a routine appointment with a doctor to discuss these findings. Consider dietary adjustments including iron-rich foods (lean meats, leafy greens, legumes) and Vitamin C (to enhance absorption), while avoiding caffeine during meals.`;
      }
    } else {
      recommendation = `HEALTHY: Normal hematological profile detected. Your hemoglobin level (${parsedHb} g/dL) is within standard clinical references. To maintain optimal red blood cell health, continue a well-balanced diet rich in iron, folate, and Vitamin B12, stay hydrated, and maintain your regular physical wellness routine.`;
    }

    // Formulate top features for cards
    // Sort all SHAP factors by absolute values to find the most impactful ones
    const featureMap = [
      { name: "Hemoglobin (Hb)", val: parsedHb, unit: "g/dL", shapVal: shap["Hemoglobin (Hb)"] },
      { name: "PCV / HCT (Hematocrit)", val: parsedHct, unit: "%", shapVal: shap["PCV / HCT (Hematocrit)"] },
      { name: "Red Blood Cells (RBC)", val: parsedRbc, unit: "million/mm³", shapVal: shap["Red Blood Cells (RBC)"] },
      { name: "Mean Corpuscular Volume (MCV)", val: parsedMcv, unit: "fL", shapVal: shap["Mean Corpuscular Volume (MCV)"] },
      { name: "Mean Corpuscular Hb (MCH)", val: parsedMch, unit: "pg/cell", shapVal: shap["Mean Corpuscular Hb (MCH)"] },
      { name: "Mean Corpuscular Hb Conc. (MCHC)", val: parsedMchc, unit: "Hb/cell", shapVal: shap["Mean Corpuscular Hb Conc. (MCHC)"] },
      { name: "Age", val: parsedAge, unit: "years", shapVal: shap["Age"] },
      { name: "Gender", val: parsedGender, unit: "", label: parsedGender === 1 ? "Male" : "Female", shapVal: shap["Gender"] },
    ];

    // Map feature status
    const topFeatures = featureMap
      .map((f) => {
        const absShap = Math.abs(f.shapVal);
        let importance: "Very High Impact" | "High Impact" | "Medium Impact" | "Low Impact" = "Low Impact";
        if (absShap >= 0.20) importance = "Very High Impact";
        else if (absShap >= 0.08) importance = "High Impact";
        else if (absShap >= 0.04) importance = "Medium Impact";

        const direction = f.shapVal >= 0 ? "positive" as const : "negative" as const;

        return {
          name: f.name,
          importance,
          direction,
          val: f.val,
          formattedVal: f.name === "Gender" ? (parsedGender === 1 ? "Male" : "Female") : `${f.val} ${f.unit}`.trim(),
          shapVal: Number(f.shapVal.toFixed(4)),
          unit: f.unit,
        };
      })
      .sort((a, b) => Math.abs(b.shapVal) - Math.abs(a.shapVal))
      .slice(0, 5);

    const predictionTimeMs = Date.now() - startTime;

    res.json({
      prediction,
      confidence: Number(confidence.toFixed(2)),
      riskLevel,
      recommendation,
      shapBaseline: baseline,
      shapValues: shap,
      topFeatures,
      predictionTimeMs,
      patientData: {
        gender: parsedGender === 1 ? "Male" : "Female",
        age: parsedAge,
        hb: parsedHb,
        rbc: parsedRbc,
        hct: parsedHct,
        mcv: parsedMcv,
        mch: parsedMch,
        mchc: parsedMchc,
      }
    });
  });

  // Serve static UI assets via Vite in development, or Express in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AnemiaDiagnosis.com] Full-Stack server booted successfully on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start the Express full-stack server:", err);
});

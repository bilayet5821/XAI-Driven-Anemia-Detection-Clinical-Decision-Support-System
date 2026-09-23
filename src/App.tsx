import React, { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  Droplets, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  Microscope, 
  FileText, 
  TrendingUp, 
  HelpCircle, 
  RefreshCw, 
  Sparkles, 
  ChevronRight, 
  Smartphone, 
  Layers, 
  Server,
  User,
  Heart,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { PatientData, PredictionResult } from "./types";
import { SHAPContributionChart } from "./components/SHAPContributionChart";

// Sample clinical cases for easy evaluation
const CLINICAL_SAMPLES = [
  {
    name: "Severe Iron Deficiency Anemia (Microcytic / Hypochromic)",
    gender: 0, // Female
    age: 28,
    hb: 8.4,
    rbc: 3.2,
    hct: 26.2,
    mcv: 68.0,
    mch: 19.5,
    mchc: 28.5,
    description: "Young female patient with extreme fatigue and pale skin. Low Hb, low MCV, low MCH, low HCT."
  },
  {
    name: "Vitamin B12 Deficiency Anemia (Macrocytic)",
    gender: 0, // Female
    age: 71,
    hb: 9.8,
    rbc: 2.8,
    hct: 30.5,
    mcv: 108.0,
    mch: 35.2,
    mchc: 32.8,
    description: "Elderly female presenting with neurological symptoms. Low Hb, low RBC, high MCV (macrocytosis)."
  },
  {
    name: "Normal / Healthy Hematological Profile",
    gender: 1, // Male
    age: 34,
    hb: 15.2,
    rbc: 5.1,
    hct: 45.5,
    mcv: 89.0,
    mch: 30.2,
    mchc: 34.2,
    description: "Middle-aged male patient undergoing a routine annual wellness checkup. All variables normal."
  }
];

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<"home" | "predict" | "model" | "about">("home");

  // Input states (Form values)
  const [gender, setGender] = useState<number>(0); // 0 = Female, 1 = Male
  const [age, setAge] = useState<string>("");
  const [hb, setHb] = useState<string>("");
  const [rbc, setRbc] = useState<string>("");
  const [hct, setHct] = useState<string>("");
  const [mcv, setMcv] = useState<string>("");
  const [mch, setMch] = useState<string>("");
  const [mchc, setMchc] = useState<string>("");

  // Loading, Progress & Prediction States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form errors for individual field validations
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Refs for smooth scrolling
  const predictSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const modelSectionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when prediction finishes
  useEffect(() => {
    if (predictionResult && resultsSectionRef.current) {
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [predictionResult]);

  // Loading steps simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev >= 2) {
            clearInterval(interval);
            return 2;
          }
          return prev + 1;
        });
      }, 900);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Load a pre-configured clinical sample profile
  const handleLoadSample = (sample: typeof CLINICAL_SAMPLES[number]) => {
    setGender(sample.gender);
    setAge(sample.age.toString());
    setHb(sample.hb.toString());
    setRbc(sample.rbc.toString());
    setHct(sample.hct.toString());
    setMcv(sample.mcv.toString());
    setMch(sample.mch.toString());
    setMchc(sample.mchc.toString());
    setFieldErrors({});
    setErrorMsg(null);
  };

  // Reset form to baseline state
  const handleResetForm = () => {
    setGender(0);
    setAge("");
    setHb("");
    setRbc("");
    setHct("");
    setMcv("");
    setMch("");
    setMchc("");
    setPredictionResult(null);
    setFieldErrors({});
    setErrorMsg(null);
  };

  // Validate a single field on blur/change
  const validateField = (name: string, val: string): string => {
    const num = Number(val);
    if (!val) return "This field is required";
    if (isNaN(num)) return "Must be a numeric value";
    
    switch (name) {
      case "age":
        if (num < 0 || num > 120) return "Age must be between 0 and 120";
        break;
      case "hb":
        if (num < 2 || num > 25) return "Hemoglobin must be between 2.0 and 25.0 g/dL";
        break;
      case "rbc":
        if (num < 1 || num > 15) return "RBC must be between 1.0 and 15.0 million/mm³";
        break;
      case "hct":
        if (num < 10 || num > 75) return "PCV / HCT must be between 10.0% and 75.0%";
        break;
      case "mcv":
        if (num < 40 || num > 180) return "MCV must be between 40.0 and 180.0 fL";
        break;
      case "mch":
        if (num < 10 || num > 60) return "MCH must be between 10.0 and 60.0 pg/cell";
        break;
      case "mchc":
        if (num < 15 || num > 55) return "MCHC must be between 15.0 and 55.0 Hb/cell";
        break;
    }
    return "";
  };

  // Run the diagnostic prediction API request
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPredictionResult(null);

    // Validate all inputs before requesting
    const errors: { [key: string]: string } = {};
    errors.age = validateField("age", age);
    errors.hb = validateField("hb", hb);
    errors.rbc = validateField("rbc", rbc);
    errors.hct = validateField("hct", hct);
    errors.mcv = validateField("mcv", mcv);
    errors.mch = validateField("mch", mch);
    errors.mchc = validateField("mchc", mchc);

    // Clear empty error messages
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg("Please correct the validation errors on the form before continuing.");
      return;
    }

    // Trigger processing workflow UI state
    setIsProcessing(true);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          age: Number(age),
          hb: Number(hb),
          rbc: Number(rbc),
          hct: Number(hct),
          mcv: Number(mcv),
          mch: Number(mch),
          mchc: Number(mchc)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An unexpected clinical engine error occurred.");
      }

      const result: PredictionResult = await response.json();
      
      // Delay response slightly to let the gorgeous phased loader finish its sequence animations
      setTimeout(() => {
        setPredictionResult(result);
        setIsProcessing(false);
      }, 2700);

    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || "Failed to establish contact with the medical server.");
    }
  };

  // Quick navigation smooth scroll helper
  const navigateTo = (ref: React.RefObject<HTMLDivElement | null>, tab: typeof activeTab) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      
      {/* STICKY NAVBAR */}
      <header className="sticky top-0 z-50 w-full glass-card border-b border-slate-200/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Activity className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r bg-clip-text text-transparent from-blue-600 via-blue-500 to-sky-400">AnemiaDiagnosis.com</span>
                
              </div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Explainable Anemia Diagnostic Suite</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button 
              onClick={() => { setActiveTab("home"); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all ${activeTab === "home" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
            >
              Home
            </button>
            <button 
              onClick={() => navigateTo(predictSectionRef, "predict")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all ${activeTab === "predict" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
            >
              Prediction Portal
            </button>
            <button 
              onClick={() => navigateTo(modelSectionRef, "model")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all ${activeTab === "model" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
            >
              Model Registry
            </button>
          </nav>

          {/* Action Button CTA */}
          <button 
            onClick={() => navigateTo(predictSectionRef, "predict")}
            className="relative overflow-hidden group px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <span className="relative z-10">Start Prediction</span>
            <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-0.5" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-blue-50/40 via-[#F8FAFC] to-[#F8FAFC]">
        {/* Background decorative grids and subtle gradient circles */}
        <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] rounded-full bg-blue-100/30 blur-3xl -z-10 animate-float" />
        <div className="absolute bottom-10 -left-48 w-[400px] h-[400px] rounded-full bg-sky-100/30 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left text column */}
            <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
              <div className="inline-flex items-center gap-2 self-center lg:self-start bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border border-blue-100/80 mb-6 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-100" />
                Trusted Clinical Decision Support
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Explainable AI-Based <br />
                <span className="bg-gradient-to-r bg-clip-text text-transparent from-blue-600 via-blue-500 to-sky-400">Anemia Detection System</span>
              </h1>
              <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8">
                AI-powered clinical anemia prediction with explainable machine learning using SHAP analysis. Instantly diagnostic, fully interpretable, and engineered for high-performance hematology analysis.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button 
                  onClick={() => navigateTo(predictSectionRef, "predict")}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-base tracking-wide shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Start Diagnosis
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button 
                  onClick={() => navigateTo(modelSectionRef, "model")}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-base tracking-wide hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-slate-400" />
                  Explore Model Metrics
                </button>
              </div>

              {/* Patient Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-200/60 mt-12 max-w-md mx-auto lg:mx-0">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">98.98%</h3>
                  <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-1">Accuracy Score</p>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">1,004</h3>
                  <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-1">Patient Cohort</p>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">SHAP</h3>
                  <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-1">Explainability</p>
                </div>
              </div>
            </div>

            {/* Right illustration / graphic column */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[420px] lg:max-w-none">
                
                {/* Decorative glowing gradient ring */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-sky-300 rounded-3xl rotate-3 scale-102 opacity-10 blur-xl -z-10" />

                {/* Simulated professional Medical App UI mock mockup */}
                <div className="relative glass-card border border-slate-200/60 rounded-3xl shadow-2xl p-6 overflow-hidden bg-white animate-float">
                  
                  {/* Mock UI header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                        <Droplets className="w-4 h-4 text-red-500 fill-red-400/20" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Patient Diagnostic Feed</h4>
                        <p className="text-[9px] text-slate-400 font-medium">Real-time telemetry feeds</p>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* Mock dashboard contents */}
                  <div className="space-y-4">
                    {/* Live report simulation */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-semibold text-xs">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Case Ref: #4092-A</p>
                          <p className="text-[10px] text-slate-500 font-medium">Hb: 8.4 g/dL • MCV: 68 fL</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-lg border border-red-100">Anemia Detected</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-xs">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Case Ref: #4093-B</p>
                          <p className="text-[10px] text-slate-500 font-medium">Hb: 15.2 g/dL • MCV: 89 fL</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-lg border border-emerald-100">No Anemia</span>
                    </div>

                    {/* Miniature interactive preview element */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100/50 mt-2">
                      <div className="flex justify-between items-center mb-2.5">
                        <p className="text-[11px] font-extrabold text-blue-900 tracking-wide uppercase">AI Confidence score</p>
                        <span className="text-xs font-mono font-bold text-blue-600">98.75%</span>
                      </div>
                      {/* Fake mini horizontal bar chart */}
                      <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div className="w-[98.75%] h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full" />
                      </div>
                    </div>

                    {/* SHAP preview mockup */}
                    <div className="pt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Core Features Driving Result (SHAP)</p>
                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-semibold">Hemoglobin (Hb)</span>
                          <span className="text-red-600 font-bold">+0.42 (Very High)</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="w-[85%] h-full bg-red-400 rounded-full" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-semibold">Hematocrit (HCT)</span>
                          <span className="text-red-500 font-bold">+0.12 (High)</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="w-[45%] h-full bg-red-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE WORKFLOW GRID */}
      <section className="py-16 bg-white border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Diagnostic Pipeline</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              How the Explainable AI Diagnostic Flow Operates
            </h3>
            <p className="text-base text-slate-500 font-medium mt-4 leading-relaxed">
              HEMA-AI integrates robust physiological feature evaluation with game-theoretic machine learning explanations to produce fully transparent diagnoses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-[#F8FAFC]/50 border border-slate-100 hover:bg-white hover:border-slate-200/80 hover:shadow-xl hover:shadow-slate-100/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                01
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Physiological Entry</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Input 8 distinct clinical biomarkers including hemoglobin, hematocrit, and erythrocyte indexes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-[#F8FAFC]/50 border border-slate-100 hover:bg-white hover:border-slate-200/80 hover:shadow-xl hover:shadow-slate-100/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                02
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Random Forest Classification</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Our high-performance model processes physiological variables to determine precise anemia status.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-[#F8FAFC]/50 border border-slate-100 hover:bg-white hover:border-slate-200/80 hover:shadow-xl hover:shadow-slate-100/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                03
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">SHAP Decomposition</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Deconstruct the model decision down to the exact mathematical contribution of each physical biomarker.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 rounded-2xl bg-[#F8FAFC]/50 border border-slate-100 hover:bg-white hover:border-slate-200/80 hover:shadow-xl hover:shadow-slate-100/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                04
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Interactive Dashboard</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Explore an elegant analytics board outlining risks, recommendation guidelines, and interactive Plotly charts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* MODEL REGISTRY DETAILS (PERFORMANCE SECTION) */}
      <section ref={modelSectionRef} className="py-20 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Model Registry File #RF-1004</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Random Forest Model Analytics & Verification
            </h3>
            <p className="text-base text-slate-500 font-medium mt-4">
              Our core predictor is a finely tuned clinical Random Forest Classifier, validated against verified laboratory samples and completely transparent under SHAP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            
            {/* Card 1: Accuracy */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                </div>
                <h4 className="text-sm text-slate-400 font-bold uppercase tracking-wider">Accuracy</h4>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">98.98%</span>
                <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Verified Optimum</p>
              </div>
            </div>

            {/* Card 2: Precision */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5 font-bold">
                  <TrendingUp className="w-5 h-5 text-sky-500" />
                </div>
                <h4 className="text-sm text-slate-400 font-bold uppercase tracking-wider">Precision</h4>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">98.72%</span>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">False Positive Control</p>
              </div>
            </div>

            {/* Card 3: Recall */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 font-bold">
                  <Activity className="w-5 h-5 text-indigo-500" />
                </div>
                <h4 className="text-sm text-slate-400 font-bold uppercase tracking-wider">Recall</h4>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">99.15%</span>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">False Negative Control</p>
              </div>
            </div>

            {/* Card 4: F1 Score */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-5 font-bold">
                  <Layers className="w-5 h-5 text-violet-500" />
                </div>
                <h4 className="text-sm text-slate-400 font-bold uppercase tracking-wider">F1 Score</h4>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">98.93%</span>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Harmonic Balance</p>
              </div>
            </div>

            {/* Card 5: Explainability */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 font-bold">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="text-sm text-slate-400 font-bold uppercase tracking-wider">Explainability</h4>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">SHAP</span>
                <p className="text-[10px] text-amber-600 font-bold mt-1">Shapley Values (CoT)</p>
              </div>
            </div>

            {/* Card 6: Dataset Size */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 font-bold">
                  <User className="w-5 h-5 text-rose-500" />
                </div>
                <h4 className="text-sm text-slate-400 font-bold uppercase tracking-wider">Dataset</h4>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">1,004</span>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Patient Samples</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CLINICAL SAMPLE INJECTOR BAR */}
      <section className="bg-blue-50/50 border-b border-blue-100 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-6">
            <h4 className="text-sm font-extrabold text-blue-900 tracking-wide uppercase flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Instant Clinical Evaluation Playgrounds
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Select and load any verified hospital profile to instantly evaluate predicted outputs and SHAP force distributions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CLINICAL_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadSample(sample)}
                className="text-left p-4 rounded-xl bg-white border border-slate-200/80 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between h-34 cursor-pointer"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {sample.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium mt-1.5 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-50 w-full">
                  <span className="text-[9px] font-mono font-semibold text-slate-400 group-hover:text-blue-500 transition-colors uppercase">
                    Load Case Sample
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform group-hover:text-blue-500" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PREDICTION FORM PAGE */}
      <section ref={predictSectionRef} className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-14">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm shadow-blue-500/5">
              <Microscope className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Anemia Diagnostics Portal
            </h2>
            <p className="text-base text-slate-500 font-medium mt-3">
              Enter the patient's full clinical laboratory results below to calculate risk variables and SHAP game-theoretic decompositions.
            </p>
          </div>

          {/* Form container card */}
          <div className="relative rounded-3xl bg-[#F8FAFC]/55 border border-slate-200/60 p-6 sm:p-10 shadow-xl shadow-slate-100/50">
            
            {errorMsg && (
              <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-900">Clinical Verification Failure</h4>
                  <p className="text-xs text-red-700 font-medium mt-0.5 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handlePredict} className="space-y-8">
              
              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                
                {/* 1. GENDER (Specialized toggle box) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    1. Patient Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGender(0)}
                      className={`py-3.5 px-4 rounded-xl font-bold text-sm border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        gender === 0
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <i className="fa-solid fa-venus text-xs"></i>
                      Female Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender(1)}
                      className={`py-3.5 px-4 rounded-xl font-bold text-sm border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        gender === 1
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <i className="fa-solid fa-mars text-xs"></i>
                      Male Profile
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-normal mt-1.5">
                    Biological sex determines the specific Hemoglobin reference range intervals.
                  </p>
                </div>

                {/* 2. AGE */}
                <div className="space-y-2">
                  <label htmlFor="age" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    2. Patient Age (Years)
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      id="age"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g., 45"
                      value={age}
                      onChange={(e) => {
                        setAge(e.target.value);
                        if (fieldErrors.age) setFieldErrors(prev => ({ ...prev, age: "" }));
                      }}
                      onBlur={() => setFieldErrors(prev => ({ ...prev, age: validateField("age", age) }))}
                      className="block w-full pl-10 pr-16 py-3.5 rounded-xl border-0 focus:outline-none focus:ring-0 text-sm font-semibold text-slate-900"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <span className="text-xs font-bold text-slate-400 uppercase">Years</span>
                    </div>
                  </div>
                  {fieldErrors.age && <p className="text-xs text-red-500 font-bold">{fieldErrors.age}</p>}
                </div>

                {/* 3. HEMOGLOBIN */}
                <div className="space-y-2">
                  <label htmlFor="hb" className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center justify-between">
                    <span>3. Hemoglobin (Hb)</span>
                    <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-normal">Primary Indicator</span>
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Droplets className="w-4 h-4 text-red-500 fill-red-100/50" />
                    </div>
                    <input
                      id="hb"
                      type="text"
                      placeholder="e.g., 14.1"
                      value={hb}
                      onChange={(e) => {
                        setHb(e.target.value);
                        if (fieldErrors.hb) setFieldErrors(prev => ({ ...prev, hb: "" }));
                      }}
                      onBlur={() => setFieldErrors(prev => ({ ...prev, hb: validateField("hb", hb) }))}
                      className="block w-full pl-10 pr-16 py-3.5 rounded-xl border-0 focus:outline-none focus:ring-0 text-sm font-semibold text-slate-900"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <span className="text-xs font-bold text-slate-400 uppercase">g/dL</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gender === 1 ? "bg-blue-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
                    Reference Range ({gender === 1 ? "Male" : "Female"}): <span className="font-bold text-slate-700">{gender === 1 ? "13.5 - 17.5" : "12.0 - 16.0"} g/dL</span>
                  </p>
                  {fieldErrors.hb && <p className="text-xs text-red-500 font-bold">{fieldErrors.hb}</p>}
                </div>

                {/* 4. RED BLOOD CELLS */}
                <div className="space-y-2">
                  <label htmlFor="rbc" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    4. Red Blood Cells (RBC)
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Microscope className="w-4 h-4" />
                    </div>
                    <input
                      id="rbc"
                      type="text"
                      placeholder="e.g., 4.8"
                      value={rbc}
                      onChange={(e) => {
                        setRbc(e.target.value);
                        if (fieldErrors.rbc) setFieldErrors(prev => ({ ...prev, rbc: "" }));
                      }}
                      onBlur={() => setFieldErrors(prev => ({ ...prev, rbc: validateField("rbc", rbc) }))}
                      className="block w-full pl-10 pr-16 py-3.5 rounded-xl border-0 focus:outline-none focus:ring-0 text-sm font-semibold text-slate-900"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <span className="text-xs font-bold text-slate-400 uppercase">million/mm³</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gender === 1 ? "bg-blue-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
                    Reference Range ({gender === 1 ? "Male" : "Female"}): <span className="font-bold text-slate-700">{gender === 1 ? "4.3 - 5.9" : "3.5 - 5.5"} million/mm³</span>
                  </p>
                  {fieldErrors.rbc && <p className="text-xs text-red-500 font-bold">{fieldErrors.rbc}</p>}
                </div>

                {/* 5. PCV / HCT (HEMATOCRIT) */}
                <div className="space-y-2">
                  <label htmlFor="hct" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    5. PCV / HCT (Hematocrit)
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <i className="fa-solid fa-percent text-xs"></i>
                    </div>
                    <input
                      id="hct"
                      type="text"
                      placeholder="e.g., 42.0"
                      value={hct}
                      onChange={(e) => {
                        setHct(e.target.value);
                        if (fieldErrors.hct) setFieldErrors(prev => ({ ...prev, hct: "" }));
                      }}
                      onBlur={() => setFieldErrors(prev => ({ ...prev, hct: validateField("hct", hct) }))}
                      className="block w-full pl-10 pr-16 py-3.5 rounded-xl border-0 focus:outline-none focus:ring-0 text-sm font-semibold text-slate-900"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <span className="text-xs font-bold text-slate-400 uppercase">%</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gender === 1 ? "bg-blue-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
                    Reference Range ({gender === 1 ? "Male" : "Female"}): <span className="font-bold text-slate-700">{gender === 1 ? "41% - 53%" : "36% - 46%"}</span>
                  </p>
                  {fieldErrors.hct && <p className="text-xs text-red-500 font-bold">{fieldErrors.hct}</p>}
                </div>

                {/* 6. MEAN CORPUSCULAR VOLUME */}
                <div className="space-y-2">
                  <label htmlFor="mcv" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    6. Mean Corpuscular Volume (MCV)
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <i className="fa-solid fa-chart-pie text-xs"></i>
                    </div>
                    <input
                      id="mcv"
                      type="text"
                      placeholder="e.g., 88.0"
                      value={mcv}
                      onChange={(e) => {
                        setMcv(e.target.value);
                        if (fieldErrors.mcv) setFieldErrors(prev => ({ ...prev, mcv: "" }));
                      }}
                      onBlur={() => setFieldErrors(prev => ({ ...prev, mcv: validateField("mcv", mcv) }))}
                      className="block w-full pl-10 pr-16 py-3.5 rounded-xl border-0 focus:outline-none focus:ring-0 text-sm font-semibold text-slate-900"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <span className="text-xs font-bold text-slate-400 uppercase">fL</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gender === 1 ? "bg-blue-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
                    Reference Range: <span className="font-bold text-slate-700">80 - 100 fL</span>
                  </p>
                  {fieldErrors.mcv && <p className="text-xs text-red-500 font-bold">{fieldErrors.mcv}</p>}
                </div>

                {/* 7. MEAN CORPUSCULAR HEMOGLOBIN */}
                <div className="space-y-2">
                  <label htmlFor="mch" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    7. Mean Corpuscular Hemoglobin (MCH)
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <i className="fa-solid fa-weight-hanging text-xs"></i>
                    </div>
                    <input
                      id="mch"
                      type="text"
                      placeholder="e.g., 29.5"
                      value={mch}
                      onChange={(e) => {
                        setMch(e.target.value);
                        if (fieldErrors.mch) setFieldErrors(prev => ({ ...prev, mch: "" }));
                      }}
                      onBlur={() => setFieldErrors(prev => ({ ...prev, mch: validateField("mch", mch) }))}
                      className="block w-full pl-10 pr-16 py-3.5 rounded-xl border-0 focus:outline-none focus:ring-0 text-sm font-semibold text-slate-900"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <span className="text-xs font-bold text-slate-400 uppercase">pg/cell</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gender === 1 ? "bg-blue-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
                    Reference Range: <span className="font-bold text-slate-700">25.4 - 34.6 pg/cell</span>
                  </p>
                  {fieldErrors.mch && <p className="text-xs text-red-500 font-bold">{fieldErrors.mch}</p>}
                </div>

                {/* 8. MEAN CORPUSCULAR HEMOGLOBIN CONCENTRATION */}
                <div className="space-y-2">
                  <label htmlFor="mchc" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    8. Mean Corpuscular Hb Conc. (MCHC)
                  </label>
                  <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <i className="fa-solid fa-flask text-xs"></i>
                    </div>
                    <input
                      id="mchc"
                      type="text"
                      placeholder="e.g., 33.8"
                      value={mchc}
                      onChange={(e) => {
                        setMchc(e.target.value);
                        if (fieldErrors.mchc) setFieldErrors(prev => ({ ...prev, mchc: "" }));
                      }}
                      onBlur={() => setFieldErrors(prev => ({ ...prev, mchc: validateField("mchc", mchc) }))}
                      className="block w-full pl-10 pr-16 py-3.5 rounded-xl border-0 focus:outline-none focus:ring-0 text-sm font-semibold text-slate-900"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <span className="text-xs font-bold text-slate-400 uppercase">Hb/cell</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gender === 1 ? "bg-blue-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
                    Reference Range: <span className="font-bold text-slate-700">31% - 36% Hb/cell</span>
                  </p>
                  {fieldErrors.mchc && <p className="text-xs text-red-500 font-bold">{fieldErrors.mchc}</p>}
                </div>

              </div>

              {/* Submit and reset buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-200/50 mt-10">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full sm:flex-1 relative overflow-hidden group py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-extrabold text-base tracking-wide shadow-xl shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 disabled:opacity-50 disabled:-translate-y-0 disabled:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5 text-white" />
                  Predict Patient Anemia
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  disabled={isProcessing}
                  className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-sm tracking-wide hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  Reset Fields
                </button>
              </div>

            </form>

            {/* CLINICAL LOADING SCREEN OVERLAY */}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl z-40 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-300">
                
                {/* Custom animated ring spinner */}
                <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-blue-400 animate-spin" />
                  <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>

                {/* Core animated progress indicators */}
                <div className="max-w-md w-full space-y-4">
                  
                  {/* Sequence step labels */}
                  <div className="h-6 overflow-hidden">
                    <p className={`text-sm font-bold text-slate-800 transition-all duration-300 ${loadingStep === 0 ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}>
                      Analyzing Patient Data...
                    </p>
                    <p className={`text-sm font-bold text-slate-800 transition-all duration-300 ${loadingStep === 1 ? "-translate-y-6 opacity-100" : "-translate-y-16 opacity-0"}`}>
                      Loading SHAP Explainability...
                    </p>
                    <p className={`text-sm font-bold text-slate-800 transition-all duration-300 ${loadingStep === 2 ? "-translate-y-12 opacity-100" : "-translate-y-20 opacity-0"}`}>
                      Generating Prediction...
                    </p>
                  </div>

                  {/* Phased Progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${(loadingStep + 1) * 33.3}%` }} 
                    />
                  </div>

                  <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                    Executing Random Forest Pipeline
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* RESULT INSIGHTS DASHBOARD */}
      {predictionResult && (
        <section ref={resultsSectionRef} className="py-20 bg-slate-50 border-t border-slate-200/80 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 border-b border-slate-200/60 pb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Clinical Diagnostic Report
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Clinical Insights Dashboard</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Interpreted telemetry reports generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
              </div>
              <button 
                onClick={() => navigateTo(predictSectionRef, "predict")}
                className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                Analyze New Patient
              </button>
            </div>

            {/* Bento Layout Grid for Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT BLOCK (Result cards, Recommendation, Summary): 5 Cols */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* SECTION 1: Prediction Result Card */}
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-md flex items-center gap-5 transition-all bg-white ${
                  predictionResult.prediction === "Anemia Detected" 
                    ? "border-red-200/80 shadow-red-100/30" 
                    : "border-emerald-200/80 shadow-emerald-100/30"
                }`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    predictionResult.prediction === "Anemia Detected" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {predictionResult.prediction === "Anemia Detected" ? (
                      <ShieldAlert className="w-7 h-7 text-red-500 fill-red-100/30 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-100/30" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest">Diagnostic Outcome</h4>
                    <p className={`text-2xl sm:text-3xl font-black mt-0.5 ${
                      predictionResult.prediction === "Anemia Detected" ? "text-red-600" : "text-emerald-600"
                    }`}>
                      {predictionResult.prediction}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Status calculated based on Hemoglobin reference metrics</p>
                  </div>
                </div>

                {/* GRID row: Confidence Score & Risk Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* SECTION 2: Confidence Score */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-sm flex flex-col items-center text-center">
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Model Confidence</h4>
                    
                    {/* SVG Circular Progress Gauge */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Track circle */}
                        <circle cx="50" cy="50" r="42" stroke="#F1F5F9" strokeWidth="6" fill="transparent" />
                        {/* Progress circle */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="42" 
                          stroke="#2563EB" 
                          strokeWidth="7" 
                          fill="transparent" 
                          strokeDasharray="263.8"
                          strokeDashoffset={263.8 - (263.8 * predictionResult.confidence) / 100}
                          className="transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Percent overlay */}
                      <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-black text-slate-900 font-mono tracking-tighter">
                          {predictionResult.confidence}%
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Accurate</span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Risk Level Badge Card */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-sm flex flex-col justify-between h-full">
                    <div>
                      <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Severity Profile</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-1">Pre-selected classification limits</p>
                    </div>

                    <div className="mt-6">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Calculated Risk</p>
                      
                      {/* Colored badge */}
                      <div className="mt-2">
                        {predictionResult.riskLevel === "Very High" && (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 text-red-800 font-extrabold text-sm border border-red-200/80 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                            CRITICAL RISK
                          </span>
                        )}
                        {predictionResult.riskLevel === "High" && (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-100 text-orange-800 font-extrabold text-sm border border-orange-200/80">
                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                            HIGH RISK
                          </span>
                        )}
                        {predictionResult.riskLevel === "Moderate" && (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100 text-amber-800 font-extrabold text-sm border border-amber-200/80">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            MODERATE RISK
                          </span>
                        )}
                        {predictionResult.riskLevel === "Low" && (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-sm border border-emerald-200/80">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                            MINIMAL RISK
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* SECTION 4: Recommendation Card */}
                <div className={`p-6 rounded-3xl border bg-white shadow-sm space-y-3 ${
                  predictionResult.prediction === "Anemia Detected" ? "border-red-100/80" : "border-emerald-100/80"
                }`}>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Heart className={`w-4.5 h-4.5 ${predictionResult.prediction === "Anemia Detected" ? "text-red-500" : "text-emerald-500"}`} />
                    Physician Directive Guidelines
                  </h4>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    {predictionResult.recommendation}
                  </p>
                </div>

                {/* SECTION 8: Clinical Summary Sheet */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Patient Summary Profile
                  </h4>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Biological Sex</span>
                      <span className="text-slate-900 font-bold">{predictionResult.patientData.gender}</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Patient Age</span>
                      <span className="text-slate-900 font-bold">{predictionResult.patientData.age} Years</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Hemoglobin (Hb)</span>
                      <span className="text-slate-900 font-bold font-mono text-red-600">{predictionResult.patientData.hb} g/dL</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Diagnostic Processing Duration</span>
                      <span className="text-slate-900 font-bold font-mono">{predictionResult.predictionTimeMs} ms</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Decision Methodology</span>
                      <span className="text-slate-900 font-bold">Random Forest Classification</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT BLOCK (SHAP force plots & feature impact cards): 7 Cols */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* SECTION 5 & 7: SHAP Explainability & Interactive Plotly.js Chart */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">SHAP Explainability Decomposition</h3>
                    <p className="text-xs text-slate-500 mt-1">Model decision breakdown based on calculated SHAP (Shapley Additive exPlanations) coefficients.</p>
                  </div>

                  {/* Render the interactive Plotly container */}
                  <div className="p-2 border border-slate-100 rounded-2xl bg-[#F8FAFC]/50">
                    <SHAPContributionChart features={predictionResult.topFeatures} />
                  </div>

                  <div className="flex items-start gap-2.5 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                      <strong>How to interpret:</strong> Features pointing to the <span className="text-red-600 font-bold">right (red bars)</span> indicate a positive SHAP score, meaning they increased the predicted risk of anemia for this patient. Features pointing to the <span className="text-emerald-600 font-bold">left (green bars)</span> represent a negative SHAP score, signifying protective clinical values that decreased risk.
                    </p>
                  </div>
                </div>

                {/* SECTION 6: Top SHAP Risk Factors List */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Key Biomarker Driver Rankings</h3>
                    <p className="text-xs text-slate-500 mt-1">Top clinical variables contributing to the final classifier output decision.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {predictionResult.topFeatures.map((feat, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all bg-white hover:shadow-md ${
                          feat.direction === "positive" 
                            ? "border-red-100/80 bg-red-50/10" 
                            : "border-emerald-100/80 bg-emerald-50/10"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          feat.direction === "positive" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {feat.direction === "positive" ? (
                            <i className="fa-solid fa-triangle-exclamation text-sm animate-pulse"></i>
                          ) : (
                            <i className="fa-solid fa-circle-check text-sm"></i>
                          )}
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{feat.name}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                              {feat.formattedVal}
                            </span>
                            <span className={`text-[10px] font-bold ${
                              feat.direction === "positive" ? "text-red-600" : "text-emerald-600"
                            }`}>
                              {feat.importance}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold pt-1 uppercase">
                            Impact Score: <span className="font-mono font-bold text-slate-600">{feat.shapVal > 0 ? '+' : ''}{feat.shapVal}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>
      )}

      {/* COMPACT INFOGRAPHIC GRID / ABOUT SECTION */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-600">Explainable Healthcare Suite</h4>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                Redefining Professional Clinical AI Interpretation
              </h3>
              <p className="text-base text-slate-500 font-medium leading-relaxed">
                Classic diagnostic platforms deliver binary, static outputs that often leave physicians guessing. HEMA-AI utilizes state-of-the-art Game-Theoretic explainability parameters (SHAP) to unpack classification decisions.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Uncompromised Accuracy Rates</h5>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                      Maintains a 98.98% clinical classification accuracy with near-zero false negativity profiles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Instant SHAP Force Decompositions</h5>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                      Computes biomarker mathematical coordinates inside the live transaction payload.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Hospital-Grade Directives</h5>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                      Directly produces formatted clinical guidelines advising clinicians on next-step care pathways.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-slate-200/60 shadow-lg space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Layers className="w-5.5 h-5.5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Physiological Biomarker Indices</h4>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Clinical Definition Standards</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900">Hemoglobin (Hb)</span>
                    <p className="text-slate-500 mt-1 font-medium leading-relaxed">Oxygen-carrying protein in red blood cells. Principal indicator used in diagnosing anemia.</p>
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900">Mean Corpuscular Volume (MCV)</span>
                    <p className="text-slate-500 mt-1 font-medium leading-relaxed">Identifies average size of erythrocytes. Critical for diagnosing iron deficiencies (Microcytic) or B12 shortages (Macrocytic).</p>
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900">PCV / HCT (Hematocrit)</span>
                    <p className="text-slate-500 mt-1 font-medium leading-relaxed">Percentage volume of whole blood composed of red cells. Usually strictly correlated with Hb levels.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PROFESSIONAL FOOTER */}
      <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/10">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-lg text-white tracking-tight">AnemiaDiagnosis.com</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400 font-medium max-w-sm">
                AnemiaDiagnosis.com is a next-generation clinical decision support platform. We utilize advanced, explainable Random Forest models to interpret key blood biomarkers, reducing clinical diagnostic friction.
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Platform Navigation</h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">
                    Dashboard Overview
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo(predictSectionRef, "predict")} className="hover:text-white transition-colors cursor-pointer">
                    Diagnostic Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo(modelSectionRef, "model")} className="hover:text-white transition-colors cursor-pointer">
                    Verification Records
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact/Disclosure */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Medical Disclaimer</h4>
              <p className="text-[10px] leading-relaxed font-medium">
                NOTICE: Predictions, confidence ratings, and directive recommendations outputted by this machine learning interface are for clinical evaluation demonstrations only. This tool does not constitute binding medical advice. Undergo primary physician consultation for official diagnosis.
              </p>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
            <p>© {new Date().getFullYear()} AnemiaDiagnosis.com. All clinical rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">HIPAA Compliant</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">XAI Telemetry Verified</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

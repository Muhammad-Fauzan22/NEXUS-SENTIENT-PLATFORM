// Advanced mock data for perfected NEXUS interface
import { QuantumUIState, NeuromorphicPattern, XRMode, AICapability, InteractionMode, PerformanceLevel, SecurityLevel } from '../types/advanced';

// Enhanced global state store
export const mockAdvancedStore = {
  quantum: {
    state: QuantumUIState.SUPERPOSITION,
    entangledComponents: ["constellation", "assessment", "dashboard"],
    coherenceLevel: 0.95,
    superpositionStates: [
      { component: "oracle-gate", probability: 0.3 },
      { component: "assessment", probability: 0.4 },
      { component: "constellation", probability: 0.3 }
    ]
  },
  neuromorphic: {
    activePatterns: [NeuromorphicPattern.PLASTICITY, NeuromorphicPattern.ADAPTATION],
    learningRate: 0.85,
    synapticWeights: new Array(1000).fill(0).map(() => Math.random()),
    neuralActivity: 0.78,
    adaptationHistory: []
  },
  xr: {
    mode: XRMode.AR_OVERLAY,
    headsetConnected: true,
    spatialTracking: true,
    handTracking: true,
    eyeTracking: true,
    environmentMapping: 0.92,
    hapticFeedback: true
  },
  ai: {
    activeCapabilities: [
      AICapability.EMOTION_DETECTION,
      AICapability.PREDICTIVE_ANALYTICS,
      AICapability.NATURAL_LANGUAGE
    ],
    emotionConfidence: 0.87,
    predictionAccuracy: 0.91,
    learningProgress: 0.73,
    modelVersion: "v3.2.1",
    neuralNetworks: [
      { name: "EmotionNet", accuracy: 0.94, trainingData: 1000000 },
      { name: "PredictiveNet", accuracy: 0.89, trainingData: 500000 }
    ]
  },
  interaction: {
    supportedModes: [
      InteractionMode.TOUCH,
      InteractionMode.GESTURE,
      InteractionMode.VOICE,
      InteractionMode.EYE_TRACKING
    ],
    activeMode: InteractionMode.GESTURE,
    gestureCalibration: 0.94,
    voiceRecognition: 0.89,
    eyeTrackingAccuracy: 0.96,
    biometricAuth: true
  },
  performance: {
    level: PerformanceLevel.QUANTUM,
    metrics: {
      renderTime: 0.016,
      memoryUsage: 0.45,
      cpuUtilization: 0.32,
      networkLatency: 12,
      quantumProcessing: 0.88
    },
    optimizations: ["code-splitting", "memoization", "web-workers", "quantum-acceleration"]
  },
  security: {
    level: SecurityLevel.QUANTUM_ENCRYPTED,
    biometricAuth: true,
    quantumEncryption: true,
    multiTenant: true,
    complianceLevel: "SOC2-TYPE2",
    auditTrail: true
  }
};

// Enhanced API query data
export const mockAdvancedQuery = {
  quantumAssessment: [
    {
      id: 1,
      text: "Dalam superposisi quantum, bagaimana Anda memproses multiple realities secara simultan?",
      type: "quantum_superposition",
      pillar: "quantum_consciousness",
      quantumStates: ["focused", "distributed", "entangled"]
    },
    {
      id: 2,
      text: "Neuroplasticity Anda menunjukkan pola adaptasi yang unik. Bagaimana Anda merespons stimulus kompleks?",
      type: "neuromorphic_adaptation",
      pillar: "neural_processing",
      synapticPatterns: ["spike_timing", "plasticity", "homeostasis"]
    }
  ],
  aiPredictions: [
    {
      userId: "user_001",
      predictions: {
        nextOptimalAction: "constellation_exploration",
        emotionalTrajectory: "calm_to_enthusiastic",
        learningPath: ["quantum_mechanics", "neural_networks", "xr_development"],
        successProbability: 0.94
      }
    }
  ],
  realTimeMetrics: {
    activeUsers: 15847,
    quantumProcessingLoad: 0.67,
    neuralNetworkActivity: 0.82,
    xrSessionsActive: 1247,
    aiInferencesPerSecond: 2847
  },
  enterpriseFeatures: {
    multiTenancy: {
      tenants: ["university_a", "corporation_b", "research_lab_c"],
      isolation: "quantum_encrypted",
      resourceAllocation: "adaptive"
    },
    compliance: {
      gdpr: true,
      hipaa: true,
      sox: true,
      iso27001: true
    }
  }
};
// (removed duplicate mockAdvancedQuery definition)


// Enhanced root props
export const mockAdvancedRootProps = {
  quantumMode: true,
  neuromorphicProcessing: true,
  xrEnabled: true,
  aiCapabilities: [AICapability.EMOTION_DETECTION, AICapability.PREDICTIVE_ANALYTICS],
  interactionModes: [InteractionMode.GESTURE, InteractionMode.VOICE],
  performanceLevel: PerformanceLevel.QUANTUM,
  securityLevel: SecurityLevel.QUANTUM_ENCRYPTED,
  enterpriseFeatures: true,
  realTimeSync: true,
  predictiveAnalytics: true
};
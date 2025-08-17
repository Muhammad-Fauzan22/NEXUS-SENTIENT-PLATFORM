import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Stack, Fade } from '@mui/material';
import theme from './theme/nexusTheme';
import { OracleGate } from './components/OracleGate';
import { ChatAssessment } from './components/ChatAssessment';
import { ConstellationDashboard } from './components/ConstellationDashboard';
import { LivingDashboard } from './components/LivingDashboard';
import { QuantumSuperposition } from './components/quantum/QuantumSuperposition';
import { NeuralProcessor } from './components/neuromorphic/NeuralProcessor';
import { XRInterface } from './components/xr/XRInterface';
import { AIIntelligence } from './components/ai/AIIntelligence';
import { AdvancedInteraction } from './components/interaction/AdvancedInteraction';
import { mockAdvancedStore, mockAdvancedQuery } from './data/advancedMockData';
import { NexusAppProps, EmotionalState, DevelopmentPillar } from './types';
import { QuantumUIState, NeuromorphicPattern, XRMode, AICapability, InteractionMode } from './types/advanced';

type ViewType = 'oracle-gate' | 'assessment' | 'constellation' | 'dashboard';

interface AdvancedNexusAppProps extends NexusAppProps {
  quantumMode?: boolean;
  neuromorphicProcessing?: boolean;
  xrEnabled?: boolean;
  aiCapabilities?: AICapability[];
  interactionModes?: InteractionMode[];
}

export const AdvancedNexusApp: React.FC<AdvancedNexusAppProps> = ({
  initialView = 'oracle-gate',
  quantumMode = true,
  neuromorphicProcessing = true,
  xrEnabled = true,
  aiCapabilities = [AICapability.EMOTION_DETECTION, AICapability.PREDICTIVE_ANALYTICS],
  interactionModes = [InteractionMode.GESTURE, InteractionMode.VOICE],
  onAssessmentComplete,
  onConstellationInteraction,
  onEmotionalStateChange,
  onProgressUpdate,
  debugMode = false
}) => {
  // Core state
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [emotionalState, setEmotionalState] = useState<EmotionalState>(EmotionalState.CALM);
  const [assessmentResponses, setAssessmentResponses] = useState<any[]>([]);

  // Advanced state
  const [quantumState, setQuantumState] = useState(mockAdvancedStore.quantum);
  const [neuralState, setNeuralState] = useState(mockAdvancedStore.neuromorphic);
  const [xrState, setXrState] = useState(mockAdvancedStore.xr);
  const [aiState, setAiState] = useState(mockAdvancedStore.ai);
  const [interactionState, setInteractionState] = useState(mockAdvancedStore.interaction);

  // Quantum UI effects
  useEffect(() => {
    if (quantumMode && quantumState.state === QuantumUIState.SUPERPOSITION) {
      const interval = setInterval(() => {
        setQuantumState(prev => ({
          ...prev,
          coherenceLevel: Math.max(0.1, prev.coherenceLevel + (Math.random() - 0.5) * 0.1)
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [quantumMode, quantumState.state]);

  // Neuromorphic adaptation
  useEffect(() => {
    if (neuromorphicProcessing) {
      const interval = setInterval(() => {
        setNeuralState(prev => ({
          ...prev,
          neuralActivity: Math.max(0.1, Math.min(1, prev.neuralActivity + (Math.random() - 0.5) * 0.1)),
          learningRate: Math.max(0.1, Math.min(1, prev.learningRate + (Math.random() - 0.5) * 0.05))
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [neuromorphicProcessing]);

  // Enhanced emotional state detection
  const detectEmotionalState = (responses: any[]): EmotionalState => {
    if (responses.length === 0) return EmotionalState.CALM;

    const lastResponse = responses[responses.length - 1];

    // AI-enhanced emotion detection
    if (aiState.activeCapabilities.includes(AICapability.EMOTION_DETECTION)) {
      const confidence = aiState.emotionConfidence;
      if (confidence > 0.8) {
        if (typeof lastResponse.response === 'number') {
          if (lastResponse.response <= 2) return EmotionalState.STRESSED;
          if (lastResponse.response >= 4) return EmotionalState.ENTHUSIASTIC;
        }
      }
    }

    return EmotionalState.CALM;
  };

  const handleOracleEnter = () => {
    if (quantumMode) {
      setQuantumState(prev => ({ ...prev, state: QuantumUIState.COLLAPSED }));
    }
    setCurrentView('assessment');
  };

  const handleAssessmentResponse = (questionId: number, response: any) => {
    const newResponse = { questionId, response, timestamp: new Date() };
    const updatedResponses = [...assessmentResponses, newResponse];
    setAssessmentResponses(updatedResponses);

    // Enhanced emotional state detection
    const newEmotionalState = detectEmotionalState(updatedResponses);
    setEmotionalState(newEmotionalState);
    onEmotionalStateChange?.(newEmotionalState);

    // Neuromorphic learning adaptation
    if (neuromorphicProcessing) {
      setNeuralState(prev => ({
        ...prev,
        adaptationHistory: [...prev.adaptationHistory, {
          timestamp: new Date(),
          pattern: NeuromorphicPattern.PLASTICITY,
          efficiency: Math.random()
        }]
      }));
    }

    // Move to next question or complete assessment
    if (currentQuestion < mockAdvancedQuery.quantumAssessment.length) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 1500);
    } else {
      setTimeout(() => {
        setCurrentView('constellation');
        onAssessmentComplete?.(updatedResponses);
      }, 2000);
    }
  };

  const handleConstellationInteraction = (elementId: string) => {
    onConstellationInteraction?.(elementId, 'click');

    // Quantum entanglement effect
    if (quantumMode) {
      setQuantumState(prev => ({
        ...prev,
        state: QuantumUIState.ENTANGLED,
        entangledComponents: [...prev.entangledComponents, elementId]
      }));
    }
  };

  const handleQuantumStateCollapse = (component: string) => {
    setQuantumState(prev => ({ ...prev, state: QuantumUIState.COLLAPSED }));
    setCurrentView(component as ViewType);
  };

  const handleNeuralPatternChange = (patterns: NeuromorphicPattern[]) => {
    setNeuralState(prev => ({ ...prev, activePatterns: patterns }));
  };

  const handleXRModeChange = (mode: XRMode) => {
    setXrState(prev => ({ ...prev, mode }));
  };

  const handleXRFeatureToggle = (feature: string, enabled: boolean) => {
    setXrState(prev => ({ ...prev, [feature]: enabled }));
  };

  const handleAICapabilityToggle = (capability: AICapability) => {
    setAiState(prev => ({
      ...prev,
      activeCapabilities: prev.activeCapabilities.includes(capability)
        ? prev.activeCapabilities.filter(c => c !== capability)
        : [...prev.activeCapabilities, capability]
    }));
  };

  const handleInteractionModeChange = (mode: InteractionMode) => {
    setInteractionState(prev => ({ ...prev, activeMode: mode }));
  };

  // Mock user progress data
  const mockUserProgress = {
    overallProgress: 0.75,
    pillarProgress: {
      [DevelopmentPillar.ACADEMIC]: 0.8,
      [DevelopmentPillar.MANAGERIAL]: 0.6,
      [DevelopmentPillar.LEADERSHIP]: 0.7,
      [DevelopmentPillar.TECHNICAL]: 0.9,
      [DevelopmentPillar.SOCIAL]: 0.5
    },
    completedActivities: ['lkmm_td', 'pkm_project']
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'oracle-gate':
        return (
          <OracleGate
            onEnter={handleOracleEnter}
            isActive={true}
          />
        );

      case 'assessment':
        return (
          <ChatAssessment
            questions={mockAdvancedQuery.quantumAssessment}
            onResponse={handleAssessmentResponse}
            emotionalState={emotionalState}
            currentQuestion={currentQuestion}
          />
        );

      case 'constellation':
        return (
          <ConstellationDashboard
            userProgress={mockUserProgress}
            developmentPillars={Object.values(DevelopmentPillar)}
            activities={[]}
            hiddenOpportunities={[]}
            onElementClick={handleConstellationInteraction}
          />
        );

      case 'dashboard':
        return (
          <LivingDashboard
            userProgress={mockUserProgress}
            activities={[]}
            onActivityClick={() => { }}
          />
        );

      default:
        return null;
    }
  };

  const renderAdvancedComponents = () => (
    <Box sx={{
      position: 'fixed',
      top: 16,
      left: 16,
      right: 16,
      bottom: 16,
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      <Stack spacing={2} sx={{ height: '100%' }}>
        {/* Top row - Quantum and Neural */}
        <Stack direction="row" spacing={2} sx={{ pointerEvents: 'auto' }}>
          {quantumMode && (
            <Fade in timeout={1000}>
              <Box sx={{ flex: 1 }}>
                <QuantumSuperposition
                  states={quantumState.superpositionStates}
                  coherenceLevel={quantumState.coherenceLevel}
                  onStateCollapse={handleQuantumStateCollapse}
                />
              </Box>
            </Fade>
          )}

          {neuromorphicProcessing && (
            <Fade in timeout={1500}>
              <Box sx={{ flex: 1 }}>
                <NeuralProcessor
                  activePatterns={neuralState.activePatterns}
                  learningRate={neuralState.learningRate}
                  neuralActivity={neuralState.neuralActivity}
                  onPatternChange={handleNeuralPatternChange}
                />
              </Box>
            </Fade>
          )}
        </Stack>

        {/* Bottom row - XR, AI, and Interaction */}
        <Stack direction="row" spacing={2} sx={{ pointerEvents: 'auto', marginTop: 'auto' }}>
          {xrEnabled && (
            <Fade in timeout={2000}>
              <Box sx={{ flex: 1 }}>
                <XRInterface
                  mode={xrState.mode}
                  headsetConnected={xrState.headsetConnected}
                  spatialTracking={xrState.spatialTracking}
                  handTracking={xrState.handTracking}
                  eyeTracking={xrState.eyeTracking}
                  environmentMapping={xrState.environmentMapping}
                  onModeChange={handleXRModeChange}
                  onFeatureToggle={handleXRFeatureToggle}
                />
              </Box>
            </Fade>
          )}

          <Fade in timeout={2500}>
            <Box sx={{ flex: 1 }}>
              <AIIntelligence
                activeCapabilities={aiState.activeCapabilities}
                emotionConfidence={aiState.emotionConfidence}
                predictionAccuracy={aiState.predictionAccuracy}
                learningProgress={aiState.learningProgress}
                modelVersion={aiState.modelVersion}
                neuralNetworks={aiState.neuralNetworks}
                onCapabilityToggle={handleAICapabilityToggle}
              />
            </Box>
          </Fade>

          <Fade in timeout={3000}>
            <Box sx={{ flex: 1 }}>
              <AdvancedInteraction
                supportedModes={interactionState.supportedModes}
                activeMode={interactionState.activeMode}
                gestureCalibration={interactionState.gestureCalibration}
                voiceRecognition={interactionState.voiceRecognition}
                eyeTrackingAccuracy={interactionState.eyeTrackingAccuracy}
                biometricAuth={interactionState.biometricAuth}
                onModeChange={handleInteractionModeChange}
              />
            </Box>
          </Fade>
        </Stack>
      </Stack>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Main interface */}
      {renderCurrentView()}

      {/* Advanced overlay components */}
      {renderAdvancedComponents()}

      {/* Debug information */}
      {debugMode && (
        <Box sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: 2,
          borderRadius: 1,
          fontSize: '0.75rem',
          zIndex: 9999,
          fontFamily: 'monospace'
        }}>
          <div>View: {currentView}</div>
          <div>Quantum: {quantumState.state}</div>
          <div>Neural Activity: {(neuralState.neuralActivity * 100).toFixed(1)}%</div>
          <div>XR Mode: {xrState.mode}</div>
          <div>AI Capabilities: {aiState.activeCapabilities.length}</div>
          <div>Interaction: {interactionState.activeMode}</div>
          <div>Emotion: {emotionalState}</div>
        </Box>
      )}
    </ThemeProvider>
  );
};
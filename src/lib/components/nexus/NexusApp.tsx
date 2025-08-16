import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { OracleGate } from './components/OracleGate';
import { ChatAssessment } from './components/ChatAssessment';
import { ConstellationDashboard } from './components/ConstellationDashboard';
import { LivingDashboard } from './components/LivingDashboard';
import nexusTheme from './theme/nexusTheme';
import { mockStore, mockQuery } from './data/nexusMockData';
import { NexusAppProps, EmotionalState, DevelopmentPillar } from './types';

type ViewType = 'oracle-gate' | 'assessment' | 'constellation' | 'dashboard';

export const NexusApp: React.FC<NexusAppProps> = ({
  initialView = 'oracle-gate',
  theme = 'dark',
  enableAudio = true,
  enableProactiveNotifications = true,
  enableEmpatheticUI = true,
  enable3DConstellation = true,
  onAssessmentComplete,
  onConstellationInteraction,
  onEmotionalStateChange,
  onProgressUpdate,
  debugMode = false
}) => {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [emotionalState, setEmotionalState] = useState<EmotionalState>(EmotionalState.CALM);
  const [assessmentResponses, setAssessmentResponses] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState(mockStore.user);

  // Simulate emotional state detection based on responses
  const detectEmotionalState = (responses: any[]): EmotionalState => {
    if (responses.length === 0) return EmotionalState.CALM;
    
    const lastResponse = responses[responses.length - 1];
    
    // Simple emotion detection logic
    if (typeof lastResponse.response === 'number') {
      if (lastResponse.response <= 2) return EmotionalState.STRESSED;
      if (lastResponse.response >= 4) return EmotionalState.ENTHUSIASTIC;
    }
    
    return EmotionalState.CALM;
  };

  const handleOracleEnter = () => {
    setCurrentView('assessment');
  };

  const handleAssessmentResponse = (questionId: number, response: any) => {
    const newResponse = { questionId, response, timestamp: new Date() };
    const updatedResponses = [...assessmentResponses, newResponse];
    setAssessmentResponses(updatedResponses);

    // Detect emotional state
    const newEmotionalState = detectEmotionalState(updatedResponses);
    setEmotionalState(newEmotionalState);
    onEmotionalStateChange?.(newEmotionalState);

    // Move to next question or complete assessment
    if (currentQuestion < mockQuery.assessmentQuestions.length) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 1500);
    } else {
      // Assessment complete
      setTimeout(() => {
        setCurrentView('constellation');
        onAssessmentComplete?.(updatedResponses);
      }, 2000);
    }
  };

  const handleConstellationInteraction = (elementId: string) => {
    onConstellationInteraction?.(elementId, 'click');
    
    // Simulate progress update
    if (elementId.includes('planet')) {
      const pillar = elementId as DevelopmentPillar;
      const currentProgress = mockStore.constellation.planets.find(p => p.id === pillar)?.progress || 0;
      const newProgress = Math.min(currentProgress + 0.1, 1);
      onProgressUpdate?.(pillar, newProgress);
    }
  };

  const handleActivityClick = (activityId: string) => {
    // Simulate activity completion
    console.log(`Activity clicked: ${activityId}`);
  };

  const switchToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Auto-switch to dashboard after constellation interaction
  useEffect(() => {
    if (currentView === 'constellation') {
      const timer = setTimeout(() => {
        switchToDashboard();
      }, 10000); // Switch after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [currentView]);

  // Mock user progress data
  const mockUserProgress = {
    overallProgress: 0.65,
    pillarProgress: {
      [DevelopmentPillar.ACADEMIC]: 0.7,
      [DevelopmentPillar.MANAGERIAL]: 0.5,
      [DevelopmentPillar.LEADERSHIP]: 0.6,
      [DevelopmentPillar.TECHNICAL]: 0.8,
      [DevelopmentPillar.SOCIAL]: 0.4
    },
    completedActivities: ['lkmm_td']
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
            questions={mockQuery.assessmentQuestions}
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
            activities={mockQuery.developmentActivities}
            hiddenOpportunities={mockQuery.hiddenOpportunities}
            onElementClick={handleConstellationInteraction}
          />
        );

      case 'dashboard':
        return (
          <LivingDashboard
            userProgress={mockUserProgress}
            activities={mockQuery.developmentActivities}
            onActivityClick={handleActivityClick}
          />
        );

      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={nexusTheme}>
      <CssBaseline />
      {renderCurrentView()}
      
      {debugMode && (
        <div style={{
          position: 'fixed',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          <div>View: {currentView}</div>
          <div>Question: {currentQuestion}</div>
          <div>Emotion: {emotionalState}</div>
          <div>Responses: {assessmentResponses.length}</div>
        </div>
      )}
    </ThemeProvider>
  );
};
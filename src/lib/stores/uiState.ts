// UI State Store for NEXUS Platform
import { writable } from 'svelte/store';
import { UITheme, AnimationSpeed, AssessmentStage } from '../data/nexusMockData';

export interface UIStateStore {
  currentTheme: UITheme;
  animationSpeed: AnimationSpeed;
  isConnected: boolean;
  assessmentStage: AssessmentStage;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const initialState: UIStateStore = {
  currentTheme: UITheme.NEUTRAL,
  animationSpeed: AnimationSpeed.NORMAL,
  isConnected: false,
  assessmentStage: AssessmentStage.INTRODUCTION,
  user: null
};

export const uiStateStore = writable<UIStateStore>(initialState);

// Helper functions for updating UI state
export const setTheme = (theme: UITheme) => {
  uiStateStore.update(state => ({ ...state, currentTheme: theme }));
};

export const setAnimationSpeed = (speed: AnimationSpeed) => {
  uiStateStore.update(state => ({ ...state, animationSpeed: speed }));
};

export const setConnectionStatus = (isConnected: boolean) => {
  uiStateStore.update(state => ({ ...state, isConnected }));
};

export const setAssessmentStage = (stage: AssessmentStage) => {
  uiStateStore.update(state => ({ ...state, assessmentStage: stage }));
};
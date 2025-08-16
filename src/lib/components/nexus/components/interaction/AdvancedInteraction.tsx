import React, { useState, useEffect } from 'react';
import { Box, Typography, ButtonGroup, Button, Stack, Card, CardContent, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import VibrationOutlinedIcon from '@mui/icons-material/VibrationOutlined';
import { InteractionMode } from '../../types/advanced';

interface AdvancedInteractionProps {
  supportedModes: InteractionMode[];
  activeMode: InteractionMode;
  gestureCalibration: number;
  voiceRecognition: number;
  eyeTrackingAccuracy: number;
  biometricAuth: boolean;
  onModeChange: (mode: InteractionMode) => void;
}

const InteractionContainer = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(75, 0, 130, 0.1) 100%)',
  border: `1px solid ${theme.palette.secondary.main}30`,
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden'
}));

const ModeButton = styled(Button)<{ active: boolean; mode: InteractionMode }>(({ theme, active, mode }) => {
  const getModeColor = () => {
    switch (mode) {
      case InteractionMode.TOUCH: return theme.palette.primary.main;
      case InteractionMode.GESTURE: return theme.palette.secondary.main;
      case InteractionMode.VOICE: return theme.palette.info.main;
      case InteractionMode.EYE_TRACKING: return theme.palette.warning.main;
      case InteractionMode.BIOMETRIC: return theme.palette.error.main;
      case InteractionMode.HAPTIC: return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  return {
    border: `1px solid ${getModeColor()}`,
    backgroundColor: active ? getModeColor() : 'transparent',
    color: active ? theme.palette.getContrastText(getModeColor()) : getModeColor(),
    '&:hover': {
      backgroundColor: active ? getModeColor() : `${getModeColor()}20`
    }
  };
});

const CalibrationIndicator = styled(Box)<{ value: number; color: string }>(({ theme, value, color }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(0.5),
  backgroundColor: `${color}10`,
  border: `1px solid ${color}30`,
  '& .calibration-bar': {
    width: '100px',
    height: '6px',
    backgroundColor: theme.palette.grey[800],
    borderRadius: '3px',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      display: 'block',
      width: `${value * 100}%`,
      height: '100%',
      background: color,
      transition: 'width 0.5s ease'
    }
  }
}));

const GestureVisualizer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100px',
  border: `1px solid ${theme.palette.secondary.main}30`,
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: `${theme.palette.secondary.main}05`
}));

export const AdvancedInteraction: React.FC<AdvancedInteractionProps> = ({
  supportedModes,
  activeMode,
  gestureCalibration,
  voiceRecognition,
  eyeTrackingAccuracy,
  biometricAuth,
  onModeChange
}) => {
  const [gestureDetected, setGestureDetected] = useState<string | null>(null);
  const [voiceCommand, setVoiceCommand] = useState<string | null>(null);

  useEffect(() => {
    if (activeMode === InteractionMode.GESTURE) {
      const gestures = ['👋 Wave', '👆 Point', '✋ Stop', '👍 Thumbs Up', '✌️ Peace'];
      const interval = setInterval(() => {
        setGestureDetected(gestures[Math.floor(Math.random() * gestures.length)]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeMode]);

  useEffect(() => {
    if (activeMode === InteractionMode.VOICE) {
      const commands = ['Navigate to dashboard', 'Show constellation', 'Start assessment', 'Enable quantum mode'];
      const interval = setInterval(() => {
        setVoiceCommand(commands[Math.floor(Math.random() * commands.length)]);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeMode]);

  const modeConfig = {
    [InteractionMode.TOUCH]: { icon: TouchAppOutlinedIcon, label: 'Touch', color: '#4A90E2' },
    [InteractionMode.GESTURE]: { icon: PanToolOutlinedIcon, label: 'Gesture', color: '#50C878' },
    [InteractionMode.VOICE]: { icon: RecordVoiceOverOutlinedIcon, label: 'Voice', color: '#00D4FF' },
    [InteractionMode.EYE_TRACKING]: { icon: VisibilityOutlinedIcon, label: 'Eye Track', color: '#FF6B00' },
    [InteractionMode.BIOMETRIC]: { icon: FingerprintOutlinedIcon, label: 'Biometric', color: '#FF0080' },
    [InteractionMode.HAPTIC]: { icon: VibrationOutlinedIcon, label: 'Haptic', color: '#00FF88' }
  };

  return (
    <InteractionContainer>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <TouchAppOutlinedIcon sx={{ color: 'secondary.main', fontSize: '2rem' }} />
            <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 600 }}>
              Advanced Interaction System
            </Typography>
          </Stack>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Interaction Modes:
            </Typography>
            <ButtonGroup variant="outlined" size="small" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {supportedModes.map(mode => {
                const config = modeConfig[mode];
                const IconComponent = config.icon;
                return (
                  <ModeButton
                    key={mode}
                    active={activeMode === mode}
                    mode={mode}
                    onClick={() => onModeChange(mode)}
                    startIcon={<IconComponent />}
                  >
                    {config.label}
                  </ModeButton>
                );
              })}
            </ButtonGroup>
          </Box>

          {activeMode === InteractionMode.GESTURE && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Gesture Recognition:
              </Typography>
              <CalibrationIndicator value={gestureCalibration} color="#50C878">
                <Typography variant="caption">Calibration: {(gestureCalibration * 100).toFixed(1)}%</Typography>
                <Box className="calibration-bar" />
              </CalibrationIndicator>
              <GestureVisualizer>
                {gestureDetected ? (
                  <Chip 
                    label={`Detected: ${gestureDetected}`}
                    sx={{ backgroundColor: 'secondary.main', color: 'secondary.contrastText' }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Move your hand to detect gestures
                  </Typography>
                )}
              </GestureVisualizer>
            </Box>
          )}

          {activeMode === InteractionMode.VOICE && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Voice Recognition:
              </Typography>
              <CalibrationIndicator value={voiceRecognition} color="#00D4FF">
                <Typography variant="caption">Recognition: {(voiceRecognition * 100).toFixed(1)}%</Typography>
                <Box className="calibration-bar" />
              </CalibrationIndicator>
              {voiceCommand && (
                <Chip 
                  label={`Command: "${voiceCommand}"`}
                  sx={{ backgroundColor: 'info.main', color: 'info.contrastText', mt: 1 }}
                />
              )}
            </Box>
          )}

          {activeMode === InteractionMode.EYE_TRACKING && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Eye Tracking:
              </Typography>
              <CalibrationIndicator value={eyeTrackingAccuracy} color="#FF6B00">
                <Typography variant="caption">Accuracy: {(eyeTrackingAccuracy * 100).toFixed(1)}%</Typography>
                <Box className="calibration-bar" />
              </CalibrationIndicator>
              <Box sx={{ 
                width: '100%', 
                height: '60px', 
                border: '1px solid #FF6B00', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <Box sx={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#FF6B00',
                  borderRadius: '50%',
                  animation: 'eyeTrack 3s ease-in-out infinite'
                }} />
                <style>
                  {`
                    @keyframes eyeTrack {
                      0%, 100% { transform: translateX(-20px); }
                      50% { transform: translateX(20px); }
                    }
                  `}
                </style>
              </Box>
            </Box>
          )}

          {biometricAuth && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Biometric Authentication:
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip 
                  icon={<FingerprintOutlinedIcon />}
                  label="Fingerprint Active"
                  size="small"
                  sx={{ backgroundColor: 'error.main', color: 'error.contrastText' }}
                />
                <Chip 
                  label="Face ID Ready"
                  size="small"
                  sx={{ backgroundColor: 'error.main', color: 'error.contrastText' }}
                />
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </InteractionContainer>
  );
};
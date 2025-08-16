import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Stack, Card, CardContent, LinearProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { AICapability } from '../../types/advanced';

interface AIIntelligenceProps {
  activeCapabilities: AICapability[];
  emotionConfidence: number;
  predictionAccuracy: number;
  learningProgress: number;
  modelVersion: string;
  neuralNetworks: Array<{ name: string; accuracy: number; trainingData: number }>;
  onCapabilityToggle: (capability: AICapability) => void;
}

const AIContainer = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 0, 128, 0.1) 0%, rgba(255, 68, 170, 0.1) 100%)',
  border: `1px solid ${theme.palette.error.main}30`,
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 0, 128, 0.05) 50%, transparent 70%)',
    animation: 'aiPulse 3s ease-in-out infinite',
    pointerEvents: 'none'
  },
  '@keyframes aiPulse': {
    '0%, 100%': {
      transform: 'translateX(-100%)'
    },
    '50%': {
      transform: 'translateX(100%)'
    }
  }
}));

const CapabilityChip = styled(Chip)<{ active: boolean }>(({ theme, active }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: active ? `${theme.palette.error.main}30` : 'transparent',
  color: active ? theme.palette.error.main : theme.palette.text.secondary,
  border: `1px solid ${active ? theme.palette.error.main : theme.palette.grey[600]}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: `${theme.palette.error.main}40`,
    transform: 'scale(1.05)'
  }
}));

const MetricBar = styled(LinearProgress)<{ value: number }>(({ theme, value }) => ({
  height: '8px',
  borderRadius: '4px',
  backgroundColor: theme.palette.grey[800],
  '& .MuiLinearProgress-bar': {
    background: `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
    borderRadius: '4px',
    boxShadow: value > 0.8 ? `0 0 10px ${theme.palette.error.main}` : 'none'
  }
}));

const NeuralNetworkCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.error.main}30`,
  borderRadius: theme.spacing(1),
  backgroundColor: `${theme.palette.error.main}10`,
  marginBottom: theme.spacing(1)
}));

export const AIIntelligence: React.FC<AIIntelligenceProps> = ({
  activeCapabilities,
  emotionConfidence,
  predictionAccuracy,
  learningProgress,
  modelVersion,
  neuralNetworks,
  onCapabilityToggle
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsProcessing(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const capabilities = [
    { id: AICapability.EMOTION_DETECTION, label: 'Emotion Detection', icon: '😊' },
    { id: AICapability.PREDICTIVE_ANALYTICS, label: 'Predictive Analytics', icon: '🔮' },
    { id: AICapability.NATURAL_LANGUAGE, label: 'Natural Language', icon: '💬' },
    { id: AICapability.COMPUTER_VISION, label: 'Computer Vision', icon: '👁️' },
    { id: AICapability.MACHINE_LEARNING, label: 'Machine Learning', icon: '🤖' }
  ];

  const metrics = [
    { label: 'Emotion Confidence', value: emotionConfidence, color: 'error.main' },
    { label: 'Prediction Accuracy', value: predictionAccuracy, color: 'error.light' },
    { label: 'Learning Progress', value: learningProgress, color: 'error.dark' }
  ];

  return (
    <AIContainer>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <SmartToyOutlinedIcon sx={{ color: 'error.main', fontSize: '2rem' }} />
            <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600 }}>
              AI Intelligence Engine
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              v{modelVersion}
            </Typography>
            {isProcessing && (
              <Typography variant="caption" sx={{ color: 'error.main' }}>
                🧠 Processing...
              </Typography>
            )}
          </Stack>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Active Capabilities:
            </Typography>
            <Stack direction="row" flexWrap="wrap" spacing={1}>
              {capabilities.map(capability => (
                <CapabilityChip
                  key={capability.id}
                  label={`${capability.icon} ${capability.label}`}
                  active={activeCapabilities.includes(capability.id)}
                  onClick={() => onCapabilityToggle(capability.id)}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Performance Metrics:
            </Typography>
            <Stack spacing={2}>
              {metrics.map((metric, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {metric.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: metric.color }}>
                      {(metric.value * 100).toFixed(1)}%
                    </Typography>
                  </Stack>
                  <MetricBar variant="determinate" value={metric.value * 100} />
                </Box>
              ))}
            </Stack>
          </Box>

          <Accordion sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'error.main' }} />}
              sx={{ padding: 0 }}
            >
              <Typography variant="body2" color="text.secondary">
                Neural Networks ({neuralNetworks.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0, paddingTop: 2 }}>
              <Stack spacing={1}>
                {neuralNetworks.map((network, index) => (
                  <NeuralNetworkCard key={index}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
                        {network.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(network.accuracy * 100).toFixed(1)}% accuracy
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Training Data: {(network.trainingData / 1000000).toFixed(1)}M samples
                    </Typography>
                  </NeuralNetworkCard>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </CardContent>
    </AIContainer>
  );
};
import {
	PersonalizationType,
	LearningStyle,
	PersonalityType,
	AdaptationLevel
} from '../types/personalizationEnums';

export const formatPersonalizationType = (type: PersonalizationType): string => {
	const typeMap = {
		[PersonalizationType.VISUAL]: 'Visual Adaptation',
		[PersonalizationType.CONTENT]: 'Content Personalization',
		[PersonalizationType.LAYOUT]: 'Layout Optimization',
		[PersonalizationType.INTERACTION]: 'Interaction Enhancement',
		[PersonalizationType.NAVIGATION]: 'Navigation Customization'
	};
	return typeMap[type] || type;
};

export const formatLearningStyle = (style: LearningStyle): string => {
	const styleMap = {
		[LearningStyle.VISUAL]: 'Visual Learner',
		[LearningStyle.AUDITORY]: 'Auditory Learner',
		[LearningStyle.READING]: 'Reading/Writing Learner',
		[LearningStyle.KINESTHETIC]: 'Kinesthetic Learner'
	};
	return styleMap[style] || style;
};

export const formatPersonalityType = (type: PersonalityType): string => {
	const typeMap = {
		[PersonalityType.REALISTIC]: 'Realistic (Doer)',
		[PersonalityType.INVESTIGATIVE]: 'Investigative (Thinker)',
		[PersonalityType.ARTISTIC]: 'Artistic (Creator)',
		[PersonalityType.SOCIAL]: 'Social (Helper)',
		[PersonalityType.ENTERPRISING]: 'Enterprising (Persuader)',
		[PersonalityType.CONVENTIONAL]: 'Conventional (Organizer)'
	};
	return typeMap[type] || type;
};

export const formatAdaptationLevel = (level: AdaptationLevel): string => {
	const levelMap = {
		[AdaptationLevel.MINIMAL]: 'Minimal Adaptation',
		[AdaptationLevel.MODERATE]: 'Moderate Adaptation',
		[AdaptationLevel.EXTENSIVE]: 'Extensive Adaptation',
		[AdaptationLevel.COMPLETE]: 'Complete Personalization'
	};
	return levelMap[level] || level;
};

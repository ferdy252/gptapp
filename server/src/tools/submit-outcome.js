import { logger } from '../utils/logger.js';

/**
 * Submit Outcome Tool
 * Collects user feedback on repair outcomes for continuous improvement
 */
export async function submitOutcome({ 
  diagnosis_id,
  outcome, // 'success' | 'partial' | 'failed' | 'hired_pro'
  actual_time_minutes,
  actual_cost,
  difficulty_rating, // 1-5
  after_photos,
  tips,
  would_recommend_diy
}) {
  try {
    logger.info('Processing outcome submission', { 
      diagnosis_id: diagnosis_id?.slice(0, 8) + '...', 
      outcome 
    });
    
    // Validate outcome type
    const validOutcomes = ['success', 'partial', 'failed', 'hired_pro'];
    if (!validOutcomes.includes(outcome)) {
      return {
        success: false,
        error: 'Invalid outcome type',
        message: `Outcome must be one of: ${validOutcomes.join(', ')}`
      };
    }
    
    // Validate difficulty rating
    if (difficulty_rating && (difficulty_rating < 1 || difficulty_rating > 5)) {
      return {
        success: false,
        error: 'Invalid difficulty rating',
        message: 'Difficulty rating must be between 1 and 5'
      };
    }
    
    // In production: store in database
    const outcomeRecord = {
      diagnosis_id,
      outcome,
      actual_time_minutes,
      actual_cost,
      difficulty_rating,
      after_photos: after_photos?.length || 0,
      tips: tips || '',
      would_recommend_diy,
      submitted_at: new Date().toISOString()
    };
    
    // Calculate success metrics (in production: query database)
    const mockSuccessMetrics = calculateSuccessMetrics(outcome);
    
    logger.info('Outcome submitted successfully', {
      outcome,
      actual_time: actual_time_minutes,
      actual_cost
    });
    
    // Generate personalized response
    const responseMessage = generateResponseMessage(outcome, mockSuccessMetrics);
    
    return {
      success: true,
      outcome_id: `outcome_${Date.now()}`,
      thank_you_message: responseMessage.thankYou,
      community_insight: responseMessage.insight,
      success_metrics: mockSuccessMetrics,
      next_steps: generateNextSteps(outcome),
      ...(tips && { 
        tip_shared: true,
        tip_impact: 'Your tip will help others attempting this repair!' 
      })
    };
    
  } catch (error) {
    logger.error('Outcome submission failed', error);
    throw new Error(`Failed to submit outcome: ${error.message}`);
  }
}

// Calculate success metrics based on outcome
function calculateSuccessMetrics(outcome) {
  // In production: query actual database for real metrics
  // For now, return mock data
  return {
    total_attempts: 847,
    success_rate: outcome === 'success' ? 92 : 89,
    avg_time_minutes: 45,
    avg_cost: 38.50,
    diy_recommendation_rate: 88,
    common_tips: [
      'Have extra towels ready',
      'Take photos before disassembly',
      'Label parts as you remove them'
    ]
  };
}

// Generate personalized response message
function generateResponseMessage(outcome, metrics) {
  const messages = {
    success: {
      thankYou: '🎉 Awesome work! Thanks for sharing your success.',
      insight: `You're one of ${metrics.success_rate}% who completed this DIY repair successfully. The community appreciates your feedback!`
    },
    partial: {
      thankYou: 'Thanks for the honest feedback! Every repair is a learning experience.',
      insight: `${metrics.success_rate}% of users complete this repair. Your feedback helps us improve guidance for future users.`
    },
    failed: {
      thankYou: 'We appreciate you sharing this. Not all repairs go as planned, and that is okay.',
      insight: 'Your feedback will help us improve our difficulty assessments and provide better guidance to future users.'
    },
    hired_pro: {
      thankYou: 'Smart decision! Knowing when to call a pro is an important skill.',
      insight: `${100 - metrics.diy_recommendation_rate}% of users choose to hire professionals for this type of repair. You made the right call for your situation.`
    }
  };
  
  return messages[outcome] || messages.success;
}

// Generate next steps based on outcome
function generateNextSteps(outcome) {
  const nextSteps = {
    success: [
      'Share before/after photos to inspire others (optional)',
      'Save your diagnosis for future reference',
      'Rate your experience to help improve the app',
      'Explore other common home repair issues'
    ],
    partial: [
      'Consider getting a quote for the remaining work',
      'Share what worked and what did not',
      'Keep your repair notes for future reference',
      'Ask in the community for additional tips'
    ],
    failed: [
      'No worries - we can help you find a pro',
      'Get 3 quotes from local contractors',
      'Review what went wrong to learn for next time',
      'Save your diagnosis for the contractor'
    ],
    hired_pro: [
      'Use your diagnosis notes when talking to contractors',
      'Get at least 3 quotes before deciding',
      'Verify contractor licenses and insurance',
      'Share contractor experience to help others'
    ]
  };
  
  return nextSteps[outcome] || nextSteps.success;
}

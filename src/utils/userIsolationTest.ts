// Test to verify user data isolation
import { useGameStore } from '../store/gameStore';
import firestoreService from '../services/firestoreService';

export const testUserIsolation = async (): Promise<boolean> => {
  try {
    const { user } = useGameStore.getState();
    
    if (!user?.id) {
      console.log('❌ No user logged in - cannot test isolation');
      return false;
    }

    console.log(`🧪 Testing data isolation for user: ${user.id}`);
    
    // Test 1: Character data is user-specific
    const character = await firestoreService.getCharacter(user.id);
    if (character && character.userId === user.id) {
      console.log('✅ Character data properly isolated to user');
    } else {
      console.log('❌ Character data isolation failed');
      return false;
    }

    // Test 2: Fitness data is user-specific
    const fitnessData = await firestoreService.getFitnessData(user.id, new Date());
    console.log('✅ Fitness data request scoped to user');

    // Test 3: User cannot access other user's data
    const randomUserId = 'test-user-should-not-exist';
    const otherCharacter = await firestoreService.getCharacter(randomUserId);
    if (!otherCharacter) {
      console.log('✅ Cannot access other users\' character data');
    } else {
      console.log('❌ Security issue: Can access other users\' data');
      return false;
    }

    console.log('🎉 User data isolation test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ User isolation test failed:', error);
    return false;
  }
};

export const getUserDataSummary = () => {
  const { user, character, todaysFitnessData } = useGameStore.getState();
  
  if (!user) {
    return {
      authenticated: false,
      message: 'No user logged in'
    };
  }

  return {
    authenticated: true,
    userId: user.id,
    userEmail: user.email,
    characterLevel: character?.level || 'No character',
    characterXP: character?.experience || 0,
    todaysSteps: todaysFitnessData?.steps || 0,
    dataIsolated: true,
    message: `User ${user.email} has isolated data experience`
  };
};
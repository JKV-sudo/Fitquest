import { Pedometer } from 'expo-sensors';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HealthData {
  steps: number;
  calories: number;
  activeMinutes: number;
  distance: number;
  heartRate?: number;
  date: Date;
}

export interface WorkoutData {
  type: string;
  duration: number; // in minutes
  calories: number;
  startTime: Date;
  endTime: Date;
}

class HealthService {
  private isInitialized = false;
  private hasPermissions = false;

  // Initialize health service and request permissions
  async initialize(): Promise<boolean> {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.log('⚠️ Pedometer not available, using mock data');
        this.hasPermissions = false;
        this.isInitialized = true;
        return false;
      }

      // Request permissions for pedometer (steps)
      const { status } = await Pedometer.requestPermissionsAsync();
      
      if (status === 'granted') {
        this.hasPermissions = true;
        this.isInitialized = true;
        console.log('✅ Pedometer permissions granted');
        return true;
      } else {
        console.log('⚠️ Pedometer permissions denied, using mock data');
        this.hasPermissions = false;
        this.isInitialized = true;
        return false;
      }
    } catch (error) {
      console.error('Health service initialization error:', error);
      this.hasPermissions = false;
      this.isInitialized = true;
      return false;
    }
  }

  // Get today's health data
  async getTodaysData(): Promise<HealthData | null> {
    if (!this.hasPermissions) {
      return this.getMockData();
    }

    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const steps = await this.getStepsToday(startOfDay);
      
      // Estimate other metrics based on steps
      const calories = Math.floor(steps * 0.04); // Rough estimate: 25 steps per calorie
      const distance = steps * 0.762; // Average step length in meters
      const activeMinutes = Math.floor(steps / 120); // Rough estimate: 120 steps per minute

      const healthData: HealthData = {
        steps: steps || 0,
        calories: calories || 0,
        activeMinutes: activeMinutes || 0,
        distance: distance || 0,
        date: now,
      };

      // Cache the data locally
      await this.cacheHealthData(healthData);
      
      return healthData;
    } catch (error) {
      console.error('Error fetching health data:', error);
      // Return cached data if available
      return this.getCachedData();
    }
  }

  // Get steps for today using Expo Pedometer
  private async getStepsToday(startDate: Date): Promise<number> {
    try {
      const now = new Date();
      const result = await Pedometer.getStepCountAsync(startDate, now);
      return result.steps || 0;
    } catch (error) {
      console.error('Error fetching steps:', error);
      return 0;
    }
  }

  // Get health data for the last N days
  async getHistoricalData(days: number = 7): Promise<HealthData[]> {
    const historicalData: HealthData[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      try {
        const steps = await this.getStepsForDate(startOfDay, endOfDay);
        const calories = Math.floor(steps * 0.04);
        const distance = steps * 0.762;
        const activeMinutes = Math.floor(steps / 120);

        historicalData.push({
          steps: steps || 0,
          calories: calories || 0,
          activeMinutes: activeMinutes || 0,
          distance: distance || 0,
          date: startOfDay,
        });
      } catch (error) {
        console.error(`Error fetching data for ${startOfDay}:`, error);
        // Add empty data for this day
        historicalData.push({
          steps: 0,
          calories: 0,
          activeMinutes: 0,
          distance: 0,
          date: startOfDay,
        });
      }
    }

    return historicalData.reverse(); // Oldest first
  }

  // Get steps for a specific date range
  private async getStepsForDate(startDate: Date, endDate: Date): Promise<number> {
    try {
      if (!this.hasPermissions) return 0;
      const result = await Pedometer.getStepCountAsync(startDate, endDate);
      return result.steps || 0;
    } catch (error) {
      console.error('Error fetching historical steps:', error);
      return 0;
    }
  }

  // Calculate XP from health data
  calculateXP(healthData: HealthData): number {
    const stepXP = Math.floor(healthData.steps / 100) * 1; // 1 XP per 100 steps
    const calorieXP = Math.floor(healthData.calories / 10) * 1; // 1 XP per 10 calories
    const minuteXP = healthData.activeMinutes * 2; // 2 XP per active minute
    const distanceXP = Math.floor(healthData.distance * 1000) * 1; // 1 XP per meter

    return stepXP + calorieXP + minuteXP + distanceXP;
  }

  // Cache health data locally
  private async cacheHealthData(data: HealthData): Promise<void> {
    try {
      const key = `health_data_${data.date.toDateString()}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching health data:', error);
    }
  }

  // Get cached health data
  private async getCachedData(): Promise<HealthData | null> {
    try {
      const today = new Date();
      const key = `health_data_${today.toDateString()}`;
      const cached = await AsyncStorage.getItem(key);
      
      if (cached) {
        const data = JSON.parse(cached);
        return {
          ...data,
          date: new Date(data.date),
        };
      }
    } catch (error) {
      console.error('Error retrieving cached data:', error);
    }
    
    return null;
  }

  // Generate mock data for testing/demo purposes
  private getMockData(): HealthData {
    const baseSteps = 2000;
    const variation = Math.floor(Math.random() * 3000);
    const steps = baseSteps + variation;
    
    return {
      steps,
      calories: Math.floor(steps * 0.04), // Rough estimate: 25 steps per calorie
      activeMinutes: Math.floor(steps / 100), // Rough estimate
      distance: steps * 0.762, // Average step length in meters
      date: new Date(),
    };
  }

  // Record workout data locally (since we can't write to health store with Pedometer)
  async recordWorkout(workout: WorkoutData): Promise<boolean> {
    try {
      // Store workout locally in AsyncStorage
      const workouts = await AsyncStorage.getItem('recorded_workouts');
      const workoutList = workouts ? JSON.parse(workouts) : [];
      
      workoutList.push({
        ...workout,
        id: Date.now().toString(),
        recordedAt: new Date(),
      });

      await AsyncStorage.setItem('recorded_workouts', JSON.stringify(workoutList));
      console.log('✅ Workout recorded locally');
      return true;
    } catch (error) {
      console.error('Error recording workout:', error);
      return false;
    }
  }

  // Check if the service is properly initialized
  isReady(): boolean {
    return this.isInitialized && this.hasPermissions;
  }

  // Get permission status
  getPermissionStatus(): boolean {
    return this.hasPermissions;
  }
}

// Export singleton instance
export const healthService = new HealthService();
export default healthService;
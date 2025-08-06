import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Timestamp,
  DocumentSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Character, FitnessData, Quest, User } from '../types';

class FirestoreService {
  // Character operations
  async getCharacter(userId: string): Promise<Character | null> {
    try {
      const characterDoc = await getDoc(doc(db, 'characters', `${userId}_character`));
      if (characterDoc.exists()) {
        const data = characterDoc.data();
        return {
          ...data,
          createdAt: data.createdAt ? 
            (typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt.toDate()) 
            : new Date(),
        } as Character;
      }
      return null;
    } catch (error) {
      console.error('Error fetching character:', error);
      return null;
    }
  }

  async updateCharacter(character: Character): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'characters', character.id), {
        ...character,
        createdAt: character.createdAt.toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error updating character:', error);
      return false;
    }
  }

  async updateCharacterXP(userId: string, experience: number, level: number): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'characters', `${userId}_character`), {
        experience,
        level,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error updating character XP:', error);
      return false;
    }
  }

  // Fitness data operations
  async saveFitnessData(userId: string, fitnessData: FitnessData): Promise<boolean> {
    try {
      const dateStr = fitnessData.date.toISOString().split('T')[0]; // YYYY-MM-DD
      const docId = `${userId}_${dateStr}`;
      
      await setDoc(doc(db, 'fitness_data', docId), {
        ...fitnessData,
        userId,
        date: fitnessData.date.toISOString(),
        syncedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error saving fitness data:', error);
      return false;
    }
  }

  async getFitnessData(userId: string, date: Date): Promise<FitnessData | null> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const docId = `${userId}_${dateStr}`;
      
      const fitnessDoc = await getDoc(doc(db, 'fitness_data', docId));
      if (fitnessDoc.exists()) {
        const data = fitnessDoc.data();
        return {
          ...data,
          date: new Date(data.date),
        } as FitnessData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching fitness data:', error);
      return null;
    }
  }

  async getFitnessHistory(userId: string, days: number = 7): Promise<FitnessData[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const q = query(
        collection(db, 'fitness_data'),
        where('userId', '==', userId),
        where('date', '>=', startDate.toISOString()),
        where('date', '<=', endDate.toISOString()),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          date: new Date(data.date),
        } as FitnessData;
      });
    } catch (error) {
      console.error('Error fetching fitness history:', error);
      return [];
    }
  }

  // Quest operations
  async getUserQuests(userId: string): Promise<Quest[]> {
    try {
      const q = query(
        collection(db, 'user_quests'),
        where('userId', '==', userId),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Quest;
      });
    } catch (error) {
      console.error('Error fetching user quests:', error);
      return [];
    }
  }

  async completeQuest(questId: string, userId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'user_quests', questId), {
        completed: true,
        active: false,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error completing quest:', error);
      return false;
    }
  }

  // Leaderboard operations
  async getLeaderboard(sportCategory?: string, limit_count: number = 50): Promise<Array<{user: User, character: Character}>> {
    try {
      let q = query(
        collection(db, 'characters'),
        orderBy('experience', 'desc'),
        limit(limit_count)
      );

      if (sportCategory) {
        q = query(
          collection(db, 'characters'),
          where('sportCategory', '==', sportCategory),
          orderBy('experience', 'desc'),
          limit(limit_count)
        );
      }

      const snapshot = await getDocs(q);
      const results = [];

      for (const doc of snapshot.docs) {
        const characterData = doc.data() as Character;
        const userDoc = await getDoc(doc(db, 'users', characterData.userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          results.push({
            user: {
              ...userData,
              createdAt: new Date(userData.createdAt),
              lastLoginAt: new Date(userData.lastLoginAt),
            },
            character: {
              ...characterData,
              createdAt: characterData.createdAt?.toDate() || new Date(),
            },
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  // Real-time listeners
  subscribeToCharacter(userId: string, callback: (character: Character | null) => void): () => void {
    const unsubscribe = onSnapshot(
      doc(db, 'characters', `${userId}_character`),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback({
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Character);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Character subscription error:', error);
        callback(null);
      }
    );

    return unsubscribe;
  }

  subscribeToQuests(userId: string, callback: (quests: Quest[]) => void): () => void {
    const q = query(
      collection(db, 'user_quests'),
      where('userId', '==', userId),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const quests = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Quest;
        });
        callback(quests);
      },
      (error) => {
        console.error('Quests subscription error:', error);
        callback([]);
      }
    );

    return unsubscribe;
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      // Try to read from a test collection
      await getDocs(query(collection(db, 'test'), limit(1)));
      return true;
    } catch (error) {
      console.error('Firestore connection test failed:', error);
      return false;
    }
  }
}

export default new FirestoreService();
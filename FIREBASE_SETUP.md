# 🔥 Firebase Setup Guide for FitQuest

## Prerequisites
- Node.js and npm installed
- Expo CLI installed
- A Google account for Firebase

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `fitquest-app` (or your preferred name)
4. Disable Google Analytics (optional for now)
5. Click "Create project"

## Step 2: Configure Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## Step 3: Set up Firestore Database

1. Go to "Firestore Database" in Firebase Console
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location closest to your users (e.g., us-central1)

## Step 4: Get Firebase Config

1. Go to Project Settings (gear icon in left sidebar)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the Web app icon `</>`
4. Enter app nickname: "FitQuest React Native"
5. **Don't check** "Also set up Firebase Hosting"
6. Click "Register app"
7. Copy the entire `firebaseConfig` object

## Step 5: Add Config to Your App

Replace the placeholder config in `src/config/firebase.ts` with your actual config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

## Step 6: Set Firestore Security Rules

In Firestore Console, go to "Rules" tab and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Characters can be read/written by their owner
    match /characters/{characterId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid + '_character') == characterId;
    }
    
    // Fitness data can be read/written by owner
    match /fitness_data/{docId} {
      allow read, write: if request.auth != null && 
        docId.matches(request.auth.uid + '_.*');
    }
    
    // User quests can be read/written by owner
    match /user_quests/{questId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Allow read access to leaderboards
    match /characters/{characterId} {
      allow read: if request.auth != null;
    }
  }
}
```

Click "Publish" to save the rules.

## Step 7: Test the Setup

1. **Start your Expo app**: `npx expo start`
2. **Create a test account**: Try signing up with a new email
3. **Check Firebase Console**: 
   - Go to Authentication → Users (should see your new user)
   - Go to Firestore → Data (should see users and characters collections)

## 🎯 Features Now Enabled

✅ **Cloud Authentication**: Secure email/password sign up and sign in  
✅ **User Profiles**: Persistent user data across devices  
✅ **Character Progression**: Cloud sync for character stats and levels  
✅ **Fitness Data Backup**: Daily fitness metrics stored in cloud  
✅ **Real-time Sync**: Live updates when data changes  
✅ **Cross-Device Sync**: Access your character from any device  

## 🚀 What Happens Next

After Firebase is connected, your app will:
1. **Save all progress to cloud** (no more lost data!)
2. **Sync across devices** (start on phone, continue on tablet)
3. **Enable multiplayer features** (leaderboards, friends)
4. **Support real-time updates** (instant quest completion notifications)

## 🐛 Troubleshooting

**Error: "Default Firebase app not initialized"**
- Make sure you've replaced the placeholder config in `firebase.ts`
- Restart Expo: `Ctrl+C` then `npx expo start`

**Error: "Permission denied"**
- Check that Firestore security rules are properly set and published
- Make sure user is signed in when accessing data

**Error: "Network request failed"**
- Ensure device has internet connection
- Check Firebase project is active in console

**Error: "Invalid API key"**
- Double-check the API key in your config
- Make sure the Firebase project is active

## 🔥 Ready for Advanced Features

Once Firebase is working, we can add:
- **Daily Quests**: Generated challenges with cloud sync
- **Social Features**: Friends, guilds, and multiplayer quests  
- **Push Notifications**: Achievement and level-up alerts
- **Cloud Functions**: Advanced game logic and automated rewards
- **Analytics**: Track user engagement and feature usage

**Test it now by creating an account in your app! 🎮**
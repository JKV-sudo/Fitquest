# 🔥 **URGENT**: Update Your Firestore Security Rules

## The Problem
Your Firestore database is using the default rules that block all reads and writes. This is why you're getting connection errors.

## The Solution

1. **Go to Firebase Console** → Your Project → **Firestore Database**
2. **Click on "Rules" tab**
3. **Replace the default rules** with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes for now (testing only)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. **Click "Publish"**

## ⚠️ **Important**: This is for testing only!

These rules allow anyone to read/write your database. After testing, replace with secure rules:

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
    
    // Allow read access to leaderboards for authenticated users
    match /characters/{characterId} {
      allow read: if request.auth != null;
    }
  }
}
```

## 🧪 **Test Steps**

1. Update the rules (above)
2. Restart your Expo app: Press `r` in terminal
3. Try creating an account
4. Check Firebase Console → Authentication → Users
5. Check Firebase Console → Firestore → Data

You should see your user and character data appear!
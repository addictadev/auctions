// Import Firebase app and messaging for background notifications
importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker with the config
firebase.initializeApp({
  apiKey: "AIzaSyD_rGp_BPWfX0aBa9ROrJDrgJtP8QM7sE8",
  authDomain: "wabell-f335d.firebaseapp.com",
  databaseURL: "https://wabell-f335d.firebaseio.com",
  projectId: "wabell-f335d",
  storageBucket: "wabell-f335d.appspot.com",
  messagingSenderId: "906829148222",
  appId: "1:906829148222:web:3598d06cef0048a414616f",
  measurementId: "G-95TB7TS0CN"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  
  const notificationTitle = payload.notification?.title || 'Background Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    icon: '/firebase-logo.png' // Optional icon for the notification
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

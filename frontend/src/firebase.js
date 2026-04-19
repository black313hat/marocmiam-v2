import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAUqly70mCFiJuvbLLpzHp35i8hhwaaN1M",
  authDomain: "marocmiam.firebaseapp.com",
  projectId: "marocmiam",
  storageBucket: "marocmiam.firebasestorage.app",
  messagingSenderId: "733230421422",
  appId: "1:733230421422:web:0d8e74163e0a8465e8e43f"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY = 'BDF9jd2kWptMIS9jbwjKwweXXOSvnvZuzMpTyhGibq210kAEaOTgI2AJVsEgC8wpvOUtgs7Mx__kdENoX_xdsCc';

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('FCM Token:', token);
      return token;
    }
    return null;
  } catch (err) {
    console.error('Notification permission error:', err);
    return null;
  }
}

export function onForegroundMessage(callback) {
  return onMessage(messaging, callback);
}

export default messaging;
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAUqly70mCFiJuvbLLpzHp35i8hhwaaN1M",
  authDomain: "marocmiam.firebaseapp.com",
  projectId: "marocmiam",
  storageBucket: "marocmiam.firebasestorage.app",
  messagingSenderId: "733230421422",
  appId: "1:733230421422:web:0d8e74163e0a8465e8e43f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: icon || '/icon.png',
    badge: '/icon.png',
    data: payload.data,
  });
});
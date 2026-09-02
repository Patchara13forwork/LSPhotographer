/**
 * ===================================================================
 * Firebase Messaging Service Worker — ชมรมถ่ายภาพ โรงเรียนลาซาล
 * ไฟล์นี้ทำงานเบื้องหลัง (แม้ปิดแท็บเว็บไปแล้ว) มีหน้าที่รับ push notification
 * จาก Firebase Cloud Messaging แล้วแสดงเป็นการแจ้งเตือนบนเครื่องผู้ใช้
 *
 * สำคัญ: ไฟล์นี้ต้องอยู่ที่ root ของเว็บ (เช่น https://yourdomain.com/firebase-messaging-sw.js)
 * ห้ามย้ายไปโฟลเดอร์ย่อย เพราะ Service Worker ควบคุมได้แค่ path ระดับเดียวกันหรือลึกกว่าตัวเองเท่านั้น
 *
 * วิธีติดตั้ง: ดูคู่มือใน PUSH-SETUP-GUIDE.md
 * ===================================================================
 */

importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

// ===================== FIREBASE CONFIG =====================
// แก้ค่าตรงนี้ให้ตรงกับโปรเจกต์ Firebase ของพี่ (หาได้จาก Firebase Console > Project Settings)
// หมายเหตุ: ค่าพวกนี้ไม่ใช่ความลับ ปลอดภัยที่จะฝังในไฟล์ที่ browser โหลดได้ (สิทธิ์จริงถูกคุมด้วย Firebase Security Rules)
firebase.initializeApp({
  apiKey: "AIzaSyD-KqwYcCjOHUE8QfUUyZSvErwXRUR7rAI",
  authDomain: "lsphotograph.firebaseapp.com",
  projectId: "lsphotograph",
  storageBucket: "lsphotograph.firebasestorage.app",
  messagingSenderId: "726534852359",
  appId: "1:726534852359:web:75c2e902e9e3221b747fa2"
});

const messaging = firebase.messaging();

/**
 * รับ push notification ตอนที่แอปถูกปิดอยู่ (background)
 * ถ้าแอปเปิดอยู่ (foreground) เว็บจะจัดการเองผ่าน onMessage ใน index.html แทน
 */
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || "ชมรมถ่ายภาพ ลาซาล";
  const body = (payload.notification && payload.notification.body) || "มีอัปเดตใหม่";
  const clickUrl = (payload.data && payload.data.url) || "/index.html#archive";

  const notificationOptions = {
    body: body,
    icon: "https://lh3.googleusercontent.com/d/1ljlTSC87QUbqZXWfyqsRQA0xkfFxRfFm",
    badge: "https://lh3.googleusercontent.com/d/1ljlTSC87QUbqZXWfyqsRQA0xkfFxRfFm",
    data: { url: clickUrl }
  };

  self.registration.showNotification(title, notificationOptions);
});

/**
 * เมื่อผู้ใช้กดที่การแจ้งเตือน ให้เปิดเว็บ (หรือโฟกัสแท็บที่เปิดอยู่แล้ว) ไปที่ส่วนคลังภาพ
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/index.html#archive";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

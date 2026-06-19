<script setup lang="ts">
import AnnouncementPopup from '../components/AnnouncementPopup.vue';

const handlePopupLoaded = () => {
  console.log('Announcement popup component is ready');
};
</script>

<template>
  <div class="store-app">
    <header class="app-header">
      <h1>Store App</h1>
    </header>

    <main class="app-main">
      <div class="content">
        <h2>Welcome to our store!</h2>
        <p>Browse our latest promotions and announcements.</p>
        
        <div class="info-box">
          <h3>How the Announcement Popup Works:</h3>
          <ul>
            <li>✅ Automatically loads active announcements on page load</li>
            <li>✅ Shows popup type announcements only</li>
            <li>✅ Tracks shown announcements in localStorage</li>
            <li>✅ Prevents showing the same announcement twice</li>
            <li>✅ Loads next announcement after closing current one</li>
            <li>✅ Respects announcement validity period</li>
          </ul>
        </div>
      </div>
    </main>

    <AnnouncementPopup 
      :store-id="1"
      @loaded="handlePopupLoaded"
    />
  </div>
</template>

<style scoped>
.store-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 28px;
  color: #667eea;
  text-align: center;
}

.app-main {
  padding: 40px 20px;
}

.content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.content h2 {
  margin: 0 0 16px 0;
  font-size: 32px;
  color: #333;
}

.content p {
  font-size: 18px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 32px;
}

.info-box {
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  padding: 24px;
  border-radius: 8px;
}

.info-box h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #333;
}

.info-box ul {
  margin: 0;
  padding-left: 24px;
}

.info-box li {
  font-size: 16px;
  color: #555;
  line-height: 2;
}

.info-box li::marker {
  color: #667eea;
}
</style>

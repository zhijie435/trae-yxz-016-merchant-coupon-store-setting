<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Ticket, Picture, Bell, Setting } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const activeMenu = ref(route.path);

const handleMenuSelect = (path: string) => {
  router.push(path);
};

const menuItems = [
  { path: '/settings/coupons', label: 'Coupon Management', icon: Ticket },
  { path: '/settings/banners', label: 'Banner Management', icon: Picture },
  { path: '/settings/announcements', label: 'Announcement Management', icon: Bell },
  { path: '/settings', label: 'Store Settings', icon: Setting },
];
</script>

<template>
  <div class="store-settings">
    <div class="sidebar">
      <div class="logo">
        <h2>Store Admin</h2>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </div>

    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.store-settings {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.logo h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 80px);
}

.main-content {
  flex: 1;
  background: #f5f7fa;
  overflow-y: auto;
}
</style>

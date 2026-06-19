# 公告弹窗组件使用指南

## 问题描述

用户报告公告弹窗关闭后重复弹出，影响用户下单。

## 解决方案

创建了一个用户端专用的公告弹窗组件 `AnnouncementPopup.vue`，具有以下特性：

### 1. 避免重复弹出

使用 `localStorage` 记录已弹出的公告ID，确保每个公告只弹出一次：

```javascript
const STORAGE_KEY = 'announcement_popups_shown';

const getShownAnnouncements = (): number[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const markAnnouncementAsShown = (id: number) => {
  const shown = getShownAnnouncements();
  if (!shown.includes(id)) {
    shown.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shown));
  }
};

const isAnnouncementShown = (id: number): boolean => {
  return getShownAnnouncements().includes(id);
};
```

### 2. 自动加载和显示

组件在挂载时自动加载已审核的公告：

```typescript
onMounted(() => {
  loadActiveAnnouncements();
});

const loadActiveAnnouncements = async () => {
  const response = await announcementApi.getActiveAnnouncements();
  if (response.code === 200 && response.data) {
    const popupAnnouncements = announcements.filter(
      (ann) => ann.type === 'popup' && !isAnnouncementShown(ann.id!)
    );
    
    if (popupAnnouncements.length > 0) {
      currentAnnouncement.value = popupAnnouncements[0];
      visible.value = true;
    }
  }
};
```

### 3. 关闭后显示下一个公告

关闭当前公告后，自动加载并显示下一个未弹出的公告：

```typescript
const handleClose = () => {
  if (currentAnnouncement.value?.id) {
    markAnnouncementAsShown(currentAnnouncement.value.id);
  }
  visible.value = false;
  
  setTimeout(() => {
    loadActiveAnnouncements();
  }, 100);
};
```

## 使用方法

### 1. 在页面中使用

```vue
<script setup lang="ts">
import AnnouncementPopup from '../components/AnnouncementPopup.vue';
</script>

<template>
  <div class="store-app">
    <!-- 你的页面内容 -->
    
    <AnnouncementPopup :store-id="1" />
  </div>
</template>
```

### 2. 手动触发重新加载

如果需要手动刷新公告列表：

```vue
<script setup lang="ts">
import { ref } from 'vue';
import AnnouncementPopup from '../components/AnnouncementPopup.vue';

const popupRef = ref();

const handleRefreshAnnouncements = () => {
  if (popupRef.value) {
    popupRef.value.loadActiveAnnouncements();
  }
};
</script>

<template>
  <div>
    <button @click="handleRefreshAnnouncements">Refresh Announcements</button>
    <AnnouncementPopup ref="popupRef" :store-id="1" />
  </div>
</template>
```

### 3. 在 App.vue 中全局使用

```vue
<script setup lang="ts">
import AnnouncementPopup from './components/AnnouncementPopup.vue';
</script>

<template>
  <router-view />
  <AnnouncementPopup :store-id="1" />
</template>
```

## API 说明

### Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| storeId | number | 否 | 门店ID，默认为 1 |

### Emits

| 事件名 | 说明 |
|--------|------|
| loaded | 组件加载完成时触发 |

### Expose

| 方法名 | 说明 |
|--------|------|
| loadActiveAnnouncements() | 手动加载公告列表 |
| visible | 控制弹窗显示状态 |
| currentAnnouncement | 当前显示的公告 |

## localStorage 数据结构

```json
{
  "announcement_popups_shown": [1, 2, 3]
}
```

存储已弹出过的公告ID数组。

## 注意事项

1. **确保使用正确的API**：必须使用 `/api/announcements/active` 而不是 `/api/announcements`
2. **清理过期数据**：如果公告过期，可以手动清理 localStorage
3. **多个弹窗队列**：按优先级（priority）和创建时间（create_time）排序显示

## 示例代码

参考 `src/pages/StoreAppExample.vue` 查看完整的使用示例。

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { ElDialog, ElImage, ElButton } from 'element-plus';
import { announcementApi } from '../api/announcement';
import type { Announcement } from '../api/announcement';

const props = defineProps<{
  storeId?: number;
}>();

const visible = ref(false);
const currentAnnouncement = ref<Announcement | null>(null);
const loading = ref(false);
const announcementQueue = ref<Announcement[]>([]);
const currentIndex = ref(0);
const STORAGE_KEY = 'announcement_popups_shown';

const hasMoreAnnouncements = computed(() => {
  return announcementQueue.value.length > 0 && currentIndex.value < announcementQueue.value.length;
});

const getShownAnnouncements = (): number[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const markAnnouncementAsShown = (id: number) => {
  try {
    const shown = getShownAnnouncements();
    if (!shown.includes(id)) {
      shown.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shown));
    }
  } catch (error) {
    console.error('保存弹窗状态失败:', error);
  }
};

const isAnnouncementShown = (id: number): boolean => {
  return getShownAnnouncements().includes(id);
};

const loadActiveAnnouncements = async () => {
  loading.value = true;
  try {
    const response = await announcementApi.getActiveAnnouncements();
    if (response.code === 200 && response.data) {
      const announcements = Array.isArray(response.data) ? response.data : [response.data];

      const popupAnnouncements = announcements.filter(
        (ann: Announcement) =>
          ann.type === 'popup' &&
          !isAnnouncementShown(ann.id!)
      );

      if (popupAnnouncements.length > 0) {
        announcementQueue.value = popupAnnouncements;
        currentIndex.value = 0;
        currentAnnouncement.value = popupAnnouncements[0];
        visible.value = true;
      }
    }
  } catch (error) {
    console.error('加载公告失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  if (currentAnnouncement.value?.id) {
    markAnnouncementAsShown(currentAnnouncement.value.id);
  }

  if (currentIndex.value < announcementQueue.value.length - 1) {
    currentIndex.value++;
    currentAnnouncement.value = announcementQueue.value[currentIndex.value];
  } else {
    visible.value = false;
    currentAnnouncement.value = null;
    announcementQueue.value = [];
    currentIndex.value = 0;
  }
};

const handleButtonClick = () => {
  if (currentAnnouncement.value?.button_link) {
    window.open(currentAnnouncement.value.button_link, '_blank');
  }
};

const handleDontShowAgain = () => {
  if (currentAnnouncement.value?.id) {
    markAnnouncementAsShown(currentAnnouncement.value.id);
  }
  visible.value = false;
  currentAnnouncement.value = null;
  announcementQueue.value = [];
  currentIndex.value = 0;
};

watch(() => props.storeId, () => {
  if (props.storeId) {
    loadActiveAnnouncements();
  }
});

onMounted(() => {
  loadActiveAnnouncements();
});

defineExpose({
  loadActiveAnnouncements,
  visible,
  currentAnnouncement
});
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="currentAnnouncement?.title || '公告通知'"
    width="520px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="handleClose"
    :show-close="true"
  >
    <div v-if="currentAnnouncement" class="announcement-popup">
      <div v-if="currentAnnouncement.image_url" class="announcement-image">
        <el-image
          :src="currentAnnouncement.image_url"
          fit="cover"
          style="width: 100%; max-height: 280px; border-radius: 8px;"
          :preview-src-list="[currentAnnouncement.image_url]"
        />
      </div>

      <div class="announcement-content">
        {{ currentAnnouncement.content }}
      </div>

      <div v-if="currentAnnouncement.button_text && currentAnnouncement.button_link" class="action-button">
        <el-button type="primary" size="large" @click="handleButtonClick">
          {{ currentAnnouncement.button_text }}
        </el-button>
      </div>

      <div v-if="announcementQueue.length > 1" class="announcement-progress">
        <span class="progress-text">
          {{ currentIndex + 1 }} / {{ announcementQueue.length }}
        </span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="large">
          {{ hasMoreAnnouncements ? '下一条' : '关闭' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.announcement-popup {
  padding: 10px 0;
}

.announcement-image {
  margin-bottom: 16px;
}

.announcement-content {
  font-size: 15px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.action-button {
  text-align: center;
  margin-top: 16px;
}

.dialog-footer {
  text-align: center;
}

.announcement-progress {
  text-align: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.progress-text {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 16px 20px;
  margin-right: 0;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #ebeef5;
  padding: 16px 20px;
}

:deep(.el-image-viewer__wrapper) {
  z-index: 9999;
}
</style>

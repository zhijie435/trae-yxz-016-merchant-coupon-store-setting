<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { ElDialog, ElImage, ElButton } from 'element-plus';
import { announcementApi } from '../api/announcement';
import type { Announcement } from '../api/announcement';

const props = defineProps<{
  storeId?: number;
}>();

const visible = ref(false);
const currentAnnouncement = ref<Announcement | null>(null);
const loading = ref(false);
const STORAGE_KEY = 'announcement_popups_shown';

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
    console.error('Failed to save popup state:', error);
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
        currentAnnouncement.value = popupAnnouncements[0];
        visible.value = true;
      }
    }
  } catch (error) {
    console.error('Failed to load announcements:', error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  if (currentAnnouncement.value?.id) {
    markAnnouncementAsShown(currentAnnouncement.value.id);
  }
  visible.value = false;
  
  setTimeout(() => {
    loadActiveAnnouncements();
  }, 100);
};

const handleButtonClick = () => {
  if (currentAnnouncement.value?.button_link) {
    window.open(currentAnnouncement.value.button_link, '_blank');
  }
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
    :title="currentAnnouncement?.title || 'Announcement'"
    width="500px"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    @close="handleClose"
  >
    <div v-if="currentAnnouncement" class="announcement-popup">
      <div v-if="currentAnnouncement.image_url" class="announcement-image">
        <el-image
          :src="currentAnnouncement.image_url"
          fit="cover"
          style="width: 100%; max-height: 250px; border-radius: 8px;"
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
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Close</el-button>
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
}

.action-button {
  text-align: center;
  margin-top: 16px;
}

.dialog-footer {
  text-align: center;
}
</style>

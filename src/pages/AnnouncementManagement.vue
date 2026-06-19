<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAnnouncementStore } from '../stores/announcement';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Bell, Check, Close, View } from '@element-plus/icons-vue';
import type { Announcement } from '../api/announcement';
import AnnouncementFormDialog from './AnnouncementFormDialog.vue';
import AnnouncementDetailDialog from './AnnouncementDetailDialog.vue';

const announcementStore = useAnnouncementStore();

const showFormDialog = ref(false);
const showDetailDialog = ref(false);
const editingAnnouncement = ref<Announcement | null>(null);
const selectedAnnouncement = ref<Announcement | null>(null);

const statusMap = {
  pending: { label: 'Pending Review', color: '#E6A23C', bgColor: '#fdf6ec' },
  approved: { label: 'Approved', color: '#67C23A', bgColor: '#f0f9ff' },
  rejected: { label: 'Rejected', color: '#F56C6C', bgColor: '#fef0f0' },
};

const typeMap = {
  popup: 'Popup Modal',
  banner: 'Banner',
  notice: 'Notice Bar',
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleCreate = () => {
  editingAnnouncement.value = null;
  showFormDialog.value = true;
};

const handleEdit = (announcement: Announcement) => {
  editingAnnouncement.value = announcement;
  showFormDialog.value = true;
};

const handleView = (announcement: Announcement) => {
  selectedAnnouncement.value = announcement;
  showDetailDialog.value = true;
};

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this announcement?', 'Confirm', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    });

    const success = await announcementStore.deleteAnnouncement(id);
    if (success) {
      announcementStore.fetchAnnouncements();
    }
  } catch (error) {
    // User cancelled
  }
};

const handleFormSuccess = () => {
  showFormDialog.value = false;
  announcementStore.fetchAnnouncements();
};

const handleDetailClose = () => {
  showDetailDialog.value = false;
  selectedAnnouncement.value = null;
};

onMounted(() => {
  announcementStore.fetchAnnouncements();
});
</script>

<template>
  <div class="announcement-management">
    <div class="header">
      <div>
        <h2>Announcement Management</h2>
        <p class="subtitle">Create announcements that require HQ review before publishing</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        Create Announcement
      </el-button>
    </div>

    <div class="announcement-list" v-loading="announcementStore.loading">
      <div v-if="announcementStore.announcements.length === 0" class="empty-state">
        <el-icon :size="64" color="#909399"><Bell /></el-icon>
        <p>No announcements yet. Create one to get started.</p>
      </div>

      <div
        v-for="announcement in announcementStore.announcements"
        :key="announcement.id"
        class="announcement-card"
      >
        <div class="card-header">
          <div class="type-badge">
            {{ typeMap[announcement.type as keyof typeof typeMap] || announcement.type }}
          </div>
          <el-tag
            :style="{
              backgroundColor: statusMap[announcement.status as keyof typeof statusMap]?.bgColor,
              color: statusMap[announcement.status as keyof typeof statusMap]?.color,
              borderColor: statusMap[announcement.status as keyof typeof statusMap]?.color
            }"
          >
            {{ statusMap[announcement.status as keyof typeof statusMap]?.label || announcement.status }}
          </el-tag>
        </div>

        <div class="card-body" @click="handleView(announcement)">
          <h3>{{ announcement.title }}</h3>
          <p class="content-preview">{{ announcement.content }}</p>
        </div>

        <div class="card-footer">
          <div class="meta-info">
            <span class="time">Created: {{ formatDate(announcement.create_time!) }}</span>
            <span v-if="announcement.start_time && announcement.end_time" class="validity">
              Valid: {{ formatDate(announcement.start_time) }} - {{ formatDate(announcement.end_time) }}
            </span>
          </div>

          <div class="actions">
            <el-button link type="primary" :icon="View" @click="handleView(announcement)">
              View
            </el-button>
            <el-button
              link
              type="primary"
              :icon="Edit"
              @click="handleEdit(announcement)"
              :disabled="announcement.status === 'approved'"
            >
              Edit
            </el-button>
            <el-button
              link
              type="danger"
              :icon="Delete"
              @click="handleDelete(announcement.id!)"
            >
              Delete
            </el-button>
          </div>
        </div>

        <div v-if="announcement.status === 'rejected' && announcement.review_comment" class="rejection-reason">
          <strong>Rejection Reason:</strong> {{ announcement.review_comment }}
        </div>
      </div>
    </div>

    <AnnouncementFormDialog
      v-model:visible="showFormDialog"
      :announcement="editingAnnouncement"
      @success="handleFormSuccess"
    />

    <AnnouncementDetailDialog
      v-model:visible="showDetailDialog"
      :announcement="selectedAnnouncement"
      @close="handleDetailClose"
    />
  </div>
</template>

<style scoped>
.announcement-management {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state p {
  margin-top: 16px;
  font-size: 14px;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s;
}

.announcement-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.type-badge {
  font-size: 12px;
  color: #606266;
  background: #f4f4f5;
  padding: 4px 12px;
  border-radius: 4px;
}

.card-body {
  cursor: pointer;
  margin-bottom: 12px;
}

.card-body h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.content-preview {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.actions {
  display: flex;
  gap: 8px;
}

.rejection-reason {
  margin-top: 12px;
  padding: 12px;
  background: #fef0f0;
  border-radius: 4px;
  font-size: 13px;
  color: #f56c6c;
}
</style>

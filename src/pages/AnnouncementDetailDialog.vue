<script setup lang="ts">
import { computed } from 'vue';
import { ElDialog, ElTag, ElImage, ElButton } from 'element-plus';
import type { Announcement } from '../api/announcement';

const props = defineProps<{
  visible: boolean;
  announcement: Announcement | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const handleClose = () => {
  emit('close');
};

const handleButtonClick = () => {
  if (props.announcement?.button_link) {
    window.open(props.announcement.button_link, '_blank');
  }
};

const statusMap = {
  pending: { label: 'Pending Review', color: '#E6A23C' },
  approved: { label: 'Approved', color: '#67C23A' },
  rejected: { label: 'Rejected', color: '#F56C6C' },
};

const typeMap = {
  popup: 'Popup Modal',
  banner: 'Banner',
  notice: 'Notice Bar',
};

const formatDate = (dateString: string | undefined) => {
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
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="Announcement Details"
    width="600px"
    @close="handleClose"
  >
    <div v-if="announcement" class="announcement-detail">
      <div class="detail-header">
        <div class="meta-tags">
          <el-tag>{{ typeMap[announcement.type as keyof typeof typeMap] || announcement.type }}</el-tag>
          <el-tag
            :type="announcement.status === 'approved' ? 'success' : announcement.status === 'rejected' ? 'danger' : 'warning'"
          >
            {{ statusMap[announcement.status as keyof typeof statusMap]?.label || announcement.status }}
          </el-tag>
        </div>
      </div>

      <div class="detail-body">
        <h2>{{ announcement.title }}</h2>
        <div v-if="announcement.image_url" class="announcement-image">
          <el-image
            :src="announcement.image_url"
            fit="cover"
            style="width: 100%; max-height: 300px; border-radius: 8px;"
          />
        </div>
        <div class="content">
          {{ announcement.content }}
        </div>
        <div v-if="announcement.button_text && announcement.button_link" class="action-button">
          <el-button type="primary" size="large" @click="handleButtonClick">
            {{ announcement.button_text }}
          </el-button>
        </div>
      </div>

      <div class="detail-footer">
        <div class="info-row">
          <span class="label">Priority:</span>
          <span class="value">{{ announcement.priority || 0 }}</span>
        </div>

        <div class="info-row" v-if="announcement.start_time || announcement.end_time">
          <span class="label">Valid Period:</span>
          <span class="value">
            {{ formatDate(announcement.start_time) }} - {{ formatDate(announcement.end_time) }}
          </span>
        </div>

        <div class="info-row">
          <span class="label">Created:</span>
          <span class="value">{{ formatDate(announcement.create_time) }}</span>
        </div>

        <div class="info-row" v-if="announcement.review_time">
          <span class="label">Reviewed:</span>
          <span class="value">{{ formatDate(announcement.review_time) }}</span>
        </div>

        <div class="info-row" v-if="announcement.review_comment">
          <span class="label">Review Comment:</span>
          <span class="value review-comment">{{ announcement.review_comment }}</span>
        </div>
      </div>

      <el-alert
        v-if="announcement.status === 'pending'"
        title="Pending Review"
        type="warning"
        description="This announcement is waiting for HQ review. You will be notified once it's reviewed."
        :closable="false"
        style="margin-top: 20px"
      />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Close</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.announcement-detail {
  padding: 10px 0;
}

.detail-header {
  margin-bottom: 20px;
}

.meta-tags {
  display: flex;
  gap: 10px;
}

.detail-body {
  margin-bottom: 20px;
}

.detail-body h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.announcement-image {
  margin-bottom: 16px;
}

.action-button {
  margin-top: 16px;
  text-align: center;
}

.content {
  font-size: 15px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.detail-footer {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 12px;
}

.info-row .label {
  width: 120px;
  color: #909399;
  font-size: 14px;
}

.info-row .value {
  flex: 1;
  color: #606266;
  font-size: 14px;
}

.review-comment {
  background: #fef0f0;
  padding: 8px 12px;
  border-radius: 4px;
  color: #f56c6c;
}
</style>

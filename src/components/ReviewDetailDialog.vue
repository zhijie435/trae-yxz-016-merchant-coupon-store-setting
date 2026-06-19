<script setup lang="ts">
import { ref } from 'vue';
import { ElDialog, ElButton, ElTimeline, ElTimelineItem } from 'element-plus';
import { Clock, Check, Close, Document } from '@element-plus/icons-vue';

const props = defineProps<{
  visible: boolean;
  title?: string;
  itemType?: 'coupon' | 'banner' | 'announcement';
  itemName?: string;
  reviewComment?: string;
  reviewTime?: string;
  reviewerId?: number;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const dialogVisible = ref(false);

const handleClose = () => {
  emit('update:visible', false);
};

const getItemTypeLabel = () => {
  const labels = {
    coupon: '优惠券',
    banner: '轮播图',
    announcement: '公告',
  };
  return labels[props.itemType || 'coupon'] || '内容';
};

const formatTime = (timeString?: string) => {
  if (!timeString) return '-';
  const date = new Date(timeString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const getTimelineItemType = (index: number) => {
  if (props.reviewTime) {
    return index === 0 ? 'success' : 'primary';
  }
  return 'primary';
};

const getTimelineIcon = (index: number) => {
  if (props.reviewTime) {
    if (index === 0) return Check;
    return index === 1 ? Close : Clock;
  }
  return Document;
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    :title="title || '审核详情'"
    width="520px"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <div class="review-detail">
      <div class="detail-header">
        <h3>{{ itemName || '未命名' }}</h3>
        <span class="item-type">{{ getItemTypeLabel() }}</span>
      </div>

      <div class="detail-content">
        <el-timeline>
          <el-timeline-item
            v-if="reviewTime"
            :timestamp="formatTime(reviewTime)"
            :type="reviewComment ? 'success' : 'warning'"
            placement="top"
          >
            <el-card shadow="hover">
              <div class="timeline-content">
                <div class="timeline-header">
                  <el-icon><Check /></el-icon>
                  <span>审核{{ reviewComment ? '通过' : '完成' }}</span>
                </div>
                <p v-if="reviewComment" class="review-comment">
                  审核备注：{{ reviewComment }}
                </p>
                <p v-if="reviewerId" class="reviewer-info">
                  审核人ID：{{ reviewerId }}
                </p>
              </div>
            </el-card>
          </el-timeline-item>

          <el-timeline-item
            v-else
            :timestamp="formatTime(new Date().toISOString())"
            type="primary"
            placement="top"
          >
            <el-card shadow="hover">
              <div class="timeline-content">
                <div class="timeline-header">
                  <el-icon><Clock /></el-icon>
                  <span>待审核</span>
                </div>
                <p class="pending-message">
                  此{{ getItemTypeLabel() }}正在等待审核，请耐心等待...
                </p>
              </div>
            </el-card>
          </el-timeline-item>

          <el-timeline-item
            :timestamp="formatTime(new Date().toISOString())"
            type="info"
            placement="top"
          >
            <el-card shadow="hover">
              <div class="timeline-content">
                <div class="timeline-header">
                  <el-icon><Document /></el-icon>
                  <span>提交审核</span>
                </div>
                <p class="submit-message">
                  已提交审核，等待总部审核中
                </p>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <div class="detail-footer">
        <el-alert
          v-if="!reviewTime"
          title="提示：审核通过后，内容将自动上线"
          type="info"
          :closable="false"
          show-icon
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.review-detail {
  padding: 10px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.item-type {
  padding: 4px 12px;
  background: #409eff;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.detail-content {
  margin: 20px 0;
  max-height: 400px;
  overflow-y: auto;
}

.timeline-content {
  padding: 8px 0;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.timeline-header .el-icon {
  font-size: 16px;
}

.review-comment {
  margin: 8px 0;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.reviewer-info {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #909399;
}

.pending-message,
.submit-message {
  margin: 8px 0 0 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
}

.detail-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.dialog-footer {
  text-align: center;
}

:deep(.el-timeline-item__node--success) {
  background-color: #67c23a;
}

:deep(.el-timeline-item__node--warning) {
  background-color: #e6a23c;
}

:deep(.el-timeline-item__node--primary) {
  background-color: #409eff;
}

:deep(.el-timeline-item__node--info) {
  background-color: #909399;
}

:deep(.el-card) {
  border-radius: 8px;
}

:deep(.el-card__body) {
  padding: 12px;
}
</style>

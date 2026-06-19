<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: string;
  showIcon?: boolean;
  size?: 'small' | 'default' | 'large';
}>();

const statusConfig = {
  pending: {
    label: '待审核',
    color: '#E6A23C',
    bgColor: '#FDF6EC',
    icon: 'clock',
  },
  approved: {
    label: '已通过',
    color: '#67C23A',
    bgColor: '#F0F9EB',
    icon: 'check-circle',
  },
  active: {
    label: '已上线',
    color: '#67C23A',
    bgColor: '#F0F9EB',
    icon: 'check-circle',
  },
  rejected: {
    label: '已拒绝',
    color: '#F56C6C',
    bgColor: '#FEF0F0',
    icon: 'close-circle',
  },
  draft: {
    label: '草稿',
    color: '#909399',
    bgColor: '#F4F4F5',
    icon: 'document',
  },
  inactive: {
    label: '已下线',
    color: '#909399',
    bgColor: '#F4F4F5',
    icon: 'minus-circle',
  },
  expired: {
    label: '已过期',
    color: '#909399',
    bgColor: '#F4F4F5',
    icon: 'clock',
  },
};

const config = computed(() => {
  return statusConfig[props.status as keyof typeof statusConfig] || {
    label: props.status,
    color: '#909399',
    bgColor: '#F4F4F5',
    icon: 'info-circle',
  };
});

const sizeClass = computed(() => {
  return `status-${props.size || 'default'}`;
});
</script>

<template>
  <div
    class="review-status-badge"
    :class="sizeClass"
    :style="{
      color: config.color,
      backgroundColor: config.bgColor,
      borderColor: config.color,
    }"
  >
    <span v-if="showIcon" class="status-icon">
      <svg v-if="config.icon === 'clock'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
      </svg>
      <svg v-if="config.icon === 'check-circle'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <svg v-if="config.icon === 'close-circle'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
      </svg>
      <svg v-if="config.icon === 'document'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
      </svg>
      <svg v-if="config.icon === 'minus-circle'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
      </svg>
      <svg v-if="config.icon === 'info-circle'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
    </span>
    <span class="status-label">{{ config.label }}</span>
  </div>
</template>

<style scoped>
.review-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 500;
  border: 1px solid;
  transition: all 0.3s;
}

.review-status-badge:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.status-small {
  font-size: 12px;
  padding: 2px 8px;
}

.status-default {
  font-size: 13px;
  padding: 4px 12px;
}

.status-large {
  font-size: 14px;
  padding: 6px 16px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon svg {
  width: 14px;
  height: 14px;
}

.status-label {
  white-space: nowrap;
}
</style>

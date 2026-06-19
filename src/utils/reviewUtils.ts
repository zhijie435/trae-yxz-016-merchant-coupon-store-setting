export interface ReviewStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  type: 'success' | 'warning' | 'danger' | 'info' | 'primary';
}

export const reviewStatusConfig = {
  pending: {
    label: '待审核',
    color: '#E6A23C',
    bgColor: '#FDF6EC',
    type: 'warning' as const,
  },
  approved: {
    label: '已通过',
    color: '#67C23A',
    bgColor: '#F0F9EB',
    type: 'success' as const,
  },
  active: {
    label: '已上线',
    color: '#67C23A',
    bgColor: '#F0F9EB',
    type: 'success' as const,
  },
  rejected: {
    label: '已拒绝',
    color: '#F56C6C',
    bgColor: '#FEF0F0',
    type: 'danger' as const,
  },
  draft: {
    label: '草稿',
    color: '#909399',
    bgColor: '#F4F4F5',
    type: 'info' as const,
  },
  inactive: {
    label: '已下线',
    color: '#909399',
    bgColor: '#F4F4F5',
    type: 'info' as const,
  },
  expired: {
    label: '已过期',
    color: '#909399',
    bgColor: '#F4F4F5',
    type: 'info' as const,
  },
};

export const getStatusConfig = (status: string): ReviewStatusConfig => {
  return reviewStatusConfig[status as keyof typeof reviewStatusConfig] || {
    label: status,
    color: '#909399',
    bgColor: '#F4F4F5',
    type: 'info' as const,
  };
};

export const formatReviewTime = (timeString?: string): string => {
  if (!timeString) return '-';
  const date = new Date(timeString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isReviewable = (status: string): boolean => {
  return status === 'pending';
};

export const canEdit = (status: string): boolean => {
  return ['draft', 'rejected', 'pending'].includes(status);
};

export const canDelete = (status: string): boolean => {
  return !['active'].includes(status);
};

export const getReviewActionMessage = (type: 'approve' | 'reject', itemName: string): string => {
  if (type === 'approve') {
    return `确定要审核通过"${itemName}"吗？`;
  }
  return `确定要拒绝"${itemName}"吗？`;
};

export const getReviewSuccessMessage = (type: 'approve' | 'reject'): string => {
  if (type === 'approve') {
    return '审核通过成功';
  }
  return '已拒绝';
};

export const getDeleteConfirmMessage = (itemName: string): string => {
  return `确定要删除"${itemName}"吗？此操作不可撤销。`;
};

export const getBatchDeleteMessage = (count: number): string => {
  return `确定要删除选中的 ${count} 个项目吗？此操作不可撤销。`;
};

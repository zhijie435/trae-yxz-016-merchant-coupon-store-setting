import { ElMessage } from 'element-plus';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}

export const handleApiSuccess = <T = any>(
  response: ApiResponse<T>,
  successMessage?: string
): T | null => {
  if (response.code === 200) {
    if (successMessage) {
      ElMessage.success(successMessage);
    }
    return response.data;
  } else {
    ElMessage.error(response.message || '操作失败');
    return null;
  }
};

export const handleApiError = (error: any, defaultMessage: string = '操作失败'): void => {
  console.error('API Error:', error);
  if (error.response?.data?.message) {
    ElMessage.error(error.response.data.message);
  } else if (error.message) {
    ElMessage.error(error.message);
  } else {
    ElMessage.error(defaultMessage);
  }
};

export const validateFormData = <T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, string[]>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  for (const [field, value] of Object.entries(data)) {
    const fieldRules = rules[field as keyof T];
    if (!fieldRules) continue;

    for (const rule of fieldRules) {
      if (rule === 'required' && (value === null || value === undefined || value === '')) {
        errors[field] = `请填写${field}`;
        break;
      }
      if (rule === 'number' && isNaN(Number(value))) {
        errors[field] = `${field}必须是数字`;
        break;
      }
      if (rule === 'positive' && Number(value) <= 0) {
        errors[field] = `${field}必须大于0`;
        break;
      }
      if (rule.startsWith('min:')) {
        const min = Number(rule.split(':')[1]);
        if (Number(value) < min) {
          errors[field] = `${field}不能小于${min}`;
          break;
        }
      }
      if (rule.startsWith('max:')) {
        const max = Number(rule.split(':')[1]);
        if (Number(value) > max) {
          errors[field] = `${field}不能大于${max}`;
          break;
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('复制成功');
    return true;
  } catch (err) {
    console.error('复制失败:', err);
    ElMessage.error('复制失败');
    return false;
  }
};

export const downloadFile = (url: string, filename?: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || '';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export interface Banner {
  id?: number;
  store_id?: number;
  title: string;
  image_url: string;
  link_url?: string;
  link_type?: 'none' | 'url' | 'page' | 'product';
  sort_order?: number;
  status?: 'pending' | 'active' | 'inactive' | 'rejected';
  city_scope?: string;
  start_time?: string;
  end_time?: string;
  review_comment?: string;
  review_time?: string;
  reviewer_id?: number;
  create_time?: string;
  update_time?: string;
}

export interface BannerListResponse {
  code: number;
  message: string;
  data: {
    list: Banner[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

export interface BannerResponse {
  code: number;
  message: string;
  data: Banner | null;
}

export interface IdResponse {
  code: number;
  message: string;
  data: {
    id: number;
  };
}

export const bannerApi = {
  getBannerList: (params?: {
    store_id?: number;
    status?: string;
  }) => {
    return api.get<any, BannerListResponse>('/banners', { params });
  },

  getBannerById: (id: number) => {
    return api.get<any, BannerResponse>(`/banners/${id}`);
  },

  createBanner: (data: Partial<Banner>) => {
    return api.post<any, IdResponse>('/banners', data);
  },

  updateBanner: (id: number, data: Partial<Banner>) => {
    return api.put<any, any>(`/banners/${id}`, data);
  },

  deleteBanner: (id: number) => {
    return api.delete<any, any>(`/banners/${id}`);
  },

  updateSortOrders: (updates: { id: number; sort_order: number }[]) => {
    return api.post<any, any>('/banners/sort', { updates });
  },

  approveBanner: (id: number, data?: { comment?: string; reviewer_id?: number }) => {
    return api.post<any, any>(`/banners/${id}/approve`, data || {});
  },

  rejectBanner: (id: number, data?: { comment?: string; reviewer_id?: number }) => {
    return api.post<any, any>(`/banners/${id}/reject`, data || {});
  },

  getPendingBanners: () => {
    return api.get<any, { code: number; message: string; data: Banner[] }>('/banners/status/pending');
  },
};

export default api;

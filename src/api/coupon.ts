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

export interface Coupon {
  id?: number;
  name: string;
  type: 'cash' | 'discount';
  value: number;
  min_amount?: number;
  max_discount?: number;
  total_count: number;
  remain_count: number;
  per_user_limit?: number;
  start_time: string;
  end_time: string;
  status: 'draft' | 'pending' | 'active' | 'expired';
  description?: string;
  create_time?: string;
  update_time?: string;
}

export interface CouponListResponse {
  code: number;
  message: string;
  data: {
    list: Coupon[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

export interface CouponResponse {
  code: number;
  message: string;
  data: Coupon | null;
}

export interface IdResponse {
  code: number;
  message: string;
  data: {
    id: number;
  };
}

export const couponApi = {
  getCouponList: (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: string;
  }) => {
    return api.get<any, CouponListResponse>('/coupons', { params });
  },

  getCouponById: (id: number) => {
    return api.get<any, CouponResponse>(`/coupons/${id}`);
  },

  createCoupon: (data: Partial<Coupon>) => {
    return api.post<any, IdResponse>('/coupons', data);
  },

  updateCoupon: (id: number, data: Partial<Coupon>) => {
    return api.put<any, any>(`/coupons/${id}`, data);
  },

  deleteCoupon: (id: number) => {
    return api.delete<any, any>(`/coupons/${id}`);
  },

  deleteCoupons: (ids: number[]) => {
    return api.delete<any, any>('/coupons', { data: { ids } });
  },
};

export default api;

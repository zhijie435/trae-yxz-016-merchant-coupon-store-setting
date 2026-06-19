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

export interface Announcement {
  id?: number;
  store_id?: number;
  title: string;
  content: string;
  type?: 'popup' | 'banner' | 'notice';
  status?: 'pending' | 'approved' | 'rejected';
  priority?: number;
  start_time?: string;
  end_time?: string;
  review_comment?: string;
  review_time?: string;
  reviewer_id?: number;
  create_time?: string;
  update_time?: string;
}

export interface AnnouncementListResponse {
  code: number;
  message: string;
  data: {
    list: Announcement[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

export interface AnnouncementResponse {
  code: number;
  message: string;
  data: Announcement | Announcement[] | null;
}

export interface IdResponse {
  code: number;
  message: string;
  data: {
    id: number;
  };
}

export const announcementApi = {
  getAnnouncementList: (params?: {
    store_id?: number;
    status?: string;
    type?: string;
  }) => {
    return api.get<any, AnnouncementListResponse>('/announcements', { params });
  },

  getActiveAnnouncements: () => {
    return api.get<any, AnnouncementResponse>('/announcements/active');
  },

  getAnnouncementById: (id: number) => {
    return api.get<any, AnnouncementResponse>(`/announcements/${id}`);
  },

  createAnnouncement: (data: Partial<Announcement>) => {
    return api.post<any, IdResponse>('/announcements', data);
  },

  updateAnnouncement: (id: number, data: Partial<Announcement>) => {
    return api.put<any, any>(`/announcements/${id}`, data);
  },

  reviewAnnouncement: (id: number, data: { status: 'approved' | 'rejected'; reviewer_id?: number; comment?: string }) => {
    return api.post<any, any>(`/announcements/${id}/review`, data);
  },

  deleteAnnouncement: (id: number) => {
    return api.delete<any, any>(`/announcements/${id}`);
  },
};

export default api;

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { announcementApi, type Announcement } from '../api/announcement';
import { ElMessage } from 'element-plus';

export const useAnnouncementStore = defineStore('announcement', () => {
  const announcements = ref<Announcement[]>([]);
  const currentAnnouncement = ref<Announcement | null>(null);
  const loading = ref(false);

  const fetchAnnouncements = async (params?: { store_id?: number; status?: string; type?: string }) => {
    loading.value = true;
    try {
      const response = await announcementApi.getAnnouncementList(params);
      if (response.code === 200) {
        announcements.value = response.data.list;
      } else {
        ElMessage.error(response.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      ElMessage.error('Failed to fetch announcements');
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  const fetchAnnouncementById = async (id: number) => {
    loading.value = true;
    try {
      const response = await announcementApi.getAnnouncementById(id);
      if (response.code === 200) {
        currentAnnouncement.value = response.data as Announcement;
        return response.data;
      } else {
        ElMessage.error(response.message || 'Failed to fetch announcement');
        return null;
      }
    } catch (error) {
      ElMessage.error('Failed to fetch announcement');
      console.error(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createAnnouncement = async (data: Partial<Announcement>) => {
    loading.value = true;
    try {
      const response = await announcementApi.createAnnouncement(data);
      if (response.code === 200) {
        ElMessage.success('Announcement created, waiting for review');
        return response.data.id;
      } else {
        ElMessage.error(response.message || 'Failed to create announcement');
        return null;
      }
    } catch (error) {
      ElMessage.error('Failed to create announcement');
      console.error(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateAnnouncement = async (id: number, data: Partial<Announcement>) => {
    loading.value = true;
    try {
      const response = await announcementApi.updateAnnouncement(id, data);
      if (response.code === 200) {
        ElMessage.success('Announcement updated successfully');
        return true;
      } else {
        ElMessage.error(response.message || 'Failed to update announcement');
        return false;
      }
    } catch (error) {
      ElMessage.error('Failed to update announcement');
      console.error(error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const reviewAnnouncement = async (id: number, status: 'approved' | 'rejected', comment?: string) => {
    loading.value = true;
    try {
      const response = await announcementApi.reviewAnnouncement(id, { status, comment });
      if (response.code === 200) {
        ElMessage.success(`Announcement ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
        return true;
      } else {
        ElMessage.error(response.message || 'Failed to review announcement');
        return false;
      }
    } catch (error) {
      ElMessage.error('Failed to review announcement');
      console.error(error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteAnnouncement = async (id: number) => {
    loading.value = true;
    try {
      const response = await announcementApi.deleteAnnouncement(id);
      if (response.code === 200) {
        ElMessage.success('Announcement deleted successfully');
        return true;
      } else {
        ElMessage.error(response.message || 'Failed to delete announcement');
        return false;
      }
    } catch (error) {
      ElMessage.error('Failed to delete announcement');
      console.error(error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    announcements,
    currentAnnouncement,
    loading,
    fetchAnnouncements,
    fetchAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    reviewAnnouncement,
    deleteAnnouncement,
  };
});

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { bannerApi, type Banner } from '../api/banner';
import { ElMessage } from 'element-plus';

export const useBannerStore = defineStore('banner', () => {
  const banners = ref<Banner[]>([]);
  const currentBanner = ref<Banner | null>(null);
  const loading = ref(false);

  const fetchBanners = async (params?: { store_id?: number; status?: string }) => {
    loading.value = true;
    try {
      const response = await bannerApi.getBannerList(params);
      if (response.code === 200) {
        banners.value = response.data.list;
      } else {
        ElMessage.error(response.message || 'Failed to fetch banners');
      }
    } catch (error) {
      ElMessage.error('Failed to fetch banners');
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  const fetchActiveBanners = async () => {
    loading.value = true;
    try {
      const response = await bannerApi.getActiveBanners();
      if (response.code === 200) {
        banners.value = response.data;
      } else {
        ElMessage.error(response.message || 'Failed to fetch active banners');
      }
    } catch (error) {
      ElMessage.error('Failed to fetch active banners');
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  const fetchBannerById = async (id: number) => {
    loading.value = true;
    try {
      const response = await bannerApi.getBannerById(id);
      if (response.code === 200) {
        currentBanner.value = response.data;
        return response.data;
      } else {
        ElMessage.error(response.message || 'Failed to fetch banner');
        return null;
      }
    } catch (error) {
      ElMessage.error('Failed to fetch banner');
      console.error(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createBanner = async (data: Partial<Banner>) => {
    loading.value = true;
    try {
      const response = await bannerApi.createBanner(data);
      if (response.code === 200) {
        ElMessage.success('Banner created successfully');
        return response.data.id;
      } else {
        ElMessage.error(response.message || 'Failed to create banner');
        return null;
      }
    } catch (error) {
      ElMessage.error('Failed to create banner');
      console.error(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateBanner = async (id: number, data: Partial<Banner>) => {
    loading.value = true;
    try {
      const response = await bannerApi.updateBanner(id, data);
      if (response.code === 200) {
        ElMessage.success('Banner updated successfully');
        return true;
      } else {
        ElMessage.error(response.message || 'Failed to update banner');
        return false;
      }
    } catch (error) {
      ElMessage.error('Failed to update banner');
      console.error(error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteBanner = async (id: number) => {
    loading.value = true;
    try {
      const response = await bannerApi.deleteBanner(id);
      if (response.code === 200) {
        ElMessage.success('Banner deleted successfully');
        return true;
      } else {
        ElMessage.error(response.message || 'Failed to delete banner');
        return false;
      }
    } catch (error) {
      ElMessage.error('Failed to delete banner');
      console.error(error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateSortOrders = async (updates: { id: number; sort_order: number }[]) => {
    loading.value = true;
    try {
      const response = await bannerApi.updateSortOrders(updates);
      if (response.code === 200) {
        ElMessage.success('Sort orders updated successfully');
        return true;
      } else {
        ElMessage.error(response.message || 'Failed to update sort orders');
        return false;
      }
    } catch (error) {
      ElMessage.error('Failed to update sort orders');
      console.error(error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const approveBanner = async (id: number, comment?: string) => {
    loading.value = true;
    try {
      const response = await bannerApi.approveBanner(id, { comment });
      if (response.code === 200) {
        ElMessage.success('Banner approved successfully');
        return true;
      } else {
        ElMessage.error(response.message || 'Failed to approve banner');
        return false;
      }
    } catch (error) {
      ElMessage.error('Failed to approve banner');
      console.error(error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const rejectBanner = async (id: number, comment?: string) => {
    loading.value = true;
    try {
      const response = await bannerApi.rejectBanner(id, { comment });
      if (response.code === 200) {
        ElMessage.success('Banner rejected');
        return true;
      } else {
        ElMessage.error(response.message || 'Failed to reject banner');
        return false;
      }
    } catch (error) {
      ElMessage.error('Failed to reject banner');
      console.error(error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    banners,
    currentBanner,
    loading,
    fetchBanners,
    fetchActiveBanners,
    fetchBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    updateSortOrders,
    approveBanner,
    rejectBanner,
  };
});

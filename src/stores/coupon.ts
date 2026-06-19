import { defineStore } from 'pinia';
import { ref } from 'vue';
import { couponApi, type Coupon } from '../api/coupon';
import { ElMessage } from 'element-plus';

export const useCouponStore = defineStore('coupon', () => {
  const coupons = ref<Coupon[]>([]);
  const currentCoupon = ref<Coupon | null>(null);
  const loading = ref(false);
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchCoupons = async (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: string;
  }) => {
    loading.value = true;
    try {
      const response = await couponApi.getCouponList(params);
      if (response.code === 200) {
        coupons.value = response.data.list;
        pagination.value = response.data.pagination;
      } else {
        ElMessage.error(response.message || 'Failed to fetch coupons');
      }
    } catch (error) {
      ElMessage.error('Failed to fetch coupons');
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  const fetchCouponById = async (id: number) => {
    loading.value = true;
    try {
      const response = await couponApi.getCouponById(id);
      if (response.code === 200) {
        currentCoupon.value = response.data;
        return response.data;
      } else {
        ElMessage.error(response.message || 'Failed to fetch coupon');
        return null;
      }
    } catch (error) {
      ElMessage.error('Failed to fetch coupon');
      console.error(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createCoupon = async (data: Partial<Coupon>) => {
    loading.value = true;
    try {
      const response = await couponApi.createCoupon(data);
      if (response.code === 200) {
        ElMessage.success('Coupon created successfully');
        return response.data.id;
      } else {
        ElMessage.error(response.message || 'Failed to create coupon');
        return null;
      }
    } catch (error) {
      ElMessage.error('Failed to create coupon');
      console.error(error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateCoupon = async (id: number, data: Partial<Coupon>) => {
    loading.value = true;
    try {
      const response = await couponApi.updateCoupon(id, data);
      if (response.code === 200) {
        ElMessage.success('Coupon updated successfully');
        return true;
      } else {
        ElMessage.error(response.message || 'Failed to update coupon');
        return false;
      }
    } catch (error) {
      ElMessage.error('Failed to update coupon');
      console.error(error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteCoupon = async (id: number) => {
    loading.value = true;
    try {
      const response = await couponApi.deleteCoupon(id);
      if (response.code === 200) {
        ElMessage.success('Coupon deleted successfully');
        return true;
      } else {
        ElMessage.error(response.message || 'Failed to delete coupon');
        return false;
      }
    } catch (error) {
      ElMessage.error('Failed to delete coupon');
      console.error(error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteCoupons = async (ids: number[]) => {
    loading.value = true;
    try {
      const response = await couponApi.deleteCoupons(ids);
      if (response.code === 200) {
        ElMessage.success('Coupons deleted successfully');
        return true;
      } else {
        ElMessage.error(response.message || 'Failed to delete coupons');
        return false;
      }
    } catch (error) {
      ElMessage.error('Failed to delete coupons');
      console.error(error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    coupons,
    currentCoupon,
    loading,
    pagination,
    fetchCoupons,
    fetchCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    deleteCoupons,
  };
});

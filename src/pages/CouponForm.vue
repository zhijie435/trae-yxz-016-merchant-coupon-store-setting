<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCouponStore } from '../stores/coupon';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Check } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';

const router = useRouter();
const route = useRoute();
const couponStore = useCouponStore();

const formRef = ref<FormInstance>();
const isEdit = computed(() => !!route.params.id);
const couponId = computed(() => (isEdit.value ? Number(route.params.id) : null));

const form = ref({
  name: '',
  type: 'cash' as 'cash' | 'discount',
  value: 0,
  min_amount: 0,
  max_discount: 0,
  total_count: 0,
  per_user_limit: 1,
  start_time: '',
  end_time: '',
  status: 'draft' as 'draft' | 'pending' | 'active' | 'expired',
  description: '',
});

const rules: FormRules = {
  name: [
    { required: true, message: 'Please enter coupon name', trigger: 'blur' },
    { max: 100, message: 'Name cannot exceed 100 characters', trigger: 'blur' },
  ],
  type: [{ required: true, message: 'Please select coupon type', trigger: 'change' }],
  value: [
    { required: true, message: 'Please enter coupon value', trigger: 'blur' },
    { type: 'number', min: 0.01, message: 'Value must be greater than 0', trigger: 'blur' },
  ],
  total_count: [
    { required: true, message: 'Please enter total count', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Total count must be at least 1', trigger: 'blur' },
  ],
  start_time: [{ required: true, message: 'Please select start time', trigger: 'change' }],
  end_time: [{ required: true, message: 'Please select end time', trigger: 'change' }],
};

const validateDateRange = (rule: any, value: any, callback: any) => {
  if (form.value.start_time && form.value.end_time) {
    if (new Date(form.value.start_time) >= new Date(form.value.end_time)) {
      callback(new Error('End time must be after start time'));
    } else {
      callback();
    }
  } else {
    callback();
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate(async (valid) => {
      if (valid) {
        let success: boolean | number | null = false;

        if (isEdit.value && couponId.value) {
          success = await couponStore.updateCoupon(couponId.value, form.value);
        } else {
          success = await couponStore.createCoupon(form.value);
        }

        if (success) {
          router.push('/settings/coupons');
        }
      }
    });
  } catch (error) {
    ElMessage.error('Please check the form fields');
  }
};

const handleCancel = () => {
  router.back();
};

onMounted(async () => {
  if (isEdit.value && couponId.value) {
    const coupon = await couponStore.fetchCouponById(couponId.value);
    if (coupon) {
      form.value = {
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        min_amount: coupon.min_amount || 0,
        max_discount: coupon.max_discount || 0,
        total_count: coupon.total_count,
        per_user_limit: coupon.per_user_limit || 1,
        start_time: coupon.start_time,
        end_time: coupon.end_time,
        status: coupon.status,
        description: coupon.description || '',
      };
    }
  }
});
</script>

<template>
  <div class="coupon-form">
    <div class="header">
      <el-button :icon="ArrowLeft" @click="handleCancel">Back</el-button>
      <h2>{{ isEdit ? 'Edit Coupon' : 'Create New Coupon' }}</h2>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        style="max-width: 800px"
      >
        <el-form-item label="Coupon Name" prop="name">
          <el-input v-model="form.name" placeholder="Enter coupon name" />
        </el-form-item>

        <el-form-item label="Coupon Type" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="cash">满减券</el-radio>
            <el-radio label="discount">折扣券</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="Discount Value" prop="value">
          <el-input-number
            v-model="form.value"
            :min="0"
            :precision="2"
            :step="1"
            style="width: 200px"
          />
          <span class="form-tip">{{ form.type === 'cash' ? '元' : '%' }}</span>
        </el-form-item>

        <el-form-item label="Minimum Amount" prop="min_amount">
          <el-input-number
            v-model="form.min_amount"
            :min="0"
            :precision="2"
            :step="10"
            style="width: 200px"
          />
          <span class="form-tip">消费满此金额可用，设为0则无限制</span>
        </el-form-item>

        <el-form-item label="Max Discount" prop="max_discount">
          <el-input-number
            v-model="form.max_discount"
            :min="0"
            :precision="2"
            :step="10"
            style="width: 200px"
          />
          <span class="form-tip">最高优惠金额，0表示不限制（仅折扣券）</span>
        </el-form-item>

        <el-form-item label="Total Count" prop="total_count">
          <el-input-number
            v-model="form.total_count"
            :min="1"
            :step="10"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="Per User Limit" prop="per_user_limit">
          <el-input-number
            v-model="form.per_user_limit"
            :min="1"
            :step="1"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="Valid Period" prop="start_time">
          <el-date-picker
            v-model="form.start_time"
            type="datetime"
            placeholder="Select start time"
            style="width: 200px"
          />
          <span style="margin: 0 10px">to</span>
          <el-date-picker
            v-model="form.end_time"
            type="datetime"
            placeholder="Select end time"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" style="width: 200px">
            <el-option label="Draft" value="draft" />
            <el-option label="Pending" value="pending" />
            <el-option label="Active" value="active" />
            <el-option label="Expired" value="expired" />
          </el-select>
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="Enter coupon description"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Check" @click="handleSubmit">
            {{ isEdit ? 'Update' : 'Create' }}
          </el-button>
          <el-button @click="handleCancel">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.coupon-form {
  padding: 24px;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.form-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}
</style>

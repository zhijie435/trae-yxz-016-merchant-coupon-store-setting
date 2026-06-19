<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
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
const submitting = ref(false);

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
  status: 'pending' as 'draft' | 'pending' | 'active' | 'rejected' | 'expired',
  description: '',
});

const typeMap = {
  cash: '满减券',
  discount: '折扣券',
};

const rules: FormRules = {
  name: [
    { required: true, message: '请输入优惠券名称', trigger: 'blur' },
    { max: 100, message: '名称不能超过100个字符', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择优惠券类型', trigger: 'change' }],
  value: [
    { required: true, message: '请输入优惠金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '优惠金额必须大于0', trigger: 'blur' },
  ],
  total_count: [
    { required: true, message: '请输入总数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '总数量至少为1', trigger: 'blur' },
  ],
  start_time: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  end_time: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
};

const validateDateRange = (rule: any, value: any, callback: any) => {
  if (form.value.start_time && form.value.end_time) {
    const startDate = new Date(form.value.start_time);
    const endDate = new Date(form.value.end_time);
    if (startDate >= endDate) {
      callback(new Error('结束时间必须晚于开始时间'));
    } else {
      callback();
    }
  } else {
    callback();
  }
};

const handleValueChange = () => {
  if (form.value.type === 'cash' && form.value.value > 0) {
    if (form.value.min_amount > 0 && form.value.value >= form.value.min_amount) {
      ElMessage.warning('优惠金额不应大于或等于最低消费金额');
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  submitting.value = true;
  try {
    await formRef.value.validate(async (valid) => {
      if (valid) {
        let success: boolean | number | null = false;

        const submitData = { ...form.value };

        if (submitData.value > 0 && submitData.min_amount > 0 && submitData.value >= submitData.min_amount) {
          ElMessage.warning('优惠金额应小于最低消费金额');
          submitting.value = false;
          return;
        }

        if (submitData.start_time && submitData.end_time) {
          const startDate = new Date(submitData.start_time);
          const endDate = new Date(submitData.end_time);
          if (startDate >= endDate) {
            ElMessage.error('结束时间必须晚于开始时间');
            submitting.value = false;
            return;
          }
        }

        if (isEdit.value && couponId.value) {
          if (submitData.status === 'active') {
            submitData.status = 'pending';
          }
          success = await couponStore.updateCoupon(couponId.value, submitData);
        } else {
          success = await couponStore.createCoupon(submitData);
        }

        if (success) {
          router.push('/settings/coupons');
        }
      }
    });
  } catch (error) {
    ElMessage.error('请检查表单字段');
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  router.back();
};

const handleSaveDraft = async () => {
  if (!formRef.value) return;

  submitting.value = true;
  try {
    const submitData = { ...form.value, status: 'draft' as const };

    if (isEdit.value && couponId.value) {
      const success = await couponStore.updateCoupon(couponId.value, submitData);
      if (success) {
        router.push('/settings/coupons');
      }
    } else {
      const id = await couponStore.createCoupon(submitData);
      if (id) {
        router.push('/settings/coupons');
      }
    }
  } catch (error) {
    ElMessage.error('保存草稿失败');
  } finally {
    submitting.value = false;
  }
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
      <el-button :icon="ArrowLeft" @click="handleCancel">返回</el-button>
      <h2>{{ isEdit ? '编辑优惠券' : '创建新优惠券' }}</h2>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        style="max-width: 800px"
      >
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入优惠券名称" />
        </el-form-item>

        <el-form-item label="优惠券类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="cash">满减券</el-radio>
            <el-radio label="discount">折扣券</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="form.type === 'cash' ? '优惠金额' : '折扣比例'" prop="value">
          <el-input-number
            v-model="form.value"
            :min="0"
            :max="form.type === 'discount' ? 100 : 999999"
            :precision="2"
            :step="1"
            style="width: 200px"
            @change="handleValueChange"
          />
          <span class="form-tip">{{ form.type === 'cash' ? '元' : '%' }}</span>
        </el-form-item>

        <el-form-item label="最低消费金额" prop="min_amount">
          <el-input-number
            v-model="form.min_amount"
            :min="0"
            :precision="2"
            :step="10"
            style="width: 200px"
            @change="handleValueChange"
          />
          <span class="form-tip">消费满此金额可用，设为0则无限制</span>
        </el-form-item>

        <el-form-item label="最高优惠金额" prop="max_discount" v-if="form.type === 'discount'">
          <el-input-number
            v-model="form.max_discount"
            :min="0"
            :precision="2"
            :step="10"
            style="width: 200px"
          />
          <span class="form-tip">最高优惠金额，0表示不限制</span>
        </el-form-item>

        <el-form-item label="发放总数量" prop="total_count">
          <el-input-number
            v-model="form.total_count"
            :min="1"
            :step="10"
            style="width: 200px"
          />
          <span class="form-tip">优惠券总发放数量</span>
        </el-form-item>

        <el-form-item label="每人限领数量" prop="per_user_limit">
          <el-input-number
            v-model="form.per_user_limit"
            :min="1"
            :step="1"
            style="width: 200px"
          />
          <span class="form-tip">每个用户最多可领取的数量</span>
        </el-form-item>

        <el-form-item label="有效期" prop="start_time">
          <el-date-picker
            v-model="form.start_time"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 200px"
            :disabled-date="(date: Date) => date < new Date(new Date().setHours(0,0,0,0))"
          />
          <span style="margin: 0 10px">至</span>
          <el-date-picker
            v-model="form.end_time"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 200px"
            :disabled="!form.start_time"
          />
        </el-form-item>

        <el-form-item label="使用说明" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入优惠券使用说明"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item v-if="isEdit">
          <el-alert
            title="提示：编辑后此优惠券需要重新审核"
            type="warning"
            :closable="false"
            style="margin-bottom: 20px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Check" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '提交审核' : '提交审核' }}
          </el-button>
          <el-button @click="handleSaveDraft" :loading="submitting">
            保存草稿
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
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

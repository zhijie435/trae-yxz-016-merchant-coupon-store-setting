<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCouponStore } from '../stores/coupon';
import { ElMessage, ElMessageBox, ElInput } from 'element-plus';
import { Plus, Search, Delete, Edit, View, Check, Close } from '@element-plus/icons-vue';
import type { Coupon } from '../api/coupon';

const router = useRouter();
const couponStore = useCouponStore();

const searchKeyword = ref('');
const selectedStatus = ref('');
const selectedCoupons = ref<number[]>([]);
const loading = ref(false);

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'active' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已过期', value: 'expired' },
];

const statusMap = {
  draft: { label: '草稿', color: '#909399' },
  pending: { label: '待审核', color: '#E6A23C' },
  active: { label: '已通过', color: '#67C23A' },
  rejected: { label: '已拒绝', color: '#F56C6C' },
  expired: { label: '已过期', color: '#909399' },
};

const typeMap = {
  cash: '满减券',
  discount: '折扣券',
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return '已过期';
  if (days === 0) return '今日过期';
  if (days <= 3) return `${days}天后过期`;
  return formatDate(dateString);
};

const handleSearch = () => {
  loading.value = true;
  couponStore.fetchCoupons({
    page: 1,
    keyword: searchKeyword.value,
    status: selectedStatus.value,
  }).finally(() => {
    loading.value = false;
  });
};

const handlePageChange = (page: number) => {
  loading.value = true;
  couponStore.fetchCoupons({
    page,
    keyword: searchKeyword.value,
    status: selectedStatus.value,
  }).finally(() => {
    loading.value = false;
  });
};

const handleSizeChange = (size: number) => {
  loading.value = true;
  couponStore.fetchCoupons({
    page: 1,
    pageSize: size,
    keyword: searchKeyword.value,
    status: selectedStatus.value,
  }).finally(() => {
    loading.value = false;
  });
};

const handleSelectionChange = (selection: Coupon[]) => {
  selectedCoupons.value = selection.map((item) => item.id!);
};

const handleCreate = () => {
  router.push('/settings/coupons/new');
};

const handleEdit = (id: number) => {
  router.push(`/settings/coupons/${id}/edit`);
};

const handleView = (coupon: Coupon) => {
  ElMessageBox.alert(
    `名称：${coupon.name}\n类型：${typeMap[coupon.type]}\n状态：${statusMap[coupon.status]?.label}\n有效期：${formatDate(coupon.start_time)} - ${formatDate(coupon.end_time)}\n剩余数量：${coupon.remain_count}/${coupon.total_count}\n\n描述：${coupon.description || '无'}`,
    '优惠券详情',
    {
      confirmButtonText: '关闭',
    }
  );
};

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除此优惠券吗？此操作不可撤销。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const success = await couponStore.deleteCoupon(id);
    if (success) {
      handleSearch();
      ElMessage.success('删除成功');
    }
  } catch (error) {
    // User cancelled
  }
};

const handleBatchDelete = async () => {
  if (selectedCoupons.value.length === 0) {
    ElMessage.warning('请先选择要删除的优惠券');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCoupons.value.length} 个优惠券吗？此操作不可撤销。`,
      '确认批量删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const success = await couponStore.deleteCoupons(selectedCoupons.value);
    if (success) {
      selectedCoupons.value = [];
      handleSearch();
      ElMessage.success('批量删除成功');
    }
  } catch (error) {
    // User cancelled
  }
};

const handleApprove = async (id: number) => {
  try {
    const { value: comment } = await ElMessageBox.prompt(
      '请输入审核通过备注（可选）',
      '审核通过',
      {
        confirmButtonText: '通过',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入备注信息',
      }
    );

    const success = await couponStore.approveCoupon(id, comment);
    if (success) {
      handleSearch();
      ElMessage.success('审核通过成功');
    }
  } catch (error) {
    // User cancelled
  }
};

const handleReject = async (id: number) => {
  try {
    const { value: comment } = await ElMessageBox.prompt(
      '请输入拒绝原因（可选）',
      '拒绝审核',
      {
        confirmButtonText: '拒绝',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入拒绝原因',
      }
    );

    const success = await couponStore.rejectCoupon(id, comment);
    if (success) {
      handleSearch();
      ElMessage.success('已拒绝');
    }
  } catch (error) {
    // User cancelled
  }
};

onMounted(() => {
  couponStore.fetchCoupons({ page: 1 });
});
</script>

<template>
  <div class="coupon-list">
    <div class="header">
      <h2>优惠券管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        创建优惠券
      </el-button>
    </div>

    <div class="filters">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索优惠券名称..."
        style="width: 300px"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select
        v-model="selectedStatus"
        placeholder="筛选状态"
        style="width: 200px"
        clearable
        @change="handleSearch"
      >
        <el-option
          v-for="item in statusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <el-button type="primary" @click="handleSearch">搜索</el-button>

      <el-button
        v-if="selectedCoupons.length > 0"
        type="danger"
        :icon="Delete"
        @click="handleBatchDelete"
      >
        批量删除 ({{ selectedCoupons.length }})
      </el-button>
    </div>

    <el-table
      :data="couponStore.coupons"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      style="width: 100%"
      stripe
    >
      <el-table-column type="selection" width="55" />

      <el-table-column prop="name" label="名称" min-width="150" show-overflow-tooltip />

      <el-table-column label="类型" width="120">
        <template #default="{ row }">
          <el-tag>{{ typeMap[row.type] || row.type }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="优惠金额" width="120">
        <template #default="{ row }">
          <span v-if="row.type === 'cash'">¥{{ row.value }}</span>
          <span v-else>{{ row.value }}%</span>
        </template>
      </el-table-column>

      <el-table-column label="最低消费" width="120">
        <template #default="{ row }">
          ¥{{ row.min_amount || 0 }}
        </template>
      </el-table-column>

      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :color="statusMap[row.status]?.color" style="color: white">
            {{ statusMap[row.status]?.label || row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="有效期" width="220">
        <template #default="{ row }">
          <div>
            <div>{{ formatDate(row.start_time) }}</div>
            <div>至</div>
            <div :class="{ 'text-danger': formatDateTime(row.end_time) === '已过期' }">
              {{ formatDate(row.end_time) }}
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="剩余数量" width="100">
        <template #default="{ row }">
          <span :class="{ 'text-warning': row.remain_count < row.total_count * 0.1 }">
            {{ row.remain_count }}/{{ row.total_count }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :icon="View" @click="handleView(row)">
            查看
          </el-button>
          <el-button link type="primary" :icon="Edit" @click="handleEdit(row.id!)">
            编辑
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            link
            type="success"
            :icon="Check"
            @click="handleApprove(row.id!)"
          >
            通过
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            link
            type="danger"
            :icon="Close"
            @click="handleReject(row.id!)"
          >
            拒绝
          </el-button>
          <el-button link type="danger" :icon="Delete" @click="handleDelete(row.id!)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="couponStore.pagination.page"
        v-model:page-size="couponStore.pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="couponStore.pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.coupon-list {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-danger {
  color: #F56C6C;
  font-weight: 600;
}

.text-warning {
  color: #E6A23C;
  font-weight: 600;
}

:deep(.el-table__row) {
  font-size: 14px;
}

:deep(.el-table__header) {
  font-weight: 600;
}
</style>

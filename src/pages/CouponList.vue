<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCouponStore } from '../stores/coupon';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, Delete, Edit, View } from '@element-plus/icons-vue';
import type { Coupon } from '../api/coupon';

const router = useRouter();
const couponStore = useCouponStore();

const searchKeyword = ref('');
const selectedStatus = ref('');
const selectedCoupons = ref<number[]>([]);

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' },
];

const statusMap = {
  draft: { label: 'Draft', color: '#909399' },
  pending: { label: 'Pending', color: '#E6A23C' },
  active: { label: 'Active', color: '#67C23A' },
  expired: { label: 'Expired', color: '#F56C6C' },
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
  });
};

const handleSearch = () => {
  couponStore.fetchCoupons({
    page: 1,
    keyword: searchKeyword.value,
    status: selectedStatus.value,
  });
};

const handlePageChange = (page: number) => {
  couponStore.fetchCoupons({
    page,
    keyword: searchKeyword.value,
    status: selectedStatus.value,
  });
};

const handleSizeChange = (size: number) => {
  couponStore.fetchCoupons({
    page: 1,
    pageSize: size,
    keyword: searchKeyword.value,
    status: selectedStatus.value,
  });
};

const handleSelectionChange = (selection: Coupon[]) => {
  selectedCoupons.value = selection.map((item) => item.id!);
};

const handleCreate = () => {
  router.push('/coupons/new');
};

const handleEdit = (id: number) => {
  router.push(`/coupons/${id}/edit`);
};

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this coupon?', 'Confirm', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    });

    const success = await couponStore.deleteCoupon(id);
    if (success) {
      handleSearch();
    }
  } catch (error) {
    // User cancelled
  }
};

const handleBatchDelete = async () => {
  if (selectedCoupons.value.length === 0) {
    ElMessage.warning('Please select coupons to delete');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete ${selectedCoupons.value.length} coupon(s)?`,
      'Confirm',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );

    const success = await couponStore.deleteCoupons(selectedCoupons.value);
    if (success) {
      selectedCoupons.value = [];
      handleSearch();
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
      <h2>Coupon Management</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        New Coupon
      </el-button>
    </div>

    <div class="filters">
      <el-input
        v-model="searchKeyword"
        placeholder="Search by name..."
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
        placeholder="Filter by status"
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

      <el-button
        v-if="selectedCoupons.length > 0"
        type="danger"
        :icon="Delete"
        @click="handleBatchDelete"
      >
        Delete Selected ({{ selectedCoupons.length }})
      </el-button>
    </div>

    <el-table
      :data="couponStore.coupons"
      v-loading="couponStore.loading"
      @selection-change="handleSelectionChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" />

      <el-table-column prop="name" label="Name" min-width="150" />

      <el-table-column label="Type" width="120">
        <template #default="{ row }">
          <el-tag>{{ typeMap[row.type] || row.type }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Value" width="120">
        <template #default="{ row }">
          <span v-if="row.type === 'cash'">¥{{ row.value }}</span>
          <span v-else>{{ row.value }}%</span>
        </template>
      </el-table-column>

      <el-table-column label="Min Amount" width="120">
        <template #default="{ row }">
          ¥{{ row.min_amount || 0 }}
        </template>
      </el-table-column>

      <el-table-column label="Status" width="120">
        <template #default="{ row }">
          <el-tag :color="statusMap[row.status]?.color" style="color: white">
            {{ statusMap[row.status]?.label || row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Valid Period" width="220">
        <template #default="{ row }">
          {{ formatDate(row.start_time) }} - {{ formatDate(row.end_time) }}
        </template>
      </el-table-column>

      <el-table-column label="Stock" width="100">
        <template #default="{ row }">
          {{ row.remain_count }}/{{ row.total_count }}
        </template>
      </el-table-column>

      <el-table-column label="Actions" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :icon="Edit" @click="handleEdit(row.id!)">
            Edit
          </el-button>
          <el-button link type="danger" :icon="Delete" @click="handleDelete(row.id!)">
            Delete
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
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

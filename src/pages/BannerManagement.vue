<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBannerStore } from '../stores/banner';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Upload, Delete, Edit, Picture, Top, Bottom, Check, Close } from '@element-plus/icons-vue';
import type { Banner } from '../api/banner';
import BannerFormDialog from './BannerFormDialog.vue';

const router = useRouter();
const bannerStore = useBannerStore();

const showFormDialog = ref(false);
const editingBanner = ref<Banner | null>(null);
const previewUrl = ref('');
const loading = ref(false);

const handleCreate = () => {
  editingBanner.value = null;
  showFormDialog.value = true;
};

const handleEdit = (banner: Banner) => {
  editingBanner.value = banner;
  showFormDialog.value = true;
};

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除此轮播图吗？此操作不可撤销。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const success = await bannerStore.deleteBanner(id);
    if (success) {
      ElMessage.success('删除成功');
      bannerStore.fetchBanners();
    }
  } catch (error) {
    // User cancelled
  }
};

const handleFormSuccess = () => {
  showFormDialog.value = false;
  ElMessage.success(editingBanner.value ? '修改成功' : '创建成功');
  bannerStore.fetchBanners();
};

const handleMoveTop = async (index: number) => {
  if (index === 0) return;

  const updates = [...bannerStore.banners];
  const item = updates.splice(index, 1)[0];
  updates.unshift(item);

  const sortUpdates = updates.map((banner, idx) => ({
    id: banner.id!,
    sort_order: idx,
  }));

  await bannerStore.updateSortOrders(sortUpdates);
  ElMessage.success('排序已更新');
  bannerStore.fetchBanners();
};

const handleMoveBottom = async (index: number) => {
  if (index === bannerStore.banners.length - 1) return;

  const updates = [...bannerStore.banners];
  const item = updates.splice(index, 1)[0];
  updates.push(item);

  const sortUpdates = updates.map((banner, idx) => ({
    id: banner.id!,
    sort_order: idx,
  }));

  await bannerStore.updateSortOrders(sortUpdates);
  ElMessage.success('排序已更新');
  bannerStore.fetchBanners();
};

const handlePreview = (url: string) => {
  previewUrl.value = url;
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

    const success = await bannerStore.approveBanner(id, comment);
    if (success) {
      ElMessage.success('审核通过成功');
      bannerStore.fetchBanners();
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

    const success = await bannerStore.rejectBanner(id, comment);
    if (success) {
      ElMessage.success('已拒绝');
      bannerStore.fetchBanners();
    }
  } catch (error) {
    // User cancelled
  }
};

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    active: 'success',
    inactive: 'info',
    rejected: 'danger',
  };
  return statusMap[status] || 'info';
};

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待审核',
    active: '已上线',
    inactive: '已下线',
    rejected: '已拒绝',
  };
  return labelMap[status] || status;
};

const formatCityScope = (cityScope: string) => {
  if (!cityScope || cityScope === 'all') {
    return '全国';
  }
  try {
    const cities = JSON.parse(cityScope);
    if (Array.isArray(cities)) {
      return cities.join(', ');
    }
    return cityScope;
  } catch {
    return cityScope;
  }
};

const formatTimeRange = (startTime?: string, endTime?: string) => {
  if (!startTime && !endTime) return '永久有效';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '不限';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return `${formatDate(startTime)} - ${formatDate(endTime)}`;
};

onMounted(() => {
  bannerStore.fetchBanners();
});
</script>

<template>
  <div class="banner-management">
    <div class="header">
      <h2>轮播图管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        添加轮播图
      </el-button>
    </div>

    <div class="banner-grid" v-loading="bannerStore.loading">
      <div v-if="bannerStore.banners.length === 0" class="empty-state">
        <el-icon :size="64"><Picture /></el-icon>
        <p>暂无轮播图，点击"添加轮播图"创建一个</p>
      </div>

      <div
        v-for="(banner, index) in bannerStore.banners"
        :key="banner.id"
        class="banner-card"
      >
        <div class="banner-image">
          <el-image
            :src="banner.image_url"
            fit="cover"
            :preview-src-list="[banner.image_url]"
            :initial-index="0"
            style="width: 100%; height: 200px"
          />
          <div class="banner-overlay">
            <el-button
              :icon="Top"
              circle
              size="small"
              @click="handleMoveTop(index)"
              :disabled="index === 0"
              title="置顶"
            />
            <el-button
              :icon="Bottom"
              circle
              size="small"
              @click="handleMoveBottom(index)"
              :disabled="index === bannerStore.banners.length - 1"
              title="置底"
            />
          </div>
          <el-tag
            :type="getStatusType(banner.status!)"
            class="status-tag"
          >
            {{ getStatusLabel(banner.status!) }}
          </el-tag>
          <div class="sort-order">
            {{ index + 1 }}
          </div>
        </div>

        <div class="banner-info">
          <h3>{{ banner.title }}</h3>
          <p v-if="banner.link_url" class="link-info">
            链接: {{ banner.link_url }}
          </p>
          <p v-if="banner.city_scope" class="city-scope">
            范围: {{ formatCityScope(banner.city_scope) }}
          </p>
          <p class="time-range">
            {{ formatTimeRange(banner.start_time, banner.end_time) }}
          </p>
          <div class="banner-actions">
            <el-button
              v-if="banner.status === 'pending'"
              link
              type="success"
              :icon="Check"
              @click="handleApprove(banner.id!)"
            >
              通过
            </el-button>
            <el-button
              v-if="banner.status === 'pending'"
              link
              type="danger"
              :icon="Close"
              @click="handleReject(banner.id!)"
            >
              拒绝
            </el-button>
            <el-button
              link
              type="primary"
              :icon="Edit"
              @click="handleEdit(banner)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              :icon="Delete"
              @click="handleDelete(banner.id!)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <BannerFormDialog
      v-model:visible="showFormDialog"
      :banner="editingBanner"
      @success="handleFormSuccess"
    />
  </div>
</template>

<style scoped>
.banner-management {
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state p {
  margin-top: 16px;
  font-size: 14px;
}

.banner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.banner-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.banner-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.banner-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.banner-card:hover .banner-overlay {
  opacity: 1;
}

.status-tag {
  position: absolute;
  top: 8px;
  right: 8px;
}

.sort-order {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
}

.banner-info {
  padding: 16px;
}

.banner-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.link-info {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.city-scope {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #67C23A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-range {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #409EFF;
}

.banner-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>

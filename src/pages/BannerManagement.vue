<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBannerStore } from '../stores/banner';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Upload, Delete, Edit, Picture, Top, Bottom } from '@element-plus/icons-vue';
import type { Banner } from '../api/banner';
import BannerFormDialog from './BannerFormDialog.vue';

const router = useRouter();
const bannerStore = useBannerStore();

const showFormDialog = ref(false);
const editingBanner = ref<Banner | null>(null);
const previewUrl = ref('');

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
    await ElMessageBox.confirm('Are you sure you want to delete this banner?', 'Confirm', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    });

    const success = await bannerStore.deleteBanner(id);
    if (success) {
      bannerStore.fetchBanners();
    }
  } catch (error) {
    // User cancelled
  }
};

const handleFormSuccess = () => {
  showFormDialog.value = false;
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
  bannerStore.fetchBanners();
};

const handlePreview = (url: string) => {
  previewUrl.value = url;
};

onMounted(() => {
  bannerStore.fetchBanners();
});
</script>

<template>
  <div class="banner-management">
    <div class="header">
      <h2>Banner Management</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        Add Banner
      </el-button>
    </div>

    <div class="banner-grid" v-loading="bannerStore.loading">
      <div v-if="bannerStore.banners.length === 0" class="empty-state">
        <el-icon :size="64"><Picture /></el-icon>
        <p>No banners yet. Click "Add Banner" to create one.</p>
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
            />
            <el-button
              :icon="Bottom"
              circle
              size="small"
              @click="handleMoveBottom(index)"
              :disabled="index === bannerStore.banners.length - 1"
            />
          </div>
          <el-tag
            :type="banner.status === 'active' ? 'success' : 'info'"
            class="status-tag"
          >
            {{ banner.status === 'active' ? 'Active' : 'Inactive' }}
          </el-tag>
        </div>

        <div class="banner-info">
          <h3>{{ banner.title }}</h3>
          <p v-if="banner.link_url" class="link-info">
            Link: {{ banner.link_url }}
          </p>
          <div class="banner-actions">
            <el-button
              link
              type="primary"
              :icon="Edit"
              @click="handleEdit(banner)"
            >
              Edit
            </el-button>
            <el-button
              link
              type="danger"
              :icon="Delete"
              @click="handleDelete(banner.id!)"
            >
              Delete
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

.banner-actions {
  display: flex;
  gap: 12px;
}
</style>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useBannerStore } from '../stores/banner';
import { ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElUpload, ElInputNumber, ElRadioGroup, ElRadio } from 'element-plus';
import { Upload, Picture } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { Banner } from '../api/banner';

const props = defineProps<{
  visible: boolean;
  banner: Banner | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

const bannerStore = useBannerStore();
const formRef = ref<FormInstance>();

const form = ref({
  title: '',
  image_url: '',
  link_url: '',
  link_type: 'none' as 'none' | 'url' | 'page' | 'product',
  sort_order: 0,
  status: 'pending' as 'pending' | 'active' | 'inactive' | 'rejected',
  city_scope: 'all',
});

const cities = [
  { value: 'all', label: 'All Cities' },
  { value: 'beijing', label: 'Beijing' },
  { value: 'shanghai', label: 'Shanghai' },
  { value: 'guangzhou', label: 'Guangzhou' },
  { value: 'shenzhen', label: 'Shenzhen' },
  { value: 'hangzhou', label: 'Hangzhou' },
  { value: 'chengdu', label: 'Chengdu' },
  { value: 'wuhan', label: 'Wuhan' },
  { value: 'xian', label: "Xi'an" },
  { value: 'chongqing', label: 'Chongqing' },
];

const rules: FormRules = {
  title: [
    { required: true, message: 'Please enter banner title', trigger: 'blur' },
    { max: 100, message: 'Title cannot exceed 100 characters', trigger: 'blur' },
  ],
  image_url: [
    { required: true, message: 'Please upload banner image', trigger: 'change' },
  ],
};

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.banner) {
      form.value = {
        title: props.banner.title,
        image_url: props.banner.image_url,
        link_url: props.banner.link_url || '',
        link_type: props.banner.link_type || 'none',
        sort_order: props.banner.sort_order || 0,
        status: props.banner.status || 'pending',
        city_scope: props.banner.city_scope || 'all',
      };
    } else if (newVal) {
      form.value = {
        title: '',
        image_url: '',
        link_url: '',
        link_type: 'none',
        sort_order: 0,
        status: 'pending',
        city_scope: 'all',
      };
    }
  }
);

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate(async (valid) => {
      if (valid) {
        let success: boolean | number | null = false;

        if (props.banner?.id) {
          const submitData = { ...form.value };
          if (submitData.status === 'active') {
            submitData.status = 'pending';
          }
          success = await bannerStore.updateBanner(props.banner.id, submitData);
        } else {
          success = await bannerStore.createBanner(form.value);
        }

        if (success) {
          emit('success');
        }
      }
    });
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleUploadSuccess = (response: any, file: any) => {
  if (response.code === 200 && response.data?.url) {
    form.value.image_url = response.data.url;
  } else {
    form.value.image_url = URL.createObjectURL(file.raw);
  }
};

const handleUploadError = (error: Error) => {
  console.error('Upload error:', error);
  form.value.image_url = '';
};

const handleRemoveImage = () => {
  form.value.image_url = '';
};

const sampleImages = [
  'https://picsum.photos/800/400?random=1',
  'https://picsum.photos/800/400?random=2',
  'https://picsum.photos/800/400?random=3',
  'https://picsum.photos/800/400?random=4',
  'https://picsum.photos/800/400?random=5',
];

const useSampleImage = (url: string) => {
  form.value.image_url = url;
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="banner ? 'Edit Banner' : 'Add Banner'"
    width="600px"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="Banner Title" prop="title">
        <el-input v-model="form.title" placeholder="Enter banner title" />
      </el-form-item>

      <el-form-item label="Banner Image" prop="image_url">
        <div class="image-upload-container">
          <div v-if="form.image_url" class="image-preview">
            <el-image
              :src="form.image_url"
              fit="cover"
              style="width: 100%; height: 150px"
            />
            <el-button
              type="danger"
              size="small"
              class="remove-btn"
              @click="handleRemoveImage"
            >
              Remove
            </el-button>
          </div>

          <div v-else class="upload-placeholder">
            <el-upload
              class="upload-demo"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              action="#"
              :auto-upload="false"
              :http-request="(options: any) => {
                const file = options.file;
                const reader = new FileReader();
                reader.onload = (e) => {
                  form.image_url = e.target?.result as string;
                };
                reader.readAsDataURL(file);
              }"
            >
              <el-button type="primary" :icon="Upload">Upload Image</el-button>
            </el-upload>

            <div class="sample-images">
              <p>Or choose a sample:</p>
              <div class="sample-grid">
                <div
                  v-for="(url, idx) in sampleImages"
                  :key="idx"
                  class="sample-item"
                  @click="useSampleImage(url)"
                >
                  <el-image :src="url" fit="cover" style="width: 80px; height: 40px" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="Link Type" prop="link_type">
        <el-radio-group v-model="form.link_type">
          <el-radio label="none">No Link</el-radio>
          <el-radio label="url">External URL</el-radio>
          <el-radio label="page">Internal Page</el-radio>
          <el-radio label="product">Product</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="Link URL" prop="link_url" v-if="form.link_type !== 'none'">
        <el-input
          v-model="form.link_url"
          placeholder="Enter link URL"
          :disabled="form.link_type === 'none'"
        />
      </el-form-item>

      <el-form-item label="City Scope" prop="city_scope">
        <el-select v-model="form.city_scope" placeholder="Select city scope" style="width: 100%">
          <el-option
            v-for="city in cities"
            :key="city.value"
            :label="city.label"
            :value="city.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Sort Order" prop="sort_order">
        <el-input-number
          v-model="form.sort_order"
          :min="0"
          :max="100"
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item v-if="props.banner?.id">
        <el-alert
          title="Note: This banner will need to be reviewed again after editing"
          type="warning"
          :closable="false"
          style="margin-bottom: 20px"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="bannerStore.loading">
          {{ banner ? 'Update' : 'Create' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.image-upload-container {
  width: 100%;
}

.image-preview {
  position: relative;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.upload-placeholder {
  width: 100%;
}

.sample-images {
  margin-top: 16px;
}

.sample-images p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #909399;
}

.sample-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sample-item {
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.sample-item:hover {
  border-color: #409eff;
}
</style>

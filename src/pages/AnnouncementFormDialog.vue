<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAnnouncementStore } from '../stores/announcement';
import { ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElDatePicker, ElUpload, ElImage } from 'element-plus';
import { Bell, Upload } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { Announcement } from '../api/announcement';

const props = defineProps<{
  visible: boolean;
  announcement: Announcement | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

const announcementStore = useAnnouncementStore();
const formRef = ref<FormInstance>();

const form = ref({
  title: '',
  content: '',
  type: 'popup' as 'popup' | 'banner' | 'notice',
  priority: 0,
  start_time: '',
  end_time: '',
  image_url: '',
  button_text: '',
  button_link: '',
});

const rules: FormRules = {
  title: [
    { required: true, message: 'Please enter announcement title', trigger: 'blur' },
    { max: 200, message: 'Title cannot exceed 200 characters', trigger: 'blur' },
  ],
  content: [
    { required: true, message: 'Please enter announcement content', trigger: 'blur' },
  ],
  type: [
    { required: true, message: 'Please select announcement type', trigger: 'change' },
  ],
};

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.announcement) {
      form.value = {
        title: props.announcement.title,
        content: props.announcement.content,
        type: props.announcement.type as 'popup' | 'banner' | 'notice' || 'popup',
        priority: props.announcement.priority || 0,
        start_time: props.announcement.start_time || '',
        end_time: props.announcement.end_time || '',
        image_url: props.announcement.image_url || '',
        button_text: props.announcement.button_text || '',
        button_link: props.announcement.button_link || '',
      };
    } else if (newVal) {
      form.value = {
        title: '',
        content: '',
        type: 'popup',
        priority: 0,
        start_time: '',
        end_time: '',
        image_url: '',
        button_text: '',
        button_link: '',
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

        if (props.announcement?.id) {
          success = await announcementStore.updateAnnouncement(props.announcement.id, form.value);
        } else {
          success = await announcementStore.createAnnouncement(form.value);
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

const typeOptions = [
  { label: 'Popup Modal', value: 'popup', description: 'Shows as a popup when users visit' },
  { label: 'Banner', value: 'banner', description: 'Shows as a banner at the top of the page' },
  { label: 'Notice Bar', value: 'notice', description: 'Shows as a scrolling notice' },
];

const sampleImages = [
  'https://picsum.photos/800/400?random=10',
  'https://picsum.photos/800/400?random=11',
  'https://picsum.photos/800/400?random=12',
  'https://picsum.photos/800/400?random=13',
  'https://picsum.photos/800/400?random=14',
];

const handleUploadSuccess = (response: any, file: any) => {
  if (response.code === 200 && response.data?.url) {
    form.value.image_url = response.data.url;
  } else {
    form.value.image_url = URL.createObjectURL(file.raw);
  }
};

const handleUploadError = (error: Error) => {
  console.error('Upload error:', error);
};

const handleRemoveImage = () => {
  form.value.image_url = '';
};

const useSampleImage = (url: string) => {
  form.value.image_url = url;
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="announcement ? 'Edit Announcement' : 'Create Announcement'"
    width="600px"
    @close="handleCancel"
  >
    <el-alert
      title="Review Required"
      type="info"
      description="Announcements need to be reviewed and approved by HQ before they can be published."
      :closable="false"
      style="margin-bottom: 20px"
    />

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
    >
      <el-form-item label="Announcement Type" prop="type">
        <el-select v-model="form.type" placeholder="Select type" style="width: 100%">
          <el-option
            v-for="option in typeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          >
            <span>{{ option.label }}</span>
            <br>
            <span style="font-size: 12px; color: #909399">{{ option.description }}</span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Title" prop="title">
        <el-input
          v-model="form.title"
          placeholder="Enter announcement title"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="Content" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="6"
          placeholder="Enter announcement content"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="Popup Image" prop="image_url">
        <div class="image-upload-container">
          <div v-if="form.image_url" class="image-preview">
            <el-image
              :src="form.image_url"
              fit="cover"
              style="width: 100%; height: 150px; border-radius: 4px;"
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

      <el-form-item label="Button Text" prop="button_text">
        <el-input
          v-model="form.button_text"
          placeholder="e.g., Learn More, View Details"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="Button Link" prop="button_link">
        <el-input
          v-model="form.button_link"
          placeholder="e.g., https://example.com/page"
        />
      </el-form-item>

      <el-form-item label="Priority" prop="priority">
        <el-input
          v-model.number="form.priority"
          type="number"
          :min="0"
          :max="100"
          placeholder="Higher number = higher priority"
          style="width: 200px"
        />
        <span style="margin-left: 12px; color: #909399; font-size: 12px">0-100</span>
      </el-form-item>

      <el-form-item label="Valid Period" prop="dateRange">
        <el-date-picker
          v-model="form.start_time"
          type="datetime"
          placeholder="Start time (optional)"
          style="width: 45%"
        />
        <span style="margin: 0 10px; color: #909399">to</span>
        <el-date-picker
          v-model="form.end_time"
          type="datetime"
          placeholder="End time (optional)"
          style="width: 45%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="announcementStore.loading">
          {{ announcement ? 'Update' : 'Submit for Review' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
:deep(.el-select-dropdown__item) {
  height: auto;
  padding: 10px;
}

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

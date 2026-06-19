<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAnnouncementStore } from '../stores/announcement';
import { ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElDatePicker } from 'element-plus';
import { Bell } from '@element-plus/icons-vue';
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
      };
    } else if (newVal) {
      form.value = {
        title: '',
        content: '',
        type: 'popup',
        priority: 0,
        start_time: '',
        end_time: '',
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
</style>

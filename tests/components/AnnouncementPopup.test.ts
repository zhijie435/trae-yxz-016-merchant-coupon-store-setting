import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AnnouncementPopup from '../../src/components/AnnouncementPopup.vue';

vi.mock('../../src/api/announcement', () => ({
  announcementApi: {
    getActiveAnnouncements: vi.fn()
  }
}));

describe('AnnouncementPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Component Rendering', () => {
    it('should render without errors', async () => {
      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: []
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });

    it('should have dialog component', async () => {
      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: []
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(wrapper.findComponent({ name: 'ElDialog' }).exists()).toBe(true);
    });
  });

  describe('Announcement Loading', () => {
    it('should load active announcements on mount', async () => {
      const mockAnnouncements = [
        {
          id: 1,
          title: 'Test Announcement',
          content: 'Test content',
          type: 'popup',
          image_url: null,
          button_text: null,
          button_link: null
        }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(announcementApi.getActiveAnnouncements).toHaveBeenCalled();
    });

    it('should filter popup type announcements only', async () => {
      const mockAnnouncements = [
        { id: 1, title: 'Popup', content: 'Popup content', type: 'popup' },
        { id: 2, title: 'Banner', content: 'Banner content', type: 'banner' },
        { id: 3, title: 'Notice', content: 'Notice content', type: 'notice' }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(wrapper.vm.announcementQueue.length).toBe(1);
      expect(wrapper.vm.announcementQueue[0].type).toBe('popup');
    });

    it('should filter already shown announcements', async () => {
      localStorage.setItem('announcement_popups_shown', JSON.stringify([1]));

      const mockAnnouncements = [
        { id: 1, title: 'Already Shown', content: 'Content 1', type: 'popup' },
        { id: 2, title: 'Not Shown', content: 'Content 2', type: 'popup' }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(wrapper.vm.announcementQueue.length).toBe(1);
      expect(wrapper.vm.announcementQueue[0].id).toBe(2);
    });

    it('should handle API error gracefully', async () => {
      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockRejectedValueOnce(
        new Error('Network error')
      );

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(wrapper.vm.loading).toBe(false);
    });
  });

  describe('Dialog Visibility', () => {
    it('should show dialog when there are announcements', async () => {
      const mockAnnouncements = [
        {
          id: 1,
          title: 'Test',
          content: 'Content',
          type: 'popup'
        }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(wrapper.vm.visible).toBe(true);
    });

    it('should hide dialog when no announcements', async () => {
      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: []
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(wrapper.vm.visible).toBe(false);
    });
  });

  describe('Queue Navigation', () => {
    it('should show next announcement when multiple announcements', async () => {
      const mockAnnouncements = [
        { id: 1, title: 'First', content: 'Content 1', type: 'popup' },
        { id: 2, title: 'Second', content: 'Content 2', type: 'popup' }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(wrapper.vm.currentIndex).toBe(0);
      expect(wrapper.vm.currentAnnouncement.title).toBe('First');

      await wrapper.vm.handleClose();

      expect(wrapper.vm.currentIndex).toBe(1);
      expect(wrapper.vm.currentAnnouncement.title).toBe('Second');
    });

    it('should close dialog when on last announcement', async () => {
      const mockAnnouncements = [
        { id: 1, title: 'First', content: 'Content 1', type: 'popup' },
        { id: 2, title: 'Second', content: 'Content 2', type: 'popup' }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      await wrapper.vm.handleClose();
      await wrapper.vm.handleClose();

      expect(wrapper.vm.visible).toBe(false);
      expect(wrapper.vm.announcementQueue.length).toBe(0);
    });

    it('should show correct progress indicator', async () => {
      const mockAnnouncements = [
        { id: 1, title: 'First', content: 'Content 1', type: 'popup' },
        { id: 2, title: 'Second', content: 'Content 2', type: 'popup' }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      const progress = wrapper.find('.progress-text');
      expect(progress.exists()).toBe(true);
      expect(progress.text()).toBe('1 / 2');
    });
  });

  describe('LocalStorage Integration', () => {
    it('should save shown announcement to localStorage', async () => {
      const mockAnnouncements = [
        {
          id: 1,
          title: 'Test',
          content: 'Content',
          type: 'popup'
        }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();
      await wrapper.vm.handleClose();

      const shown = JSON.parse(localStorage.getItem('announcement_popups_shown') || '[]');
      expect(shown).toContain(1);
    });

    it('should not duplicate already shown announcements', async () => {
      localStorage.setItem('announcement_popups_shown', JSON.stringify([1]));

      const mockAnnouncements = [
        { id: 1, title: 'Test', content: 'Content', type: 'popup' }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();
      await wrapper.vm.handleClose();

      const shown = JSON.parse(localStorage.getItem('announcement_popups_shown') || '[]');
      expect(shown.filter((id: number) => id === 1).length).toBe(1);
    });
  });

  describe('Button Actions', () => {
    it('should open button link in new tab', async () => {
      const mockOpen = window.open;
      window.open = vi.fn();

      const mockAnnouncements = [
        {
          id: 1,
          title: 'Test',
          content: 'Content',
          type: 'popup',
          button_text: 'Click Me',
          button_link: 'https://example.com'
        }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();
      await wrapper.vm.handleButtonClick();

      expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');

      window.open = mockOpen;
    });

    it('should not open link if no button_link', async () => {
      const mockOpen = window.open;
      window.open = vi.fn();

      const mockAnnouncements = [
        {
          id: 1,
          title: 'Test',
          content: 'Content',
          type: 'popup',
          button_text: 'Click Me',
          button_link: null
        }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();
      await wrapper.vm.handleButtonClick();

      expect(window.open).not.toHaveBeenCalled();

      window.open = mockOpen;
    });
  });

  describe('"Dont Show Again" Feature', () => {
    it('should mark announcement as shown and close dialog', async () => {
      const mockAnnouncements = [
        {
          id: 1,
          title: 'Test',
          content: 'Content',
          type: 'popup'
        }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();
      await wrapper.vm.handleDontShowAgain();

      expect(wrapper.vm.visible).toBe(false);
      expect(wrapper.vm.announcementQueue.length).toBe(0);

      const shown = JSON.parse(localStorage.getItem('announcement_popups_shown') || '[]');
      expect(shown).toContain(1);
    });
  });

  describe('Image Display', () => {
    it('should display image when provided', async () => {
      const mockAnnouncements = [
        {
          id: 1,
          title: 'Test',
          content: 'Content',
          type: 'popup',
          image_url: 'https://example.com/image.jpg'
        }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(wrapper.find('.announcement-image').exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'ElImage' }).exists()).toBe(true);
    });

    it('should not display image section when no image', async () => {
      const mockAnnouncements = [
        {
          id: 1,
          title: 'Test',
          content: 'Content',
          type: 'popup',
          image_url: null
        }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(wrapper.find('.announcement-image').exists()).toBe(false);
    });
  });

  describe('Watchers', () => {
    it('should reload announcements when storeId changes', async () => {
      const mockAnnouncements = [
        { id: 1, title: 'Test', content: 'Content', type: 'popup' }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValue({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(announcementApi.getActiveAnnouncements).toHaveBeenCalledTimes(1);

      await wrapper.setProps({ storeId: 2 });
      await flushPromises();

      expect(announcementApi.getActiveAnnouncements).toHaveBeenCalledTimes(2);
    });
  });

  describe('Computed Properties', () => {
    it('should correctly calculate hasMoreAnnouncements', async () => {
      const mockAnnouncements = [
        { id: 1, title: 'First', content: 'Content 1', type: 'popup' },
        { id: 2, title: 'Second', content: 'Content 2', type: 'popup' }
      ];

      const { announcementApi } = await import('../../src/api/announcement');
      vi.mocked(announcementApi.getActiveAnnouncements).mockResolvedValueOnce({
        code: 200,
        data: mockAnnouncements
      });

      const wrapper = mount(AnnouncementPopup, {
        props: { storeId: 1 }
      });

      await flushPromises();

      expect(wrapper.vm.hasMoreAnnouncements).toBe(true);
    });
  });
});

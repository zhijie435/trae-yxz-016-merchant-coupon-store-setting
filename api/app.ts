/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { initializeDatabase } from './database/index.js'
import couponService from './services/couponService.js'
import bannerService from './services/bannerService.js'
import announcementService from './services/announcementService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

initializeDatabase()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'ok' })
})

app.get('/api/coupons', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10
    const keyword = req.query.keyword as string || ''
    const status = req.query.status as string || ''

    const result = couponService.getCouponList({ page, pageSize, keyword, status })

    res.json({
      code: 200,
      message: 'success',
      data: result,
    })
  } catch (error) {
    console.error('Error getting coupon list:', error)
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
      data: null,
    })
  }
})

app.get('/api/coupons/active', async (req: Request, res: Response) => {
  try {
    const coupons = couponService.getActiveCoupons()
    res.json({ code: 200, message: 'success', data: coupons })
  } catch (error) {
    console.error('Error getting active coupons:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.get('/api/coupons/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const coupon = couponService.getCouponById(id)

    if (!coupon) {
      res.status(404).json({ code: 404, message: 'Coupon not found', data: null })
      return
    }

    res.json({ code: 200, message: 'success', data: coupon })
  } catch (error) {
    console.error('Error getting coupon:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.post('/api/coupons', async (req: Request, res: Response) => {
  try {
    const couponData = req.body

    if (!couponData.name || !couponData.value || !couponData.start_time || !couponData.end_time) {
      res.status(400).json({ code: 400, message: 'Missing required fields', data: null })
      return
    }

    const id = couponService.createCoupon({
      name: couponData.name,
      type: couponData.type || 'cash',
      value: couponData.value,
      min_amount: couponData.min_amount || 0,
      max_discount: couponData.max_discount || null,
      total_count: couponData.total_count || 0,
      remain_count: couponData.remain_count || couponData.total_count || 0,
      per_user_limit: couponData.per_user_limit || 1,
      start_time: couponData.start_time,
      end_time: couponData.end_time,
      status: 'pending',
      description: couponData.description || '',
    })

    res.json({ code: 200, message: 'Coupon created successfully', data: { id } })
  } catch (error) {
    console.error('Error creating coupon:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.put('/api/coupons/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const updates = req.body
    const success = couponService.updateCoupon(id, updates)

    if (!success) {
      res.status(404).json({ code: 404, message: 'Coupon not found or no changes made', data: null })
      return
    }

    res.json({ code: 200, message: 'Coupon updated successfully', data: null })
  } catch (error) {
    console.error('Error updating coupon:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.delete('/api/coupons/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const success = couponService.deleteCoupon(id)

    if (!success) {
      res.status(404).json({ code: 404, message: 'Coupon not found', data: null })
      return
    }

    res.json({ code: 200, message: 'Coupon deleted successfully', data: null })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.delete('/api/coupons', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ code: 400, message: 'Invalid ids array', data: null })
      return
    }

    const deletedCount = couponService.deleteCoupons(ids)
    res.json({ code: 200, message: `${deletedCount} coupon(s) deleted successfully`, data: null })
  } catch (error) {
    console.error('Error deleting coupons:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.post('/api/coupons/:id/approve', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { comment, reviewer_id } = req.body
    const success = couponService.approveCoupon(id, { comment, reviewer_id })

    if (!success) {
      res.status(404).json({ code: 404, message: 'Coupon not found or not in pending status', data: null })
      return
    }

    res.json({ code: 200, message: 'Coupon approved successfully', data: null })
  } catch (error) {
    console.error('Error approving coupon:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.post('/api/coupons/:id/reject', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { comment, reviewer_id } = req.body
    const success = couponService.rejectCoupon(id, { comment, reviewer_id })

    if (!success) {
      res.status(404).json({ code: 404, message: 'Coupon not found or not in pending status', data: null })
      return
    }

    res.json({ code: 200, message: 'Coupon rejected', data: null })
  } catch (error) {
    console.error('Error rejecting coupon:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.get('/api/coupons/status/pending', async (req: Request, res: Response) => {
  try {
    const coupons = couponService.getPendingCoupons()
    res.json({ code: 200, message: 'success', data: coupons })
  } catch (error) {
    console.error('Error getting pending coupons:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

// Banner APIs
app.get('/api/banners', async (req: Request, res: Response) => {
  try {
    const store_id = parseInt(req.query.store_id as string) || 1
    const status = req.query.status as string || ''

    const result = bannerService.getBannerList({ store_id, status })

    res.json({
      code: 200,
      message: 'success',
      data: result,
    })
  } catch (error) {
    console.error('Error getting banner list:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.get('/api/banners/active', async (req: Request, res: Response) => {
  try {
    const banners = bannerService.getActiveBanners()
    res.json({ code: 200, message: 'success', data: banners })
  } catch (error) {
    console.error('Error getting active banners:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.get('/api/banners/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const banner = bannerService.getBannerById(id)

    if (!banner) {
      res.status(404).json({ code: 404, message: 'Banner not found', data: null })
      return
    }

    res.json({ code: 200, message: 'success', data: banner })
  } catch (error) {
    console.error('Error getting banner:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.post('/api/banners', async (req: Request, res: Response) => {
  try {
    const bannerData = req.body

    if (!bannerData.title || !bannerData.image_url) {
      res.status(400).json({ code: 400, message: 'Title and image are required', data: null })
      return
    }

    const id = bannerService.createBanner({
      store_id: bannerData.store_id || 1,
      title: bannerData.title,
      image_url: bannerData.image_url,
      link_url: bannerData.link_url,
      link_type: bannerData.link_type || 'none',
      sort_order: bannerData.sort_order || 0,
      status: 'pending',
      city_scope: bannerData.city_scope || 'all',
      start_time: bannerData.start_time,
      end_time: bannerData.end_time,
    })

    res.json({ code: 200, message: 'Banner created successfully', data: { id } })
  } catch (error) {
    console.error('Error creating banner:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.put('/api/banners/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const updates = req.body
    const success = bannerService.updateBanner(id, updates)

    if (!success) {
      res.status(404).json({ code: 404, message: 'Banner not found or no changes made', data: null })
      return
    }

    res.json({ code: 200, message: 'Banner updated successfully', data: null })
  } catch (error) {
    console.error('Error updating banner:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.delete('/api/banners/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const success = bannerService.deleteBanner(id)

    if (!success) {
      res.status(404).json({ code: 404, message: 'Banner not found', data: null })
      return
    }

    res.json({ code: 200, message: 'Banner deleted successfully', data: null })
  } catch (error) {
    console.error('Error deleting banner:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.post('/api/banners/:id/approve', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { comment, reviewer_id } = req.body
    const success = bannerService.approveBanner(id, { comment, reviewer_id })

    if (!success) {
      res.status(404).json({ code: 404, message: 'Banner not found or not in pending status', data: null })
      return
    }

    res.json({ code: 200, message: 'Banner approved successfully', data: null })
  } catch (error) {
    console.error('Error approving banner:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.post('/api/banners/:id/reject', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { comment, reviewer_id } = req.body
    const success = bannerService.rejectBanner(id, { comment, reviewer_id })

    if (!success) {
      res.status(404).json({ code: 404, message: 'Banner not found or not in pending status', data: null })
      return
    }

    res.json({ code: 200, message: 'Banner rejected', data: null })
  } catch (error) {
    console.error('Error rejecting banner:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.get('/api/banners/status/pending', async (req: Request, res: Response) => {
  try {
    const banners = bannerService.getPendingBanners()
    res.json({ code: 200, message: 'success', data: banners })
  } catch (error) {
    console.error('Error getting pending banners:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.post('/api/banners/sort', async (req: Request, res: Response) => {
  try {
    const { updates } = req.body

    if (!Array.isArray(updates)) {
      res.status(400).json({ code: 400, message: 'Invalid updates array', data: null })
      return
    }

    const success = bannerService.updateSortOrders(updates)

    if (!success) {
      res.status(500).json({ code: 500, message: 'Failed to update sort orders', data: null })
      return
    }

    res.json({ code: 200, message: 'Sort orders updated successfully', data: null })
  } catch (error) {
    console.error('Error updating sort orders:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

// Announcement APIs
app.get('/api/announcements', async (req: Request, res: Response) => {
  try {
    const store_id = parseInt(req.query.store_id as string) || 1
    const status = req.query.status as string || ''
    const type = req.query.type as string || ''

    const result = announcementService.getAnnouncementList({ store_id, status, type })

    res.json({
      code: 200,
      message: 'success',
      data: result,
    })
  } catch (error) {
    console.error('Error getting announcement list:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.get('/api/announcements/active', async (req: Request, res: Response) => {
  try {
    const announcements = announcementService.getActiveAnnouncements()

    res.json({
      code: 200,
      message: 'success',
      data: announcements,
    })
  } catch (error) {
    console.error('Error getting active announcements:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.get('/api/announcements/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const announcement = announcementService.getAnnouncementById(id)

    if (!announcement) {
      res.status(404).json({ code: 404, message: 'Announcement not found', data: null })
      return
    }

    res.json({ code: 200, message: 'success', data: announcement })
  } catch (error) {
    console.error('Error getting announcement:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.post('/api/announcements', async (req: Request, res: Response) => {
  try {
    const announcementData = req.body

    if (!announcementData.title || !announcementData.content) {
      res.status(400).json({ code: 400, message: 'Title and content are required', data: null })
      return
    }

    const id = announcementService.createAnnouncement({
      store_id: announcementData.store_id || 1,
      title: announcementData.title,
      content: announcementData.content,
      type: announcementData.type || 'popup',
      status: 'pending',
      priority: announcementData.priority || 0,
      start_time: announcementData.start_time,
      end_time: announcementData.end_time,
      image_url: announcementData.image_url,
      button_text: announcementData.button_text,
      button_link: announcementData.button_link,
    })

    res.json({ code: 200, message: 'Announcement created successfully, waiting for review', data: { id } })
  } catch (error) {
    console.error('Error creating announcement:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.put('/api/announcements/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const updates = req.body
    const success = announcementService.updateAnnouncement(id, updates)

    if (!success) {
      res.status(404).json({ code: 404, message: 'Announcement not found or no changes made', data: null })
      return
    }

    res.json({ code: 200, message: 'Announcement updated successfully', data: null })
  } catch (error) {
    console.error('Error updating announcement:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.post('/api/announcements/:id/review', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { status, reviewer_id, comment } = req.body

    if (!status || !['approved', 'rejected'].includes(status)) {
      res.status(400).json({ code: 400, message: 'Invalid review status', data: null })
      return
    }

    const success = announcementService.reviewAnnouncement(id, status, reviewer_id || 1, comment)

    if (!success) {
      res.status(404).json({ code: 404, message: 'Announcement not found', data: null })
      return
    }

    res.json({ code: 200, message: `Announcement ${status === 'approved' ? 'approved' : 'rejected'} successfully`, data: null })
  } catch (error) {
    console.error('Error reviewing announcement:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.delete('/api/announcements/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const success = announcementService.deleteAnnouncement(id)

    if (!success) {
      res.status(404).json({ code: 404, message: 'Announcement not found', data: null })
      return
    }

    res.json({ code: 200, message: 'Announcement deleted successfully', data: null })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    res.status(500).json({ code: 500, message: 'Internal server error', data: null })
  }
})

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error handler:', error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app

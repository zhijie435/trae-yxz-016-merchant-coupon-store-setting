import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import CouponList from '@/pages/CouponList.vue'
import CouponForm from '@/pages/CouponForm.vue'
import StoreSettings from '@/pages/StoreSettings.vue'
import BannerManagement from '@/pages/BannerManagement.vue'

const routes = [
  {
    path: '/',
    redirect: '/settings/coupons',
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/settings',
    component: StoreSettings,
    children: [
      {
        path: 'coupons',
        name: 'coupon-list',
        component: CouponList,
      },
      {
        path: 'coupons/new',
        name: 'coupon-new',
        component: CouponForm,
      },
      {
        path: 'coupons/:id/edit',
        name: 'coupon-edit',
        component: CouponForm,
      },
      {
        path: 'banners',
        name: 'banner-management',
        component: BannerManagement,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

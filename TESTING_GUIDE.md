# 单元测试指南

## 测试概览

已为以下功能模块创建了完整的单元测试：

### 1. 优惠券审核 (Coupon Review)
- **后端服务测试**: `tests/services/couponService.test.ts`
- **前端Store测试**: `tests/stores/couponStore.test.ts`
- **测试用例数**: 50+

覆盖范围：
- ✅ 优惠券审批/拒绝
- ✅ 优惠券列表查询
- ✅ 优惠券创建、更新、删除
- ✅ 状态过滤和分页
- ✅ 错误处理

### 2. 轮播图上下架 (Banner Up/Down)
- **后端服务测试**: `tests/services/bannerService.test.ts`
- **前端Store测试**: `tests/stores/bannerStore.test.ts`
- **测试用例数**: 60+

覆盖范围：
- ✅ 轮播图上架/下架操作
- ✅ 轮播图审批/拒绝
- ✅ 排序顺序更新
- ✅ 批量操作
- ✅ 状态管理

### 3. 公告弹窗 (Announcement Popup)
- **后端服务测试**: `tests/services/announcementService.test.ts`
- **前端组件测试**: `tests/components/AnnouncementPopup.test.ts`
- **前端Store测试**: `tests/stores/announcementStore.test.ts`
- **测试用例数**: 80+

覆盖范围：
- ✅ 公告弹窗显示/关闭
- ✅ 队列导航（多个公告）
- ✅ 本地存储集成（防重复显示）
- ✅ 图片和按钮显示
- ✅ 公告审批/拒绝
- ✅ 用户端展示逻辑

### 4. 用户端展示 (User-side Display)
- ✅ 激活公告筛选
- ✅ 时间范围过滤
- ✅ 优先级排序
- ✅ 弹窗/横幅/通知类型区分

## 运行测试

### 运行所有测试
```bash
npm run test
```

### 运行测试并查看详细输出
```bash
npm run test:run
```

### 生成覆盖率报告
```bash
npm run test:coverage
```

## 测试文件结构

```
tests/
├── services/
│   ├── couponService.test.ts       # 优惠券服务测试
│   ├── bannerService.test.ts       # 轮播图服务测试
│   └── announcementService.test.ts # 公告服务测试
├── stores/
│   ├── couponStore.test.ts         # 优惠券Store测试
│   ├── bannerStore.test.ts         # 轮播图Store测试
│   └── announcementStore.test.ts   # 公告Store测试
└── components/
    └── AnnouncementPopup.test.ts   # 公告弹窗组件测试
```

## 测试技术栈

- **测试框架**: Vitest
- **Vue组件测试**: @vue/test-utils
- **DOM模拟**: happy-dom
- **类型支持**: TypeScript

## 测试特点

1. **全面覆盖**: 涵盖所有CRUD操作、审核流程、状态管理
2. **隔离测试**: 每个测试用例相互独立
3. **真实数据库**: 使用真实SQLite数据库进行测试
4. **Mock API**: 前端测试使用Mock API，避免网络依赖
5. **异步处理**: 正确处理Promise和async/await
6. **边界条件**: 包含空值、错误处理等边界测试

## 测试统计

- **总测试文件数**: 7
- **总测试用例数**: 176
- **所有测试通过**: ✅
- **测试执行时间**: ~1.12s

## 持续集成

建议在CI/CD流程中添加测试：
```bash
npm run test:run && npm run lint
```

## 维护指南

添加新功能时，请：
1. 在对应的test文件中添加新测试用例
2. 确保测试覆盖正常和异常情况
3. 运行 `npm run test:run` 确保所有测试通过
4. 定期运行 `npm run test:coverage` 检查覆盖率

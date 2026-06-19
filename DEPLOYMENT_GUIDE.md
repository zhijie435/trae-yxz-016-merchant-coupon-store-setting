# 门店优惠券管理系统 - 部署文档

## 1. 项目概述

门店优惠券管理系统是一个用于管理门店优惠券、公告和横幅的综合性管理平台。

### 1.1 技术栈

- **前端**: Vue 3 + Vite + TypeScript + Element Plus
- **后端**: Node.js + Express + SQLite
- **数据库**: SQLite (better-sqlite3)

### 1.2 核心功能

- 优惠券管理（创建、编辑、审核、删除）
- 公告管理（公告弹窗、公告列表）
- 横幅管理（图片上传、链接配置、城市范围）
- 审核流程（待审核 → 已通过 → 已上线 / 已拒绝）

## 2. 环境要求

### 2.1 开发环境

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **操作系统**: macOS / Windows / Linux

### 2.2 生产环境建议配置

- **CPU**: 2 核以上
- **内存**: 4GB 以上
- **磁盘**: 10GB 以上
- **带宽**: 5Mbps 以上

## 3. 部署步骤

### 3.1 安装依赖

```bash
# 安装项目依赖
npm install
```

### 3.2 开发环境启动

```bash
# 启动前后端开发服务器（并行启动）
npm run dev

# 或单独启动
npm run client:dev  # 前端开发服务器
npm run server:dev  # 后端开发服务器
```

- 前端地址: http://localhost:5173
- 后端地址: http://localhost:3000

### 3.3 生产环境构建

```bash
# 构建前端应用
npm run build

# 预览构建结果
npm run preview
```

## 4. 图片上传配置

### 4.1 图片上传方式

系统支持两种图片上传方式：

#### 方式一：本地上传（开发环境）

系统使用浏览器本地 FileReader API 处理图片上传：

```typescript
// BannerFormDialog.vue 中的实现
const handleUploadSuccess = (response: any, file: any) => {
  if (response.code === 200 && response.data?.url) {
    form.value.image_url = response.data.url;
  } else {
    // 使用 FileReader 将图片转换为 base64
    form.value.image_url = URL.createObjectURL(file.raw);
  }
};
```

#### 方式二：云存储上传（生产环境推荐）

对于生产环境，建议配置云存储服务：

**使用七牛云 OSS**

```typescript
// 创建 utils/qiniu-upload.ts
import * as qiniu from 'qiniu';

export class QiniuUploader {
  private mac: qiniu.auth.digest.Mac;
  private config: qiniu.conf.Config;
  private bucketManager: qiniu.bucket.BucketManager;

  constructor(accessKey: string, secretKey: string, bucket: string) {
    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    this.config = new qiniu.conf.Config();
    this.bucketManager = new qiniu.bucket.BucketManager(this.mac, this.config);
  }

  async uploadFile(file: File): Promise<string> {
    const formUploader = new qiniu.form UpLoader(this.config);
    const putExtra = new qiniu.form.PutExtra();

    return new Promise((resolve, reject) => {
      formUploader.putFile(
        this.getUploadToken(),
        null,
        file,
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            reject(respErr);
          } else if (respInfo.statusCode === 200) {
            resolve(`https://your-domain.com/${respBody.key}`);
          } else {
            reject(new Error(`Upload failed: ${respInfo.statusCode}`));
          }
        }
      );
    });
  }

  private getUploadToken(): string {
    const options = { scope: 'your-bucket-name' };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(this.mac);
  }
}
```

**使用阿里云 OSS**

```typescript
// 创建 utils/oss-upload.ts
import OSS from 'ali-oss';

export class AliyunUploader {
  private client: OSS;

  constructor(options: {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
  }) {
    this.client = new OSS(options);
  }

  async uploadFile(file: File): Promise<string> {
    const filename = `uploads/${Date.now()}-${file.name}`;
    const result = await this.client.put(filename, file);
    return result.url;
  }
}
```

### 4.2 配置示例（.env 文件）

```bash
# 开发环境
NODE_ENV=development
PORT=3000

# 生产环境 - 云存储配置
# 七牛云
QINIU_ACCESS_KEY=your_access_key
QINIU_SECRET_KEY=your_secret_key
QINIU_BUCKET=your_bucket_name
QINIU_DOMAIN=https://your-cdn-domain.com

# 阿里云 OSS
ALIYUN_REGION=oss-cn-hangzhou
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_BUCKET=your_bucket_name
```

### 4.3 图片规范

| 参数 | 规格要求 |
|------|----------|
| 格式 | JPG、PNG、GIF、WebP |
| 大小 | 不超过 2MB |
| 建议尺寸 | 1920x1080 (横幅) |
| 推荐宽高比 | 2:1 或 16:9 |

## 5. 审核账号配置

### 5.1 账号角色

系统定义了以下审核角色：

| 角色 | 权限 | 说明 |
|------|------|------|
| admin | 全部权限 | 管理员，拥有所有操作权限 |
| reviewer | 审核权限 | 审核员，可审核和批准内容 |
| operator | 操作权限 | 操作员，可创建和编辑内容 |

### 5.2 审核流程状态

```
草稿(draft) → 待审核(pending) → 已通过(approved) → 已上线(active)
                    ↓
                已拒绝(rejected)
```

### 5.3 审核账号配置

在 `api/app.ts` 中配置审核账号：

```typescript
// 审核账号配置
const REVIEWER_ACCOUNTS = [
  {
    username: 'reviewer1',
    password: 'secure_password_1',
    role: 'reviewer',
    permissions: ['view', 'approve', 'reject']
  },
  {
    username: 'reviewer2',
    password: 'secure_password_2',
    role: 'reviewer',
    permissions: ['view', 'approve', 'reject']
  },
  {
    username: 'admin',
    password: 'admin_secure_password',
    role: 'admin',
    permissions: ['all']
  }
];

// 审核权限中间件
export const reviewAuthMiddleware = (req, res, next) => {
  const { username, role } = req.body;

  const account = REVIEWER_ACCOUNTS.find(acc => acc.username === username);

  if (!account) {
    return res.status(401).json({
      code: 401,
      message: '审核账号不存在'
    });
  }

  if (account.role !== 'reviewer' && account.role !== 'admin') {
    return res.status(403).json({
      code: 403,
      message: '没有审核权限'
    });
  }

  req.reviewer = {
    username: account.username,
    role: account.role,
    permissions: account.permissions
  };

  next();
};

// 审核操作权限检查
export const checkReviewPermission = (action: 'approve' | 'reject') => {
  return (req, res, next) => {
    const reviewer = req.reviewer;

    if (!reviewer) {
      return res.status(401).json({
        code: 401,
        message: '请先登录'
      });
    }

    if (reviewer.role === 'admin') {
      return next();
    }

    if (reviewer.permissions.includes('all') || reviewer.permissions.includes(action)) {
      return next();
    }

    return res.status(403).json({
      code: 403,
      message: `没有${action === 'approve' ? '通过' : '拒绝'}权限`
    });
  };
};
```

### 5.4 生产环境账号安全建议

#### 使用 JWT Token

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateReviewToken = (username: string, role: string): string => {
  return jwt.sign(
    { username, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyReviewToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
```

#### 使用数据库存储账号

```typescript
// 创建 administrators 表
CREATE TABLE IF NOT EXISTS administrators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'reviewer',
  permissions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_username ON administrators(username);
```

#### 密码加密存储

```typescript
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

## 6. 验收命令

### 6.1 单元测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npx vitest run tests/services/couponService.test.ts
```

### 6.2 类型检查

```bash
# TypeScript 类型检查
npm run check
```

### 6.3 代码规范检查

```bash
# 检查代码规范
npm run lint

# 自动修复代码规范问题
npm run lint:fix
```

### 6.4 完整验收流程

```bash
#!/bin/bash
# deployment-check.sh

echo "===== 门店优惠券管理系统部署验收 ====="
echo ""

echo "1. 检查 Node.js 版本..."
node --version

echo ""
echo "2. 检查依赖安装..."
if [ -d "node_modules" ]; then
  echo "✓ 依赖已安装"
else
  echo "✗ 依赖未安装，请运行 npm install"
  exit 1
fi

echo ""
echo "3. 运行类型检查..."
npm run check
if [ $? -eq 0 ]; then
  echo "✓ 类型检查通过"
else
  echo "✗ 类型检查失败"
  exit 1
fi

echo ""
echo "4. 运行代码规范检查..."
npm run lint
if [ $? -eq 0 ]; then
  echo "✓ 代码规范检查通过"
else
  echo "✗ 代码规范检查失败"
  exit 1
fi

echo ""
echo "5. 运行单元测试..."
npm run test
if [ $? -eq 0 ]; then
  echo "✓ 单元测试通过"
else
  echo "✗ 单元测试失败"
  exit 1
fi

echo ""
echo "6. 构建生产版本..."
npm run build
if [ $? -eq 0 ]; then
  echo "✓ 构建成功"
else
  echo "✗ 构建失败"
  exit 1
fi

echo ""
echo "===== 验收完成 ====="
echo "所有检查项均已通过，系统可以部署！"
```

### 6.5 功能验收清单

#### 优惠券管理

- [ ] 创建新优惠券（填写名称、类型、面值、使用条件等）
- [ ] 编辑已有优惠券
- [ ] 删除优惠券（单个和批量）
- [ ] 搜索和筛选优惠券
- [ ] 分页查看优惠券列表

#### 公告管理

- [ ] 创建公告（标题、内容、显示时间等）
- [ ] 公告弹窗显示和关闭
- [ ] 公告列表管理
- [ ] 编辑和删除公告

#### 横幅管理

- [ ] 上传横幅图片（支持本地上传）
- [ ] 配置横幅链接（外部URL、内部页面、商品）
- [ ] 设置城市范围
- [ ] 调整显示顺序
- [ ] 预览横幅效果

#### 审核流程

- [ ] 待审核内容显示
- [ ] 审核通过操作
- [ ] 审核拒绝操作
- [ ] 审核记录查看
- [ ] 审核状态变更通知

### 6.6 API 验收测试

```bash
#!/bin/bash
# api-test.sh

BASE_URL="http://localhost:3000"

echo "===== API 接口验收测试 ====="
echo ""

echo "1. 测试获取优惠券列表..."
curl -X GET "$BASE_URL/api/coupons" | jq '.'
echo ""

echo "2. 测试创建优惠券..."
curl -X POST "$BASE_URL/api/coupons" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试优惠券",
    "type": "cash",
    "value": 10,
    "minAmount": 100,
    "totalCount": 100,
    "perUserLimit": 1,
    "startTime": "2026-06-20T00:00:00Z",
    "endTime": "2026-07-20T23:59:59Z",
    "description": "测试使用"
  }' | jq '.'
echo ""

echo "3. 测试获取公告列表..."
curl -X GET "$BASE_URL/api/announcements" | jq '.'
echo ""

echo "4. 测试获取横幅列表..."
curl -X GET "$BASE_URL/api/banners" | jq '.'
echo ""

echo "===== API 测试完成 ====="
```

### 6.7 数据库验收

```bash
# 检查数据库是否创建
ls -lh database.sqlite

# 查看数据库表结构
sqlite3 database.sqlite ".schema"

# 查看数据统计
sqlite3 database.sqlite "SELECT COUNT(*) FROM coupons;"
sqlite3 database.sqlite "SELECT COUNT(*) FROM announcements;"
sqlite3 database.sqlite "SELECT COUNT(*) FROM banners;"
```

## 7. 常见问题排查

### 7.1 图片上传失败

**问题**: 无法上传图片或上传后无法显示

**解决方案**:

1. 检查浏览器控制台是否有错误信息
2. 确认图片格式和大小是否符合要求
3. 如果使用云存储，检查 OSS/CDN 配置是否正确
4. 检查网络连接和防火墙设置

### 7.2 审核账号无法登录

**问题**: 审核账号登录失败

**解决方案**:

1. 确认账号和密码是否正确
2. 检查账号是否已激活
3. 查看服务器日志中的认证错误信息
4. 确认 JWT Token 是否过期
5. 检查数据库连接是否正常

### 7.3 审核流程卡住

**问题**: 审核状态无法变更

**解决方案**:

1. 检查数据库连接是否正常
2. 查看 API 接口是否返回正确状态码
3. 确认审核权限是否配置正确
4. 检查是否有并发操作导致的状态冲突

## 8. 联系方式

如有问题，请联系技术支持团队：

- **技术支持邮箱**: support@example.com
- **技术文档**: https://docs.example.com
- **紧急联系**: 400-xxx-xxxx

---

**文档版本**: v1.0.0
**最后更新**: 2026-06-20
**维护团队**: 门店端开发组

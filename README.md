# Twitter(X) 克隆应用

这是一个使用Vue.js和Node.js构建的Twitter(X)风格的社交媒体应用。

## 功能特点

- 用户注册和登录（用户名/密码）
- Metamask钱包登录选项
- 帖子发布和显示
- 图片上传功能
- ETH钱包余额显示
- 分页浏览
- 个人资料页面
- 响应式设计

## 技术栈

### 前端
- Vue.js 3
- Vue Router
- Vuex
- Axios
- Web3.js (用于Metamask集成)

### 后端
- Node.js
- Express.js
- MySQL
- JWT认证
- bcrypt密码加密

## 项目结构

```
groupProject/
├── frontend/                # 前端Vue.js应用
│   ├── public/              # 静态资源
│   └── src/                 # 源代码
│       ├── assets/          # 样式和图片
│       ├── components/      # Vue组件
│       ├── router/          # 路由配置
│       ├── store/           # Vuex状态管理
│       ├── utils/           # 工具函数
│       ├── views/           # 页面组件
│       ├── App.vue          # 主应用组件
│       └── main.js          # 入口文件
├── backend/                 # 后端Node.js服务
│   ├── config/              # 配置文件
│   ├── controllers/         # 控制器
│   ├── middleware/          # 中间件
│   ├── models/              # 数据模型
│   ├── routes/              # 路由
│   ├── utils/               # 工具函数
│   └── server.js            # 服务器入口
└── database/                # 数据库相关文件
    ├── schema.sql           # 数据库架构
    └── db.init.js           # 数据库初始化脚本
```

## 安装和运行

### 前提条件

- Node.js 14+
- MySQL 5.7+
- Web浏览器（建议使用Chrome或Firefox）
- Metamask浏览器扩展（可选，用于Web3登录）

### 后端设置

1. 创建MySQL数据库：

```sql
CREATE DATABASE twitter_clone;
```

2. 配置环境变量：

创建一个`.env`文件在`backend`目录下，内容如下：

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=twitter_clone
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=86400
```

3. 初始化数据库：

```bash
cd database
node db.init.js
```

4. 安装依赖并运行后端服务：

```bash
cd backend
npm install
npm start
```

服务器将在`http://localhost:3000`上运行。

### 前端设置

1. 安装依赖：

```bash
cd frontend
npm install
```

2. 运行开发服务器：

```bash
npm run serve
```

前端应用将在`http://localhost:8080`上运行。

## API端点

### 认证

- POST `/api/auth/register` - 注册新用户
- POST `/api/auth/login` - 用户登录
- POST `/api/auth/metamask/message` - 获取Metamask签名消息
- POST `/api/auth/metamask/verify` - 验证Metamask签名

### 帖子

- GET `/api/posts` - 获取所有帖子（带分页）
- GET `/api/posts/:id` - 获取单个帖子
- POST `/api/posts` - 创建新帖子（需要认证）
  - 支持multipart/form-data上传图片
- DELETE `/api/posts/:id` - 删除帖子（需要认证）

### 钱包

- GET `/api/wallet/balance/:address` - 获取ETH钱包余额

### 用户

- GET `/api/users/:id` - 获取用户信息
- GET `/api/users/me` - 获取当前用户信息（需要认证）
- GET `/api/users/:id/posts` - 获取用户的帖子

## 许可证

MIT

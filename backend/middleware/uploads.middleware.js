// uploads.middleware.js
const multer = require('multer');
const path = require('path');

// 配置文件存储
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function(req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'post-image-' + uniqueSuffix + ext);
  }
});

// 文件类型过滤
const fileFilter = (req, file, cb) => {
  // 接受的图片类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型! 仅允许JPG、JPEG、PNG和GIF图片'), false);
  }
};

// 创建上传中间件
const upload = multer({ 
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 限制为5MB
  }
});

module.exports = upload;
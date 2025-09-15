-- add_image_field.sql
-- 添加图片URL字段到帖子表
ALTER TABLE posts ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER content;
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `ocean-monitor`;
USE `ocean-monitor`;

-- 创建用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(2048) NOT NULL,
  `role` VARCHAR(20) NOT NULL
);

-- 创建水质数据表
CREATE TABLE IF NOT EXISTS `hydro_data` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `location` VARCHAR(100) NOT NULL,
  `basin` VARCHAR(100) NOT NULL,
  `section_name` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `water_temperature` FLOAT,
  `pH` FLOAT,
  `dissolved_oxygen` FLOAT,
  `conductivity` FLOAT,
  `turbidity` FLOAT,
  `permanganate_index` FLOAT,
  `ammonia_nitrogen` FLOAT,
  `total_phosphorus` FLOAT,
  `total_nitrogen` FLOAT,
  `site_condition` VARCHAR(100)
);

-- 创建鱼类数据表
CREATE TABLE IF NOT EXISTS `fish` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `species` VARCHAR(100) NOT NULL,
  `weight` FLOAT NOT NULL,
  `length1` FLOAT NOT NULL,
  `length2` FLOAT NOT NULL,
  `length3` FLOAT NOT NULL,
  `height` FLOAT NOT NULL,
  `width` FLOAT NOT NULL
);

-- 插入初始管理员账户
INSERT INTO `user` (`username`, `password_hash`, `role`)
VALUES ('admin', 'pbkdf2:sha256:150000$ImgHUxne$c9681f3af0eddee8d9db2f8b01f6a1137a61c8add04309e26676b260869f1dd2', 'admin');
-- 密码为: admin123 
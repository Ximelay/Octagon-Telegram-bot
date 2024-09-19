CREATE DATABASE octagon;
USE octagon;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  role INT DEFAULT 0
);

CREATE TABLE faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  section VARCHAR(255) NOT NULL
);

CREATE TABLE feedbacks (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(255) DEFAULT 'open',
  file_type VARCHAR(255),
  file_link TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  adminId INT NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(255) DEFAULT 'pending',
  FOREIGN KEY (adminId) REFERENCES users(id)
);
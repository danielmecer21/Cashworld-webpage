-- Cash World website database schema
-- Select your cPanel database in phpMyAdmin, then import this file.
CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  review_text VARCHAR(800) NOT NULL,
  status ENUM('pending','approved','hidden') NOT NULL DEFAULT 'pending',
  reply VARCHAR(600) NULL,
  created_at BIGINT UNSIGNED NOT NULL,
  INDEX idx_reviews_public (status, created_at),
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enquiries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  topic VARCHAR(100) NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at BIGINT UNSIGNED NOT NULL,
  INDEX idx_enquiries_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

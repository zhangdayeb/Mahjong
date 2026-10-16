CREATE TABLE IF NOT EXISTS demo_feedback (
 id CHAR(36) PRIMARY KEY, account_id CHAR(36) NOT NULL,
 request_id CHAR(36) NOT NULL, star_level TINYINT UNSIGNED NOT NULL,
 tags JSON NOT NULL,
 advice VARCHAR(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
 contact VARCHAR(320) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
 status VARCHAR(16) NOT NULL DEFAULT 'submitted',
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE(account_id,request_id), INDEX(account_id,created_at,id),
 FOREIGN KEY(account_id) REFERENCES demo_accounts(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS demo_mail (
 id CHAR(36) PRIMARY KEY, account_id CHAR(36) NOT NULL,
 category VARCHAR(12) NOT NULL DEFAULT 'system',
 title VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
 body TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 read_at TIMESTAMP(3) NULL,
 INDEX(account_id,created_at,id), INDEX(account_id,read_at),
 FOREIGN KEY(account_id) REFERENCES demo_accounts(id)
) ENGINE=InnoDB;

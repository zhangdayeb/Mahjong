CREATE TABLE IF NOT EXISTS demo_daily_rewards (
 account_id CHAR(36) NOT NULL, reward_day DATE NOT NULL, operation_id CHAR(36) NOT NULL UNIQUE,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(account_id,reward_day), FOREIGN KEY(account_id) REFERENCES demo_accounts(id),
 FOREIGN KEY(operation_id) REFERENCES demo_balance_operations(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS demo_ad_sessions (
 id CHAR(36) PRIMARY KEY, account_id CHAR(36) NOT NULL, request_id CHAR(36) NOT NULL,
 data JSON NOT NULL, expires_at TIMESTAMP(3) NOT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE(account_id,request_id), INDEX(account_id,expires_at),
 FOREIGN KEY(account_id) REFERENCES demo_accounts(id)
) ENGINE=InnoDB;

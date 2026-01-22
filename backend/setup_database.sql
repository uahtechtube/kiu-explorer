-- Drop database if exists and recreate
DROP DATABASE IF EXISTS kiu_explorer;
CREATE DATABASE kiu_explorer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE kiu_explorer;

-- Grant privileges (adjust username/password as needed)
GRANT ALL PRIVILEGES ON kiu_explorer.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

SELECT 'Database kiu_explorer created successfully!' as Status;

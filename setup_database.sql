-- ============================================================
--  Nexus Portal — XAMPP MySQL Setup Script
--  Run this in phpMyAdmin or MySQL CLI before starting Django
-- ============================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS auth_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Use the database
USE auth_db;

-- ============================================================
-- NOTE: Do NOT manually create the tables below.
-- Django's `python manage.py migrate` will create them all.
-- This file is for reference only, showing what gets created.
-- ============================================================

-- Table: auth_user (Django built-in)
-- Table: authtoken_token (DRF Simple Token)
-- Table: user_profiles (custom)

-- ============================================================
-- OPTIONAL: Create a MySQL user for the project (more secure)
-- ============================================================
-- CREATE USER 'nexus_user'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT ALL PRIVILEGES ON auth_db.* TO 'nexus_user'@'localhost';
-- FLUSH PRIVILEGES;
--
-- If you do this, update backend/core/settings.py:
--   'USER': 'nexus_user',
--   'PASSWORD': 'your_secure_password',
-- ============================================================

SELECT 'Database auth_db is ready. Run Django migrations next.' AS status;

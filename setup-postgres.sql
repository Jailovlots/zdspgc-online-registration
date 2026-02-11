-- PostgreSQL Database Setup Script for ZDSPGC Online Enrollment System
-- 
-- Instructions:
-- 1. Open pgAdmin or connect to PostgreSQL
-- 2. Run this script to create the database
-- 3. Or run from command line: psql -U postgres -f setup-postgres.sql

-- Create database
DROP DATABASE IF EXISTS zdspgc_db;
CREATE DATABASE zdspgc_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the database
\c zdspgc_db

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE zdspgc_db TO postgres;

-- Success message
SELECT 'Database zdspgc_db created successfully!' as message;

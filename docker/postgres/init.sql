-- TechEnglish Pro Database Initialization
-- This file runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'editor', 'admin');
CREATE TYPE level_code AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
CREATE TYPE module_type AS ENUM ('VOCABULARY', 'GRAMMAR', 'READING', 'LISTENING', 'SPEAKING', 'WRITING');
CREATE TYPE exercise_type AS ENUM ('MULTIPLE_CHOICE', 'FILL_BLANK', 'TRANSLATION', 'LISTENING_COMPREHENSION', 'SPEAKING_PRACTICE', 'CODE_REVIEW', 'EMAIL_WRITING', 'MEETING_SIMULATION');
CREATE TYPE progress_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MASTERED');

-- Create indexes for better performance
-- These will be created after tables are set up by Prisma migrations

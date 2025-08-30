-- Initialize database with extensions and basic setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database users (if not exists)
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'restaurant_user') THEN
      CREATE ROLE restaurant_user LOGIN PASSWORD 'restaurant_password';
   END IF;
END
$$;

-- Grant permissions
GRANT CONNECT ON DATABASE restaurant_dev TO restaurant_user;
GRANT CONNECT ON DATABASE restaurant_prod TO restaurant_user;
GRANT USAGE ON SCHEMA public TO restaurant_user;
GRANT CREATE ON SCHEMA public TO restaurant_user;
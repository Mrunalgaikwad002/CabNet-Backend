-- CabNet Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    profile_picture TEXT,
    date_of_birth DATE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    preferences_ride_type VARCHAR(20) DEFAULT 'economy' CHECK (preferences_ride_type IN ('economy', 'comfort', 'premium', 'xl')),
    preferences_payment_method VARCHAR(20) DEFAULT 'card' CHECK (preferences_payment_method IN ('card', 'cash', 'wallet')),
    preferences_notifications_email BOOLEAN DEFAULT true,
    preferences_notifications_sms BOOLEAN DEFAULT true,
    preferences_notifications_push BOOLEAN DEFAULT true,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers table
CREATE TABLE drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    profile_picture TEXT,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_make VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(50) NOT NULL,
    vehicle_year INTEGER NOT NULL,
    vehicle_color VARCHAR(30) NOT NULL,
    vehicle_plate_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(20) DEFAULT 'economy' CHECK (vehicle_type IN ('economy', 'comfort', 'premium', 'xl')),
    document_driver_license TEXT NOT NULL,
    document_vehicle_registration TEXT NOT NULL,
    document_insurance TEXT NOT NULL,
    document_background_check TEXT NOT NULL,
    location_coordinates POINT,
    location_address TEXT,
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_zip_code VARCHAR(20),
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    earnings_total DECIMAL(10,2) DEFAULT 0,
    earnings_this_week DECIMAL(10,2) DEFAULT 0,
    earnings_this_month DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('offline', 'online', 'busy', 'suspended')),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rides table
CREATE TABLE rides (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rider_id UUID REFERENCES users(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    pickup_coordinates POINT NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_city VARCHAR(100) NOT NULL,
    pickup_state VARCHAR(100) NOT NULL,
    pickup_zip_code VARCHAR(20) NOT NULL,
    pickup_instructions TEXT,
    pickup_scheduled_time TIMESTAMP WITH TIME ZONE,
    dropoff_coordinates POINT NOT NULL,
    dropoff_address TEXT NOT NULL,
    dropoff_city VARCHAR(100) NOT NULL,
    dropoff_state VARCHAR(100) NOT NULL,
    dropoff_zip_code VARCHAR(20) NOT NULL,
    dropoff_instructions TEXT,
    ride_type VARCHAR(20) DEFAULT 'economy' CHECK (ride_type IN ('economy', 'comfort', 'premium', 'xl')),
    status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled')),
    fare_base DECIMAL(8,2) NOT NULL,
    fare_distance DECIMAL(8,2) DEFAULT 0,
    fare_time DECIMAL(8,2) DEFAULT 0,
    fare_surge DECIMAL(8,2) DEFAULT 0,
    fare_total DECIMAL(8,2) NOT NULL,
    fare_currency VARCHAR(3) DEFAULT 'USD',
    distance_value INTEGER DEFAULT 0, -- in meters
    distance_text VARCHAR(50),
    duration_value INTEGER DEFAULT 0, -- in seconds
    duration_text VARCHAR(50),
    payment_method VARCHAR(20) DEFAULT 'card' CHECK (payment_method IN ('card', 'cash', 'wallet')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    payment_transaction_id VARCHAR(255),
    payment_stripe_payment_intent_id VARCHAR(255),
    rider_rating INTEGER CHECK (rider_rating >= 1 AND rider_rating <= 5),
    driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
    rider_review TEXT,
    driver_review TEXT,
    cancellation_reason TEXT,
    cancellation_cancelled_by VARCHAR(20) CHECK (cancellation_cancelled_by IN ('rider', 'driver', 'system')),
    cancellation_cancelled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    is_scheduled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES users(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    method VARCHAR(20) NOT NULL CHECK (method IN ('card', 'cash', 'wallet')),
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    stripe_refund_id VARCHAR(255),
    fee_platform DECIMAL(8,2) DEFAULT 0,
    fee_stripe DECIMAL(8,2) DEFAULT 0,
    fee_total DECIMAL(8,2) DEFAULT 0,
    breakdown_base_fare DECIMAL(8,2) NOT NULL,
    breakdown_distance_fare DECIMAL(8,2) DEFAULT 0,
    breakdown_time_fare DECIMAL(8,2) DEFAULT 0,
    breakdown_surge_fare DECIMAL(8,2) DEFAULT 0,
    breakdown_taxes DECIMAL(8,2) DEFAULT 0,
    breakdown_total DECIMAL(8,2) NOT NULL,
    refund_amount DECIMAL(8,2),
    refund_reason TEXT,
    refund_processed_at TIMESTAMP WITH TIME ZONE,
    metadata_ride_id VARCHAR(255),
    metadata_pickup_address TEXT,
    metadata_dropoff_address TEXT,
    metadata_distance VARCHAR(50),
    metadata_duration VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL, -- Can be user or driver
    reviewer_type VARCHAR(10) NOT NULL CHECK (reviewer_type IN ('User', 'Driver')),
    reviewee_id UUID NOT NULL, -- Can be user or driver
    reviewee_type VARCHAR(10) NOT NULL CHECK (reviewee_type IN ('User', 'Driver')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    tags TEXT[], -- Array of tag strings
    is_anonymous BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    helpful_users UUID[], -- Array of user IDs who found this helpful
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ride_id, reviewer_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_drivers_clerk_id ON drivers(clerk_id);
CREATE INDEX idx_drivers_email ON drivers(email);
CREATE INDEX idx_drivers_status_active ON drivers(status, is_active);
CREATE INDEX idx_drivers_location ON drivers USING GIST(location_coordinates);

CREATE INDEX idx_rides_rider_status ON rides(rider_id, status);
CREATE INDEX idx_rides_driver_status ON rides(driver_id, status);
CREATE INDEX idx_rides_status_created ON rides(status, created_at DESC);
CREATE INDEX idx_rides_pickup_location ON rides USING GIST(pickup_coordinates);
CREATE INDEX idx_rides_dropoff_location ON rides USING GIST(dropoff_coordinates);

CREATE INDEX idx_payments_ride ON payments(ride_id);
CREATE INDEX idx_payments_rider_created ON payments(rider_id, created_at DESC);
CREATE INDEX idx_payments_driver_created ON payments(driver_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);

CREATE INDEX idx_reviews_reviewee_public ON reviews(reviewee_id, is_public);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_ride_reviewer ON reviews(ride_id, reviewer_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - adjust based on your auth needs)
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Drivers can only see their own data
CREATE POLICY "Drivers can view own profile" ON drivers FOR SELECT USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Drivers can update own profile" ON drivers FOR UPDATE USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Rides: riders and drivers can see their own rides
CREATE POLICY "Users can view own rides" ON rides FOR SELECT USING (rider_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "Drivers can view own rides" ON rides FOR SELECT USING (driver_id IN (SELECT id FROM drivers WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Payments: users can see their own payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (rider_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Reviews: public reviews are visible to all
CREATE POLICY "Public reviews are viewable" ON reviews FOR SELECT USING (is_public = true);

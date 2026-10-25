-- AI Observability System: Usage Logs
-- Run this in your Supabase SQL Editor or migration runner

CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('chat', 'voice', 'system')),
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    input_size INTEGER DEFAULT 0,
    output_size INTEGER DEFAULT 0,
    latency INTEGER DEFAULT 0, -- in milliseconds
    estimated_cost DECIMAL(10, 6) DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('success', 'error')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for business-level analytics
CREATE INDEX IF NOT EXISTS idx_ai_usage_business_id ON ai_usage_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_status ON ai_usage_logs(status);

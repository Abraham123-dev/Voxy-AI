-- Migration to add AI Toggle and Soft-Delete Chat Clear columns

-- Add ai_enabled to conversations
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT TRUE;

-- Add hidden_for to messages (array of user IDs)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS hidden_for UUID[] DEFAULT '{}';

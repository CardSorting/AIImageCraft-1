-- Ultra-Aggressive Database Index Optimization
-- Implements world-class indexing strategies for sub-millisecond query performance

-- ====================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ====================

-- AI Models ultra-performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_category_featured_created 
ON ai_models(category, featured DESC, created_at DESC) 
WHERE featured = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_provider_category_name 
ON ai_models(provider, category, name) 
INCLUDE (description, image_url);

-- Covering index for model statistics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_stats_covering 
ON ai_models(id, model_id) 
INCLUDE (name, category, provider, featured, created_at, image_url);

-- ====================
-- USER INTERACTION PERFORMANCE INDEXES
-- ====================

-- User interactions with engagement filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_user_engagement 
ON user_model_interactions(user_id, engagement_level DESC, created_at DESC) 
WHERE engagement_level >= 7;

-- Model popularity calculation index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_model_popularity 
ON user_model_interactions(model_id, interaction_type, created_at DESC) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- User behavior pattern analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_patterns 
ON user_model_interactions(user_id, interaction_type, model_id, created_at) 
INCLUDE (engagement_level);

-- ====================
-- GENERATED IMAGES ULTRA-FAST RETRIEVAL
-- ====================

-- Multi-column index for image gallery queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_user_model_created 
ON generated_images(user_id, model_id, created_at DESC) 
INCLUDE (prompt, image_url, rarity_tier);

-- Rarity-based filtering index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_rarity_score 
ON generated_images(rarity_tier, rarity_score DESC, created_at DESC) 
WHERE rarity_score >= 80;

-- Model showcase index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_model_showcase 
ON generated_images(model_id, created_at DESC) 
INCLUDE (image_url, prompt, rarity_tier, file_size) 
WHERE image_url IS NOT NULL;

-- ====================
-- USER BOOKMARKS AND LIKES OPTIMIZATION
-- ====================

-- User bookmarks with model data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_user_created 
ON user_bookmarks(user_id, created_at DESC) 
INCLUDE (model_id);

-- Model popularity metrics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_likes_model_count 
ON user_likes(model_id, created_at DESC);

-- User preference analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_likes_combined 
ON user_bookmarks(user_id, model_id, created_at);

-- ====================
-- CHAT SYSTEM PERFORMANCE INDEXES
-- ====================

-- Chat sessions with message count optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_sessions_user_updated 
ON chat_sessions(user_id, updated_at DESC) 
INCLUDE (title, preview_image);

-- Chat messages with session grouping
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_session_created 
ON chat_messages(session_id, created_at DESC) 
INCLUDE (role, content);

-- Message search optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_content_search 
ON chat_messages USING gin(to_tsvector('english', content)) 
WHERE LENGTH(content) > 10;

-- ====================
-- CREDIT SYSTEM ULTRA-FAST QUERIES
-- ====================

-- Credit balances with version control
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_balances_user_version 
ON credit_balances(user_id, version DESC) 
INCLUDE (amount, last_updated);

-- Transaction history with efficient filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_user_type_created 
ON credit_transactions(user_id, type, created_at DESC) 
INCLUDE (amount, description, balance_after);

-- Credit package optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_packages_active_order 
ON credit_packages(is_active, display_order) 
WHERE is_active = 1;

-- ====================
-- AUTHENTICATION AND USER MANAGEMENT
-- ====================

-- Ultra-fast auth0 lookup
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_auth0_id_unique 
ON users(auth0_id) 
WHERE auth0_id IS NOT NULL;

-- Email-based user lookup
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique 
ON users(LOWER(email)) 
WHERE email IS NOT NULL;

-- User activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_activity 
ON users(created_at DESC, updated_at DESC) 
INCLUDE (username, email);

-- ====================
-- PARTIAL INDEXES FOR SPECIFIC USE CASES
-- ====================

-- Active featured models only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_featured_active 
ON ai_models(created_at DESC, category) 
WHERE featured = true AND provider IS NOT NULL;

-- Recent high-engagement interactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_recent_high_engagement 
ON user_model_interactions(model_id, engagement_level DESC, created_at DESC) 
WHERE created_at > NOW() - INTERVAL '7 days' AND engagement_level >= 8;

-- Premium users credit tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_balances_premium 
ON credit_balances(amount DESC, last_updated DESC) 
WHERE amount > 100;

-- ====================
-- EXPRESSION INDEXES FOR CALCULATED VALUES
-- ====================

-- User total interactions count
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interaction_counts 
ON user_model_interactions((CASE WHEN engagement_level >= 7 THEN 1 ELSE 0 END), user_id);

-- Model average rating calculation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_model_avg_engagement 
ON user_model_interactions(model_id, engagement_level) 
WHERE engagement_level IS NOT NULL;

-- ====================
-- BTREE INDEXES FOR RANGE QUERIES
-- ====================

-- Date range queries optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_images_date_range 
ON generated_images(created_at) 
WHERE created_at > NOW() - INTERVAL '90 days';

-- Credit transaction date ranges
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_date_range 
ON credit_transactions(created_at, user_id) 
WHERE created_at > NOW() - INTERVAL '1 year';

-- ====================
-- ANALYZE STATISTICS UPDATE
-- ====================

-- Update table statistics for query planner optimization
ANALYZE ai_models;
ANALYZE generated_images;
ANALYZE user_model_interactions;
ANALYZE user_bookmarks;
ANALYZE user_likes;
ANALYZE chat_sessions;
ANALYZE chat_messages;
ANALYZE credit_balances;
ANALYZE credit_transactions;
ANALYZE users;

-- ====================
-- INDEX MAINTENANCE COMMANDS
-- ====================

-- Reindex for optimal performance (run during maintenance windows)
-- REINDEX INDEX CONCURRENTLY idx_ai_models_category_featured_created;
-- REINDEX INDEX CONCURRENTLY idx_images_user_model_created;
-- REINDEX INDEX CONCURRENTLY idx_user_interactions_user_engagement;
-- Enterprise-grade database indexes for optimal query performance
-- Run these indexes to dramatically improve query speeds across the application

-- Core user table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_id_username ON users(id, username);

-- Generated images performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_images_user_id_created_at ON generated_images(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_images_model_id_created_at ON generated_images(model_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_images_rarity_tier ON generated_images(rarity_tier);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_images_composite ON generated_images(user_id, model_id, created_at DESC);

-- AI models comprehensive indexing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_model_id ON ai_models(model_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_category_rating ON ai_models(category, rating DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_featured_rating ON ai_models(featured, rating DESC) WHERE featured = 1;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_provider_rating ON ai_models(provider, rating DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_created_at ON ai_models(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_rating_likes ON ai_models(rating DESC, likes DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_name_text ON ai_models USING gin(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_models_tags ON ai_models USING gin(tags);

-- User interaction performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_user_model ON user_model_interactions(user_id, model_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_user_created ON user_model_interactions(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_model_type ON user_model_interactions(model_id, interaction_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_type_created ON user_model_interactions(interaction_type, created_at DESC);

-- User bookmarks and likes optimization
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_user_bookmarks_unique ON user_bookmarks(user_id, model_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_bookmarks_model ON user_bookmarks(model_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_bookmarks_created ON user_bookmarks(created_at DESC);

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_user_likes_unique ON user_likes(user_id, model_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_likes_model ON user_likes(model_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_likes_created ON user_likes(created_at DESC);

-- Behavior profiles for ML recommendations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_behavior_profiles_user ON user_behavior_profiles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_behavior_profiles_categories ON user_behavior_profiles USING gin(preferred_categories);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_behavior_profiles_providers ON user_behavior_profiles USING gin(preferred_providers);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_behavior_profiles_last_active ON user_behavior_profiles(last_active_at DESC);

-- Category and provider affinities
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_category_affinities_user_score ON user_category_affinities(user_id, affinity_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_category_affinities_category ON user_category_affinities(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_affinities_user_score ON user_provider_affinities(user_id, affinity_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_affinities_provider ON user_provider_affinities(provider);

-- Chat system performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_sessions_user_activity ON chat_sessions(user_id, last_activity DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at ASC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);

-- Credit system indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_user_created ON credit_transactions(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_packages_active_order ON credit_packages(is_active, display_order ASC) WHERE is_active = 1;

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_user_model_created ON generated_images(user_id, model_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_models_category_featured_rating ON ai_models(category, featured, rating DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_user_type_created ON user_model_interactions(user_id, interaction_type, created_at DESC);

-- Partial indexes for frequently filtered data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_models_featured_only ON ai_models(rating DESC, likes DESC) WHERE featured = 1;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_recent ON generated_images(created_at DESC) WHERE created_at > NOW() - INTERVAL '30 days';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_recent ON user_model_interactions(user_id, model_id) WHERE created_at > NOW() - INTERVAL '7 days';

-- Statistics and analytics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_models_stats ON ai_models(images_generated DESC, likes DESC, downloads DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_engagement ON user_model_interactions(engagement_level DESC, session_duration DESC);
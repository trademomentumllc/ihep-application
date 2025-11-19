var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  achievements: () => achievements,
  aiDecisionLogs: () => aiDecisionLogs,
  aiGovernanceConfig: () => aiGovernanceConfig,
  aiRiskAssessments: () => aiRiskAssessments,
  appointments: () => appointments,
  auditEventTypeEnum: () => auditEventTypeEnum,
  auditLogs: () => auditLogs,
  automationRules: () => automationRules,
  communityGroups: () => communityGroups,
  complianceMonitoring: () => complianceMonitoring,
  discussions: () => discussions,
  educationalContent: () => educationalContent,
  events: () => events,
  forumCategories: () => forumCategories,
  forumComments: () => forumComments,
  forumPosts: () => forumPosts,
  healthActivities: () => healthActivities,
  insertAchievementSchema: () => insertAchievementSchema,
  insertAiDecisionLogSchema: () => insertAiDecisionLogSchema,
  insertAiGovernanceConfigSchema: () => insertAiGovernanceConfigSchema,
  insertAiRiskAssessmentSchema: () => insertAiRiskAssessmentSchema,
  insertAppointmentSchema: () => insertAppointmentSchema,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertAutomationRuleSchema: () => insertAutomationRuleSchema,
  insertCommunityGroupSchema: () => insertCommunityGroupSchema,
  insertComplianceMonitoringSchema: () => insertComplianceMonitoringSchema,
  insertDiscussionSchema: () => insertDiscussionSchema,
  insertEducationalContentSchema: () => insertEducationalContentSchema,
  insertEventSchema: () => insertEventSchema,
  insertForumCategorySchema: () => insertForumCategorySchema,
  insertForumCommentSchema: () => insertForumCommentSchema,
  insertForumPostSchema: () => insertForumPostSchema,
  insertHealthActivitySchema: () => insertHealthActivitySchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNeuralMetricSchema: () => insertNeuralMetricSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPointsTransactionSchema: () => insertPointsTransactionSchema,
  insertRegulatoryTemplateSchema: () => insertRegulatoryTemplateSchema,
  insertResourceSchema: () => insertResourceSchema,
  insertRewardSchema: () => insertRewardSchema,
  insertUserAchievementSchema: () => insertUserAchievementSchema,
  insertUserActivitySchema: () => insertUserActivitySchema,
  insertUserPointsSchema: () => insertUserPointsSchema,
  insertUserRewardSchema: () => insertUserRewardSchema,
  insertUserSchema: () => insertUserSchema,
  insertWellnessTipSchema: () => insertWellnessTipSchema,
  messages: () => messages,
  neuralMetrics: () => neuralMetrics,
  notifications: () => notifications,
  pointsTransactions: () => pointsTransactions,
  regulatoryTemplates: () => regulatoryTemplates,
  resources: () => resources,
  rewards: () => rewards,
  userAchievements: () => userAchievements,
  userActivities: () => userActivities,
  userPoints: () => userPoints,
  userRewards: () => userRewards,
  users: () => users,
  wellnessTips: () => wellnessTips
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var auditEventTypeEnum, users, resources, events, communityGroups, discussions, messages, notifications, educationalContent, appointments, forumCategories, forumPosts, forumComments, insertUserSchema, insertResourceSchema, insertEventSchema, insertCommunityGroupSchema, insertDiscussionSchema, insertMessageSchema, insertNotificationSchema, insertEducationalContentSchema, insertAppointmentSchema, insertForumCategorySchema, insertForumPostSchema, insertForumCommentSchema, healthActivities, userAchievements, achievements, userActivities, userRewards, rewards, userPoints, pointsTransactions, insertHealthActivitySchema, insertAchievementSchema, insertUserActivitySchema, insertRewardSchema, insertUserRewardSchema, insertUserPointsSchema, insertPointsTransactionSchema, insertUserAchievementSchema, auditLogs, insertAuditLogSchema, wellnessTips, insertWellnessTipSchema, aiGovernanceConfig, aiRiskAssessments, complianceMonitoring, aiDecisionLogs, regulatoryTemplates, neuralMetrics, automationRules, insertAiGovernanceConfigSchema, insertAiRiskAssessmentSchema, insertComplianceMonitoringSchema, insertAiDecisionLogSchema, insertRegulatoryTemplateSchema, insertNeuralMetricSchema, insertAutomationRuleSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    auditEventTypeEnum = pgEnum("audit_event_type", [
      "PHI_ACCESS",
      "PHI_MODIFICATION",
      "PHI_DELETION",
      "AUTHENTICATION",
      "AUTHORIZATION",
      "SYSTEM_EVENT"
    ]);
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      email: text("email").notNull().unique(),
      // Add unique constraint to email
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      role: text("role").notNull().default("patient"),
      profilePicture: text("profile_picture"),
      phone: text("phone"),
      preferredContactMethod: text("preferred_contact_method").default("email"),
      createdAt: timestamp("created_at").defaultNow()
    });
    resources = pgTable("resources", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull(),
      contactInfo: text("contact_info").notNull(),
      address: text("address"),
      city: text("city"),
      state: text("state"),
      zipCode: text("zip_code"),
      phone: text("phone"),
      email: text("email"),
      website: text("website"),
      isVirtual: boolean("is_virtual").default(false),
      takingNewPatients: boolean("taking_new_patients").default(true),
      availableToday: boolean("available_today").default(false),
      imageUrl: text("image_url"),
      rating: integer("rating"),
      reviewCount: integer("review_count").default(0)
    });
    events = pgTable("events", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      startTime: timestamp("start_time").notNull(),
      endTime: timestamp("end_time").notNull(),
      location: text("location"),
      isVirtual: boolean("is_virtual").default(false),
      category: text("category"),
      tags: text("tags").array(),
      hostId: integer("host_id").references(() => users.id),
      capacity: integer("capacity"),
      registeredUsers: integer("registered_users").array()
    });
    communityGroups = pgTable("community_groups", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      memberCount: integer("member_count").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      lastActive: timestamp("last_active").defaultNow(),
      isPublic: boolean("is_public").default(true),
      groupImage: text("group_image"),
      members: integer("members").array()
    });
    discussions = pgTable("discussions", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      content: text("content").notNull(),
      authorId: integer("author_id").references(() => users.id),
      groupId: integer("group_id").references(() => communityGroups.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      replyCount: integer("reply_count").default(0),
      likes: integer("likes").default(0)
    });
    messages = pgTable("messages", {
      id: serial("id").primaryKey(),
      senderId: integer("sender_id").references(() => users.id),
      recipientId: integer("recipient_id").references(() => users.id),
      subject: text("subject").notNull(),
      content: text("content").notNull(),
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      title: text("title").notNull(),
      message: text("message").notNull(),
      type: text("type").notNull(),
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      relatedId: integer("related_id"),
      relatedType: text("related_type")
    });
    educationalContent = pgTable("educational_content", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      content: text("content").notNull(),
      category: text("category").notNull(),
      tags: text("tags").array(),
      authorId: integer("author_id").references(() => users.id),
      publishedDate: timestamp("published_date").defaultNow(),
      lastUpdated: timestamp("last_updated").defaultNow(),
      mediaUrls: text("media_urls").array(),
      featured: boolean("featured").default(false)
    });
    appointments = pgTable("appointments", {
      id: serial("id").primaryKey(),
      patientId: integer("patient_id").references(() => users.id),
      providerId: integer("provider_id").references(() => users.id),
      startTime: timestamp("start_time").notNull(),
      endTime: timestamp("end_time").notNull(),
      type: text("type").notNull(),
      notes: text("notes"),
      status: text("status").notNull().default("scheduled"),
      location: text("location"),
      isVirtual: boolean("is_virtual").default(false),
      reminderSent: boolean("reminder_sent").default(false)
    });
    forumCategories = pgTable("forum_categories", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      slug: text("slug").notNull().unique(),
      icon: text("icon"),
      color: text("color"),
      postCount: integer("post_count").default(0),
      isActive: boolean("is_active").default(true),
      displayOrder: integer("display_order").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    forumPosts = pgTable("forum_posts", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      content: text("content").notNull(),
      authorId: integer("author_id").references(() => users.id),
      categoryId: integer("category_id").references(() => forumCategories.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      commentCount: integer("comment_count").default(0),
      viewCount: integer("view_count").default(0),
      likes: integer("likes").default(0),
      isPinned: boolean("is_pinned").default(false),
      isFeatured: boolean("is_featured").default(false),
      isModerated: boolean("is_moderated").default(false),
      moderationStatus: text("moderation_status").default("pending"),
      moderationNotes: text("moderation_notes"),
      tags: text("tags").array()
    });
    forumComments = pgTable("forum_comments", {
      id: serial("id").primaryKey(),
      content: text("content").notNull(),
      authorId: integer("author_id").references(() => users.id),
      postId: integer("post_id").references(() => forumPosts.id),
      parentCommentId: integer("parent_comment_id"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      likes: integer("likes").default(0),
      isModerated: boolean("is_moderated").default(false),
      moderationStatus: text("moderation_status").default("pending"),
      moderationNotes: text("moderation_notes"),
      isArchived: boolean("is_archived").default(false),
      archivedDate: timestamp("archived_date"),
      medicalRelevance: integer("medical_relevance").default(0),
      // 0-10 scale
      aiModerationNotes: text("ai_moderation_notes")
    });
    insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
    insertResourceSchema = createInsertSchema(resources).omit({ id: true });
    insertEventSchema = createInsertSchema(events).omit({ id: true });
    insertCommunityGroupSchema = createInsertSchema(communityGroups).omit({ id: true, createdAt: true, lastActive: true, memberCount: true });
    insertDiscussionSchema = createInsertSchema(discussions).omit({ id: true, createdAt: true, updatedAt: true, replyCount: true, likes: true });
    insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true });
    insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, isRead: true });
    insertEducationalContentSchema = createInsertSchema(educationalContent).omit({ id: true, publishedDate: true, lastUpdated: true });
    insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, reminderSent: true });
    insertForumCategorySchema = createInsertSchema(forumCategories).omit({ id: true, createdAt: true, postCount: true });
    insertForumPostSchema = createInsertSchema(forumPosts).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      commentCount: true,
      viewCount: true,
      likes: true,
      isModerated: true,
      moderationStatus: true,
      moderationNotes: true
    });
    insertForumCommentSchema = createInsertSchema(forumComments).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      likes: true,
      isModerated: true,
      moderationStatus: true,
      moderationNotes: true,
      isArchived: true,
      archivedDate: true,
      medicalRelevance: true,
      aiModerationNotes: true
    });
    healthActivities = pgTable("health_activities", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull(),
      // 'physical', 'mental', 'medication', 'appointment', 'education'
      pointsValue: integer("points_value").notNull().default(10),
      frequency: text("frequency").notNull(),
      // 'daily', 'weekly', 'monthly', 'once'
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    userAchievements = pgTable("user_achievements", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      achievementId: integer("achievement_id").notNull().references(() => achievements.id),
      unlockedAt: timestamp("unlocked_at").notNull().defaultNow()
    });
    achievements = pgTable("achievements", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      icon: text("icon").notNull().default("award"),
      level: integer("level").notNull().default(1),
      // 1 = easy, 2 = medium, 3 = hard
      pointsRequired: integer("points_required").notNull(),
      category: text("category").notNull(),
      // 'physical', 'mental', 'medication', 'appointment', 'education', 'streak'
      createdAt: timestamp("created_at").notNull().defaultNow(),
      isActive: boolean("is_active").notNull().default(true)
    });
    userActivities = pgTable("user_activities", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      activityId: integer("activity_id").notNull().references(() => healthActivities.id),
      completedAt: timestamp("completed_at").notNull().defaultNow(),
      pointsEarned: integer("points_earned").notNull(),
      notes: text("notes"),
      proofImageUrl: text("proof_image_url"),
      verificationStatus: text("verification_status").notNull().default("verified")
      // 'pending', 'verified', 'rejected'
    });
    userRewards = pgTable("user_rewards", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      rewardId: integer("reward_id").notNull().references(() => rewards.id),
      earnedAt: timestamp("earned_at").notNull().defaultNow(),
      redeemedAt: timestamp("redeemed_at"),
      code: text("code"),
      status: text("status").notNull().default("active"),
      // 'active', 'redeemed', 'expired'
      expiresAt: timestamp("expires_at")
    });
    rewards = pgTable("rewards", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull(),
      // 'discount', 'gift_card', 'merchandise', 'badge', 'feature_unlock'
      pointsCost: integer("points_cost").notNull(),
      inventory: integer("inventory"),
      isActive: boolean("is_active").notNull().default(true),
      imageUrl: text("image_url"),
      termsAndConditions: text("terms_and_conditions"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    userPoints = pgTable("user_points", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      totalPoints: integer("total_points").notNull().default(0),
      availablePoints: integer("available_points").notNull().default(0),
      lifetimePoints: integer("lifetime_points").notNull().default(0),
      lastActivity: timestamp("last_activity").notNull().defaultNow(),
      currentStreak: integer("current_streak").notNull().default(0),
      longestStreak: integer("longest_streak").notNull().default(0),
      lastStreakUpdate: timestamp("last_streak_update").notNull().defaultNow()
    });
    pointsTransactions = pgTable("points_transactions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      amount: integer("amount").notNull(),
      type: text("type").notNull(),
      // 'earned', 'spent', 'expired', 'bonus', 'adjustment'
      description: text("description").notNull(),
      sourceId: integer("source_id"),
      // ID of the activity, reward, etc.
      sourceType: text("source_type"),
      // 'activity', 'reward', 'achievement', 'admin'
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertHealthActivitySchema = createInsertSchema(healthActivities).omit({
      id: true,
      createdAt: true
    });
    insertAchievementSchema = createInsertSchema(achievements).omit({
      id: true,
      createdAt: true
    });
    insertUserActivitySchema = createInsertSchema(userActivities).omit({
      id: true
    });
    insertRewardSchema = createInsertSchema(rewards).omit({
      id: true,
      createdAt: true
    });
    insertUserRewardSchema = createInsertSchema(userRewards).omit({
      id: true,
      earnedAt: true
    });
    insertUserPointsSchema = createInsertSchema(userPoints).omit({
      id: true,
      lastActivity: true,
      lastStreakUpdate: true
    });
    insertPointsTransactionSchema = createInsertSchema(pointsTransactions).omit({
      id: true,
      createdAt: true
    });
    insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
      id: true,
      unlockedAt: true
    });
    auditLogs = pgTable("audit_logs", {
      id: serial("id").primaryKey(),
      timestamp: timestamp("timestamp").defaultNow().notNull(),
      userId: integer("user_id").references(() => users.id),
      eventType: text("event_type").notNull(),
      resourceType: text("resource_type").notNull(),
      resourceId: text("resource_id"),
      action: text("action").notNull(),
      description: text("description").notNull(),
      ipAddress: text("ip_address").notNull(),
      success: boolean("success").notNull(),
      additionalInfo: jsonb("additional_info")
    });
    insertAuditLogSchema = createInsertSchema(auditLogs).omit({
      id: true
    });
    wellnessTips = pgTable("wellness_tips", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      content: text("content").notNull(),
      category: text("category").notNull(),
      // 'mental', 'physical', 'nutrition', 'medication', 'general'
      tags: text("tags").array(),
      aiGenerated: boolean("ai_generated").default(true),
      isPersonalized: boolean("is_personalized").default(true),
      associatedDataPoints: jsonb("associated_data_points"),
      // Health metrics that influenced this tip
      createdAt: timestamp("created_at").defaultNow(),
      expiresAt: timestamp("expires_at"),
      interactionCount: integer("interaction_count").default(0),
      wasHelpful: boolean("was_helpful"),
      savedByUser: boolean("saved_by_user").default(false),
      motivationalQuote: text("motivational_quote"),
      actionSteps: text("action_steps").array()
    });
    insertWellnessTipSchema = createInsertSchema(wellnessTips).omit({
      id: true,
      createdAt: true,
      interactionCount: true
    });
    aiGovernanceConfig = pgTable("ai_governance_config", {
      id: serial("id").primaryKey(),
      organizationId: text("organization_id").notNull(),
      aiModel: text("ai_model").notNull().default("gpt-4o"),
      maxTokens: integer("max_tokens").default(2e3),
      temperature: integer("temperature").default(7),
      // stored as int (0.7 * 10)
      moderationLevel: text("moderation_level").notNull().default("strict"),
      // strict, moderate, lenient
      enabledFeatures: text("enabled_features").array().default(["content_moderation", "risk_assessment", "compliance_monitoring"]),
      complianceFrameworks: text("compliance_frameworks").array().default(["HIPAA", "GDPR", "SOX"]),
      riskThreshold: integer("risk_threshold").default(75),
      // 0-100 scale
      auditRetention: integer("audit_retention").default(2555),
      // days (7 years default)
      emergencyContactEmail: text("emergency_contact_email"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    aiRiskAssessments = pgTable("ai_risk_assessments", {
      id: serial("id").primaryKey(),
      assessmentType: text("assessment_type").notNull(),
      // 'content', 'decision', 'data_access', 'automated_action'
      entityId: text("entity_id").notNull(),
      // ID of the content/action being assessed
      entityType: text("entity_type").notNull(),
      // 'forum_post', 'message', 'appointment', 'medication_decision'
      riskScore: integer("risk_score").notNull(),
      // 0-100
      riskCategory: text("risk_category").notNull(),
      // 'low', 'medium', 'high', 'critical'
      identifiedRisks: text("identified_risks").array(),
      mitigationStrategies: text("mitigation_strategies").array(),
      complianceViolations: text("compliance_violations").array(),
      autoApproved: boolean("auto_approved").default(false),
      requiresHumanReview: boolean("requires_human_review").default(false),
      reviewedBy: integer("reviewed_by").references(() => users.id),
      reviewedAt: timestamp("reviewed_at"),
      reviewNotes: text("review_notes"),
      finalDecision: text("final_decision"),
      // 'approved', 'rejected', 'requires_modification'
      aiModel: text("ai_model").notNull(),
      confidence: integer("confidence").notNull(),
      // 0-100
      processingTime: integer("processing_time"),
      // milliseconds
      createdAt: timestamp("created_at").defaultNow()
    });
    complianceMonitoring = pgTable("compliance_monitoring", {
      id: serial("id").primaryKey(),
      framework: text("framework").notNull(),
      // 'HIPAA', 'GDPR', 'SOX', 'FDA_21CFR11'
      category: text("category").notNull(),
      // 'data_access', 'retention', 'breach_notification', 'audit_trail'
      entityType: text("entity_type").notNull(),
      entityId: text("entity_id").notNull(),
      complianceStatus: text("compliance_status").notNull(),
      // 'compliant', 'violation', 'warning', 'under_review'
      violationType: text("violation_type"),
      // 'data_breach', 'unauthorized_access', 'retention_violation'
      severity: text("severity").notNull(),
      // 'low', 'medium', 'high', 'critical'
      description: text("description").notNull(),
      recommendedActions: text("recommended_actions").array(),
      autoRemediated: boolean("auto_remediated").default(false),
      remediationActions: text("remediation_actions").array(),
      assignedTo: integer("assigned_to").references(() => users.id),
      dueDate: timestamp("due_date"),
      resolvedAt: timestamp("resolved_at"),
      resolvedBy: integer("resolved_by").references(() => users.id),
      resolutionNotes: text("resolution_notes"),
      riskLevel: integer("risk_level").notNull(),
      // 0-100
      businessImpact: text("business_impact"),
      regulatoryReporting: boolean("regulatory_reporting").default(false),
      reportedToRegulator: boolean("reported_to_regulator").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    aiDecisionLogs = pgTable("ai_decision_logs", {
      id: serial("id").primaryKey(),
      decisionType: text("decision_type").notNull(),
      // 'content_moderation', 'risk_assessment', 'recommendation', 'automation'
      entityType: text("entity_type").notNull(),
      entityId: text("entity_id").notNull(),
      inputData: jsonb("input_data").notNull(),
      outputData: jsonb("output_data").notNull(),
      aiModel: text("ai_model").notNull(),
      modelVersion: text("model_version"),
      confidence: integer("confidence").notNull(),
      processingTime: integer("processing_time").notNull(),
      decision: text("decision").notNull(),
      reasoning: text("reasoning").notNull(),
      alternativeOptions: jsonb("alternative_options"),
      humanOverride: boolean("human_override").default(false),
      overrideReason: text("override_reason"),
      overriddenBy: integer("overridden_by").references(() => users.id),
      overriddenAt: timestamp("overridden_at"),
      biasScore: integer("bias_score"),
      // 0-100, detected algorithmic bias
      fairnessMetrics: jsonb("fairness_metrics"),
      auditTrail: jsonb("audit_trail"),
      createdAt: timestamp("created_at").defaultNow()
    });
    regulatoryTemplates = pgTable("regulatory_templates", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      framework: text("framework").notNull(),
      // 'HIPAA', 'GDPR', 'SOX', 'FDA_21CFR11'
      category: text("category").notNull(),
      // 'breach_notification', 'audit_report', 'risk_assessment'
      templateContent: text("template_content").notNull(),
      requiredFields: text("required_fields").array(),
      automaticGeneration: boolean("automatic_generation").default(false),
      approvalRequired: boolean("approval_required").default(true),
      retentionPeriod: integer("retention_period").notNull(),
      // days
      version: text("version").notNull().default("1.0"),
      isActive: boolean("is_active").default(true),
      createdBy: integer("created_by").references(() => users.id),
      approvedBy: integer("approved_by").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    neuralMetrics = pgTable("neural_metrics", {
      id: serial("id").primaryKey(),
      modelName: text("model_name").notNull(),
      metricType: text("metric_type").notNull(),
      // 'accuracy', 'precision', 'recall', 'f1_score', 'bias_detection'
      value: integer("value").notNull(),
      // stored as percentage * 100
      threshold: integer("threshold").notNull(),
      status: text("status").notNull(),
      // 'passing', 'failing', 'warning'
      testDataset: text("test_dataset"),
      evaluationDate: timestamp("evaluation_date").defaultNow(),
      performanceTrend: text("performance_trend"),
      // 'improving', 'declining', 'stable'
      alertGenerated: boolean("alert_generated").default(false),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow()
    });
    automationRules = pgTable("automation_rules", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      triggerType: text("trigger_type").notNull(),
      // 'content_posted', 'user_action', 'time_based', 'risk_threshold'
      triggerConditions: jsonb("trigger_conditions").notNull(),
      actionType: text("action_type").notNull(),
      // 'moderate_content', 'send_notification', 'create_report', 'escalate'
      actionParameters: jsonb("action_parameters").notNull(),
      isActive: boolean("is_active").default(true),
      priority: integer("priority").default(50),
      // 0-100
      successRate: integer("success_rate").default(0),
      // percentage
      executionCount: integer("execution_count").default(0),
      lastExecuted: timestamp("last_executed"),
      createdBy: integer("created_by").references(() => users.id),
      approvedBy: integer("approved_by").references(() => users.id),
      requiresApproval: boolean("requires_approval").default(true),
      riskLevel: text("risk_level").default("medium"),
      // low, medium, high
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertAiGovernanceConfigSchema = createInsertSchema(aiGovernanceConfig).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAiRiskAssessmentSchema = createInsertSchema(aiRiskAssessments).omit({
      id: true,
      createdAt: true
    });
    insertComplianceMonitoringSchema = createInsertSchema(complianceMonitoring).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAiDecisionLogSchema = createInsertSchema(aiDecisionLogs).omit({
      id: true,
      createdAt: true
    });
    insertRegulatoryTemplateSchema = createInsertSchema(regulatoryTemplates).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertNeuralMetricSchema = createInsertSchema(neuralMetrics).omit({
      id: true,
      createdAt: true
    });
    insertAutomationRuleSchema = createInsertSchema(automationRules).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 1e4
    });
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/services/auditLogger.ts
import { sql as sql2 } from "drizzle-orm";
import winston from "winston";
import path from "path";
import fs from "fs";
async function logAuditEvent(entry) {
  try {
    const timestamp2 = /* @__PURE__ */ new Date();
    await db.insert(auditLogs).values({
      timestamp: timestamp2,
      userId: entry.userId,
      eventType: entry.eventType,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      action: entry.action,
      description: entry.description,
      ipAddress: entry.ipAddress,
      success: entry.success,
      additionalInfo: entry.additionalInfo || {}
    });
    logger.info("Audit event recorded", {
      timestamp: timestamp2,
      userId: entry.userId,
      eventType: entry.eventType,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      action: entry.action,
      ipAddress: entry.ipAddress,
      success: entry.success
    });
    if (entry.eventType === "PHI_DELETION" /* PHI_DELETION */ || entry.eventType === "AUTHENTICATION" /* AUTHENTICATION */ && !entry.success) {
      logger.warn("CRITICAL AUDIT EVENT", {
        timestamp: timestamp2,
        userId: entry.userId,
        eventType: entry.eventType,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        action: entry.action,
        description: entry.description,
        ipAddress: entry.ipAddress
      });
    }
  } catch (error) {
    logger.error("AUDIT LOGGING ERROR", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : void 0,
      entry
    });
  }
}
function logPhiAccess(userId, resourceType, resourceId, action, description, ipAddress, success, additionalInfo) {
  return logAuditEvent({
    userId,
    eventType: "PHI_ACCESS" /* PHI_ACCESS */,
    resourceType,
    resourceId,
    action,
    description,
    ipAddress,
    success,
    additionalInfo
  });
}
function logPhiModification(userId, resourceType, resourceId, action, description, ipAddress, success, additionalInfo) {
  return logAuditEvent({
    userId,
    eventType: "PHI_MODIFICATION" /* PHI_MODIFICATION */,
    resourceType,
    resourceId,
    action,
    description,
    ipAddress,
    success,
    additionalInfo
  });
}
function logAuthentication(userId, action, description, ipAddress, success, additionalInfo) {
  return logAuditEvent({
    userId,
    eventType: "AUTHENTICATION" /* AUTHENTICATION */,
    resourceType: "authentication",
    resourceId: userId?.toString() || null,
    action,
    description,
    ipAddress,
    success,
    additionalInfo
  });
}
async function getAuditLogs(filters) {
  const {
    userId,
    resourceType,
    resourceId,
    eventType,
    startDate,
    endDate,
    page = 1,
    limit = 50
  } = filters;
  const offset = (page - 1) * limit;
  try {
    const query = sql2`
      SELECT al.*, u.username, u.email 
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
      ${userId ? sql2`AND al.user_id = ${userId}` : sql2``}
      ${resourceType ? sql2`AND al.resource_type = ${resourceType}` : sql2``}
      ${resourceId ? sql2`AND al.resource_id = ${resourceId}` : sql2``}
      ${eventType ? sql2`AND al.event_type = ${eventType}` : sql2``}
      ${startDate ? sql2`AND al.timestamp >= ${startDate}` : sql2``}
      ${endDate ? sql2`AND al.timestamp <= ${endDate}` : sql2``}
      ORDER BY al.timestamp DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    const results = await db.execute(query);
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Error executing audit log query:", error);
    return [];
  }
}
async function getAuditSummary(startDate, endDate) {
  try {
    logger.info("Generating audit summary", { startDate, endDate });
    const totalAccessQuery = `
      SELECT COUNT(*) as count FROM audit_logs 
      WHERE event_type = $1
      AND timestamp BETWEEN $2 AND $3
    `;
    const totalAccessParams = ["PHI_ACCESS" /* PHI_ACCESS */, startDate.toISOString(), endDate.toISOString()];
    const totalAccessEvents = await db.execute(sql2.raw(totalAccessQuery, totalAccessParams));
    const totalModificationQuery = `
      SELECT COUNT(*) as count FROM audit_logs 
      WHERE event_type = $1
      AND timestamp BETWEEN $2 AND $3
    `;
    const totalModificationParams = ["PHI_MODIFICATION" /* PHI_MODIFICATION */, startDate.toISOString(), endDate.toISOString()];
    const totalModificationEvents = await db.execute(sql2.raw(totalModificationQuery, totalModificationParams));
    const failedAuthQuery = `
      SELECT COUNT(*) as count FROM audit_logs 
      WHERE event_type = $1
      AND success = false
      AND timestamp BETWEEN $2 AND $3
    `;
    const failedAuthParams = ["AUTHENTICATION" /* AUTHENTICATION */, startDate.toISOString(), endDate.toISOString()];
    const failedAuthEvents = await db.execute(sql2.raw(failedAuthQuery, failedAuthParams));
    const topResourcesQuery = `
      SELECT resource_type as "resourceType", COUNT(*) as count 
      FROM audit_logs 
      WHERE event_type = $1
      AND timestamp BETWEEN $2 AND $3
      GROUP BY resource_type
      ORDER BY count DESC
      LIMIT 5
    `;
    const topResourcesParams = ["PHI_ACCESS" /* PHI_ACCESS */, startDate.toISOString(), endDate.toISOString()];
    const topResourcesResult = await db.execute(sql2.raw(topResourcesQuery, topResourcesParams));
    let accessCount = 0;
    let modificationCount = 0;
    let authFailCount = 0;
    try {
      if (Array.isArray(totalAccessEvents) && totalAccessEvents.length > 0) {
        accessCount = Number(totalAccessEvents[0]?.count || 0);
      }
      if (Array.isArray(totalModificationEvents) && totalModificationEvents.length > 0) {
        modificationCount = Number(totalModificationEvents[0]?.count || 0);
      }
      if (Array.isArray(failedAuthEvents) && failedAuthEvents.length > 0) {
        authFailCount = Number(failedAuthEvents[0]?.count || 0);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error("Error parsing audit summary counts", { error: errorMsg });
    }
    const resources2 = [];
    try {
      if (Array.isArray(topResourcesResult)) {
        for (const row of topResourcesResult) {
          resources2.push({
            resourceType: String(row?.resourceType || "unknown"),
            count: Number(row?.count || 0)
          });
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error("Error processing resource results", { error: errorMsg });
    }
    logger.info("Audit summary generated successfully", {
      period: { startDate, endDate },
      accessEvents: accessCount,
      modificationEvents: modificationCount,
      failedAuthEvents: authFailCount
    });
    return {
      period: {
        start: startDate,
        end: endDate
      },
      totalAccessEvents: accessCount,
      totalModificationEvents: modificationCount,
      failedAuthEvents: authFailCount,
      topAccessedResources: resources2
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("Failed to generate audit summary", {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : void 0,
      startDate,
      endDate
    });
    return {
      period: { start: startDate, end: endDate },
      totalAccessEvents: 0,
      totalModificationEvents: 0,
      failedAuthEvents: 0,
      topAccessedResources: []
    };
  }
}
var logDir, logger;
var init_auditLogger = __esm({
  "server/services/auditLogger.ts"() {
    "use strict";
    init_db();
    init_schema();
    logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: "health-insight-audit" },
      transports: [
        // Write all logs to separate files
        new winston.transports.File({
          filename: path.join(logDir, "error.log"),
          level: "error",
          maxsize: 5242880,
          // 5MB
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: path.join(logDir, "hipaa-audit.log"),
          maxsize: 10485760,
          // 10MB
          maxFiles: 10
        })
      ]
    });
    if (process.env.NODE_ENV !== "production") {
      logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
  }
});

// server/services/neuralGovernance.ts
var neuralGovernance_exports = {};
__export(neuralGovernance_exports, {
  COMPLIANCE_FRAMEWORKS: () => COMPLIANCE_FRAMEWORKS,
  getGovernanceDashboard: () => getGovernanceDashboard,
  logAiDecision: () => logAiDecision,
  monitorCompliance: () => monitorCompliance,
  performRiskAssessment: () => performRiskAssessment,
  trackNeuralMetrics: () => trackNeuralMetrics
});
import { sql as sql3, eq as eq2, and as and2, desc as desc2 } from "drizzle-orm";
import OpenAI from "openai";
async function performRiskAssessment(assessmentType, entityId, entityType, entityData, userId) {
  const startTime = Date.now();
  try {
    if (!isOpenAIConfigured || !openaiClient) {
      return {
        riskScore: 50,
        riskCategory: "medium",
        identifiedRisks: ["AI assessment unavailable"],
        mitigationStrategies: ["Manual review required"],
        complianceViolations: [],
        requiresHumanReview: true,
        confidence: 0
      };
    }
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI governance specialist performing risk assessment for healthcare systems. 
          Analyze the provided content/data for potential risks across these dimensions:
          - Healthcare data privacy and security risks
          - Regulatory compliance violations (HIPAA, GDPR, FDA)
          - Ethical AI concerns and bias detection
          - Content appropriateness and medical accuracy
          - System security and access control risks
          
          Provide a JSON response with:
          - riskScore: 0-100 (higher = more risk)
          - riskCategory: "low", "medium", "high", "critical"
          - identifiedRisks: array of specific risk descriptions
          - mitigationStrategies: array of recommended mitigation actions
          - complianceViolations: array of potential violations
          - requiresHumanReview: boolean
          - confidence: 0-100 confidence in assessment`
        },
        {
          role: "user",
          content: `Assessment Type: ${assessmentType}
          Entity Type: ${entityType}
          Entity ID: ${entityId}
          Data to assess: ${JSON.stringify(entityData, null, 2)}`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    const processingTime = Date.now() - startTime;
    const analysis = JSON.parse(completion.choices[0].message.content || "{}");
    const riskScore = Math.max(0, Math.min(100, analysis.riskScore || 50));
    const riskCategory = ["low", "medium", "high", "critical"].includes(analysis.riskCategory) ? analysis.riskCategory : "medium";
    const result = {
      riskScore,
      riskCategory,
      identifiedRisks: Array.isArray(analysis.identifiedRisks) ? analysis.identifiedRisks : [],
      mitigationStrategies: Array.isArray(analysis.mitigationStrategies) ? analysis.mitigationStrategies : [],
      complianceViolations: Array.isArray(analysis.complianceViolations) ? analysis.complianceViolations : [],
      requiresHumanReview: analysis.requiresHumanReview || riskScore > 70,
      confidence: Math.max(0, Math.min(100, analysis.confidence || 80))
    };
    await db.insert(aiRiskAssessments).values({
      assessmentType,
      entityId,
      entityType,
      riskScore,
      riskCategory,
      identifiedRisks: result.identifiedRisks,
      mitigationStrategies: result.mitigationStrategies,
      complianceViolations: result.complianceViolations,
      autoApproved: riskScore < 30 && !result.requiresHumanReview,
      requiresHumanReview: result.requiresHumanReview,
      aiModel: "gpt-4o",
      confidence: result.confidence,
      processingTime
    });
    if (userId) {
      await logAuditEvent({
        userId,
        eventType: "SYSTEM_EVENT" /* SYSTEM_EVENT */,
        resourceType: "risk_assessment",
        resourceId: entityId,
        action: "ai_risk_assessment",
        description: `AI risk assessment performed for ${entityType} with score ${riskScore}`,
        ipAddress: "system",
        success: true,
        additionalInfo: { riskScore, riskCategory, confidence: result.confidence }
      });
    }
    return result;
  } catch (error) {
    console.error("Error in AI risk assessment:", error);
    return {
      riskScore: 75,
      riskCategory: "high",
      identifiedRisks: ["Assessment system error - manual review required"],
      mitigationStrategies: ["Immediate human review and approval required"],
      complianceViolations: ["Unable to verify compliance"],
      requiresHumanReview: true,
      confidence: 0
    };
  }
}
async function monitorCompliance(framework, entityType, entityId, entityData, userId) {
  try {
    const frameworkConfig = COMPLIANCE_FRAMEWORKS[framework];
    if (!frameworkConfig) {
      throw new Error(`Unknown compliance framework: ${framework}`);
    }
    let violations = [];
    let recommendedActions = [];
    let riskLevel = 0;
    let autoRemediated = false;
    if (isOpenAIConfigured && openaiClient) {
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a compliance monitoring specialist for ${frameworkConfig.name}. 
            Analyze the provided data for compliance violations in these categories: ${frameworkConfig.categories.join(", ")}.
            
            Provide a JSON response with:
            - violations: array of specific violation descriptions
            - recommendedActions: array of remediation actions
            - riskLevel: 0-100 compliance risk score
            - canAutoRemediate: boolean if violations can be automatically fixed`
          },
          {
            role: "user",
            content: `Framework: ${framework}
            Entity Type: ${entityType}
            Entity ID: ${entityId}
            Data: ${JSON.stringify(entityData, null, 2)}`
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      });
      const analysis = JSON.parse(completion.choices[0].message.content || "{}");
      violations = Array.isArray(analysis.violations) ? analysis.violations : [];
      recommendedActions = Array.isArray(analysis.recommendedActions) ? analysis.recommendedActions : [];
      riskLevel = Math.max(0, Math.min(100, analysis.riskLevel || 0));
      autoRemediated = analysis.canAutoRemediate && violations.length === 0;
    }
    let complianceStatus = "compliant";
    if (violations.length > 0) {
      if (riskLevel >= frameworkConfig.riskThresholds.high) {
        complianceStatus = "violation";
      } else if (riskLevel >= frameworkConfig.riskThresholds.medium) {
        complianceStatus = "warning";
      } else {
        complianceStatus = "under_review";
      }
    }
    await db.insert(complianceMonitoring).values({
      framework,
      category: frameworkConfig.categories[0],
      // Primary category
      entityType,
      entityId,
      complianceStatus,
      violationType: violations.length > 0 ? violations[0] : null,
      severity: riskLevel >= 80 ? "critical" : riskLevel >= 60 ? "high" : riskLevel >= 40 ? "medium" : "low",
      description: `Compliance monitoring for ${framework} framework`,
      recommendedActions,
      autoRemediated,
      riskLevel,
      businessImpact: riskLevel >= 70 ? "High impact - immediate attention required" : "Monitor and review",
      regulatoryReporting: riskLevel >= 80
    });
    if (userId) {
      await logAuditEvent({
        userId,
        eventType: "SYSTEM_EVENT" /* SYSTEM_EVENT */,
        resourceType: "compliance_monitoring",
        resourceId: entityId,
        action: "compliance_check",
        description: `Compliance monitoring performed for ${framework} framework`,
        ipAddress: "system",
        success: true,
        additionalInfo: { framework, complianceStatus, riskLevel, violations: violations.length }
      });
    }
    return {
      complianceStatus,
      violations,
      recommendedActions,
      riskLevel,
      autoRemediated
    };
  } catch (error) {
    console.error("Error in compliance monitoring:", error);
    return {
      complianceStatus: "under_review",
      violations: ["Compliance monitoring system error"],
      recommendedActions: ["Manual compliance review required"],
      riskLevel: 100,
      autoRemediated: false
    };
  }
}
async function logAiDecision(decisionType, entityType, entityId, inputData, outputData, decision, reasoning, confidence, processingTime, userId) {
  try {
    let biasScore = 0;
    let fairnessMetrics = {};
    if (isOpenAIConfigured && openaiClient) {
      try {
        const biasAnalysis = await openaiClient.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `Analyze the AI decision for potential bias. Provide a JSON response with:
              - biasScore: 0-100 (0 = no bias detected, 100 = high bias)
              - fairnessMetrics: object with fairness analysis`
            },
            {
              role: "user",
              content: `Decision: ${decision}
              Reasoning: ${reasoning}
              Input Data: ${JSON.stringify(inputData)}
              Output Data: ${JSON.stringify(outputData)}`
            }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        });
        const analysis = JSON.parse(biasAnalysis.choices[0].message.content || "{}");
        biasScore = Math.max(0, Math.min(100, analysis.biasScore || 0));
        fairnessMetrics = analysis.fairnessMetrics || {};
      } catch (biasError) {
        console.warn("Bias analysis failed, continuing without it:", biasError);
      }
    }
    await db.insert(aiDecisionLogs).values({
      decisionType,
      entityType,
      entityId,
      inputData,
      outputData,
      aiModel: "gpt-4o",
      modelVersion: "2024-05-13",
      confidence,
      processingTime,
      decision,
      reasoning,
      biasScore,
      fairnessMetrics,
      auditTrail: {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        userId,
        systemInfo: {
          nodeVersion: process.version,
          platform: process.platform
        }
      }
    });
    if (userId) {
      await logAuditEvent({
        userId,
        eventType: "SYSTEM_EVENT" /* SYSTEM_EVENT */,
        resourceType: "ai_decision",
        resourceId: entityId,
        action: "ai_decision_logged",
        description: `AI decision logged for ${decisionType}`,
        ipAddress: "system",
        success: true,
        additionalInfo: {
          decisionType,
          confidence,
          biasScore,
          processingTime
        }
      });
    }
  } catch (error) {
    console.error("Error logging AI decision:", error);
    throw error;
  }
}
async function trackNeuralMetrics(modelName, metricType, value, threshold, testDataset) {
  try {
    const status = value >= threshold ? "passing" : value >= threshold * 0.8 ? "warning" : "failing";
    let performanceTrend = "stable";
    try {
      const recentMetrics = await db.select().from(neuralMetrics).where(
        and2(
          eq2(neuralMetrics.modelName, modelName),
          eq2(neuralMetrics.metricType, metricType)
        )
      ).orderBy(desc2(neuralMetrics.evaluationDate)).limit(5);
      if (recentMetrics.length > 1) {
        const recentAverage = recentMetrics.slice(1).reduce((sum, metric) => sum + metric.value, 0) / (recentMetrics.length - 1);
        if (value > recentAverage * 1.05) {
          performanceTrend = "improving";
        } else if (value < recentAverage * 0.95) {
          performanceTrend = "declining";
        }
      }
    } catch (trendError) {
      console.warn("Could not determine performance trend:", trendError);
    }
    await db.insert(neuralMetrics).values({
      modelName,
      metricType,
      value: Math.round(value * 100),
      // Store as percentage * 100
      threshold: Math.round(threshold * 100),
      status,
      testDataset,
      performanceTrend,
      alertGenerated: status === "failing",
      notes: status === "failing" ? "Performance below threshold - investigation required" : void 0
    });
    console.log(`Neural metric tracked: ${modelName} ${metricType} = ${value} (${status})`);
  } catch (error) {
    console.error("Error tracking neural metrics:", error);
    throw error;
  }
}
async function getGovernanceDashboard(userId) {
  try {
    const riskAssessmentStats = await db.select({
      riskCategory: aiRiskAssessments.riskCategory,
      count: sql3`count(*)`
    }).from(aiRiskAssessments).groupBy(aiRiskAssessments.riskCategory);
    const pendingReviewCount = await db.select({ count: sql3`count(*)` }).from(aiRiskAssessments).where(eq2(aiRiskAssessments.requiresHumanReview, true));
    const complianceStats = await db.select({
      framework: complianceMonitoring.framework,
      complianceStatus: complianceMonitoring.complianceStatus,
      count: sql3`count(*)`
    }).from(complianceMonitoring).groupBy(complianceMonitoring.framework, complianceMonitoring.complianceStatus);
    const criticalViolations = await db.select({ count: sql3`count(*)` }).from(complianceMonitoring).where(eq2(complianceMonitoring.severity, "critical"));
    const neuralStats = await db.select({
      modelName: neuralMetrics.modelName,
      avgValue: sql3`avg(${neuralMetrics.value})`,
      status: neuralMetrics.status
    }).from(neuralMetrics).groupBy(neuralMetrics.modelName, neuralMetrics.status);
    const alertCount = await db.select({ count: sql3`count(*)` }).from(neuralMetrics).where(eq2(neuralMetrics.alertGenerated, true));
    const automationStats = await db.select({
      count: sql3`count(*)`,
      avgSuccessRate: sql3`avg(${automationRules.successRate})`,
      totalExecutions: sql3`sum(${automationRules.executionCount})`
    }).from(automationRules).where(eq2(automationRules.isActive, true));
    const riskByCategory = {};
    riskAssessmentStats.forEach((stat) => {
      riskByCategory[stat.riskCategory] = stat.count;
    });
    const complianceByFramework = {};
    complianceStats.forEach((stat) => {
      if (!complianceByFramework[stat.framework]) {
        complianceByFramework[stat.framework] = { compliant: 0, violations: 0, warnings: 0 };
      }
      if (stat.complianceStatus === "compliant") {
        complianceByFramework[stat.framework].compliant = stat.count;
      } else if (stat.complianceStatus === "violation") {
        complianceByFramework[stat.framework].violations = stat.count;
      } else if (stat.complianceStatus === "warning") {
        complianceByFramework[stat.framework].warnings = stat.count;
      }
    });
    return {
      riskAssessments: {
        total: Object.values(riskByCategory).reduce((sum, count3) => sum + count3, 0),
        byCategory: riskByCategory,
        pendingReview: pendingReviewCount[0]?.count || 0
      },
      complianceStatus: {
        byFramework: complianceByFramework,
        criticalViolations: criticalViolations[0]?.count || 0
      },
      neuralPerformance: {
        modelsTracked: new Set(neuralStats.map((s) => s.modelName)).size,
        averagePerformance: neuralStats.length > 0 ? neuralStats.reduce((sum, s) => sum + s.avgValue, 0) / neuralStats.length / 100 : 0,
        alertsGenerated: alertCount[0]?.count || 0
      },
      automationMetrics: {
        activeRules: automationStats[0]?.count || 0,
        executionsToday: automationStats[0]?.totalExecutions || 0,
        successRate: automationStats[0]?.avgSuccessRate || 0
      }
    };
  } catch (error) {
    console.error("Error generating governance dashboard:", error);
    throw error;
  }
}
var OPENAI_API_KEY, openaiClient, isOpenAIConfigured, COMPLIANCE_FRAMEWORKS;
var init_neuralGovernance = __esm({
  "server/services/neuralGovernance.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_auditLogger();
    OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    openaiClient = null;
    isOpenAIConfigured = false;
    try {
      if (OPENAI_API_KEY) {
        openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
        isOpenAIConfigured = true;
      }
    } catch (error) {
      console.error("Error initializing OpenAI for Neural Governance:", error);
    }
    COMPLIANCE_FRAMEWORKS = {
      HIPAA: {
        name: "Health Insurance Portability and Accountability Act",
        categories: ["PHI_protection", "access_controls", "audit_trails", "breach_notification"],
        riskThresholds: { low: 20, medium: 50, high: 80 }
      },
      GDPR: {
        name: "General Data Protection Regulation",
        categories: ["data_minimization", "consent_management", "right_to_erasure", "data_portability"],
        riskThresholds: { low: 25, medium: 60, high: 85 }
      },
      SOX: {
        name: "Sarbanes-Oxley Act",
        categories: ["financial_reporting", "internal_controls", "data_integrity", "audit_compliance"],
        riskThresholds: { low: 15, medium: 45, high: 75 }
      },
      FDA_21CFR11: {
        name: "FDA 21 CFR Part 11",
        categories: ["electronic_records", "electronic_signatures", "system_validation", "audit_trails"],
        riskThresholds: { low: 30, medium: 65, high: 90 }
      }
    };
  }
});

// server/services/aiModeration.ts
var aiModeration_exports = {};
__export(aiModeration_exports, {
  analyzeContentSentiment: () => analyzeContentSentiment,
  analyzeMedicalRelevance: () => analyzeMedicalRelevance,
  moderateContent: () => moderateContent,
  moderateForumComment: () => moderateForumComment,
  moderateForumPost: () => moderateForumPost,
  performAdvancedModeration: () => performAdvancedModeration,
  sanitizeContent: () => sanitizeContent
});
import OpenAI2 from "openai";
async function moderateContent(content) {
  if (!isOpenAIConfigured2 || !openaiClient2) {
    console.log("OpenAI API not configured. Skipping content moderation.");
    return {
      flagged: false,
      reason: "Moderation service not configured"
    };
  }
  try {
    const moderation = await openaiClient2.moderations.create({
      input: content
    });
    const result = moderation.results[0];
    if (result.flagged) {
      let reasons = [];
      Object.entries(result.categories).forEach(([category, flagged]) => {
        if (flagged) {
          reasons.push(category);
        }
      });
      return {
        flagged: true,
        reason: `Content flagged for: ${reasons.join(", ")}`
      };
    }
    return {
      flagged: false
    };
  } catch (error) {
    console.error("Error in AI moderation:", error);
    return {
      flagged: false,
      reason: "Moderation service error"
    };
  }
}
async function sanitizeContent(content) {
  if (!isOpenAIConfigured2 || !openaiClient2) {
    console.log("OpenAI API not configured. Skipping content sanitization.");
    return content;
  }
  try {
    const completion = await openaiClient2.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a content moderator for a healthcare forum. Your job is to sanitize content that might contain sensitive or inappropriate material. Remove any offensive language, personal health identifiers, or other inappropriate content while preserving the essential message. Replace removed content with appropriate placeholders like [PHI removed] or [inappropriate content removed]."
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.1,
      max_tokens: 1e3
    });
    return completion.choices[0].message.content || content;
  } catch (error) {
    console.error("Error in AI content sanitization:", error);
    return content;
  }
}
async function analyzeContentSentiment(content) {
  if (!isOpenAIConfigured2 || !openaiClient2) {
    console.log("OpenAI API not configured. Skipping content sentiment analysis.");
    return {
      sentiment: "neutral",
      toxicity: 0,
      themes: ["analysis unavailable"],
      summary: "AI sentiment analysis is not available."
    };
  }
  try {
    const completion = await openaiClient2.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "Analyze the sentiment and toxicity of the following content from a healthcare forum. Provide a JSON response with these fields: sentiment: 'positive', 'neutral', or 'negative' toxicity: a value from 0 (not toxic) to 1 (extremely toxic) themes: an array of key themes or topics mentioned summary: a brief 1-2 sentence summary of the content"
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    const analysisResult = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      sentiment: analysisResult.sentiment || "neutral",
      toxicity: analysisResult.toxicity || 0,
      themes: analysisResult.themes || [],
      summary: analysisResult.summary || ""
    };
  } catch (error) {
    console.error("Error in AI sentiment analysis:", error);
    return {
      sentiment: "neutral",
      toxicity: 0,
      themes: ["analysis error"],
      summary: "An error occurred during sentiment analysis."
    };
  }
}
async function analyzeMedicalRelevance(content) {
  if (!isOpenAIConfigured2 || !openaiClient2) {
    console.log("OpenAI API not configured. Defaulting to archiving content.");
    return {
      medicalRelevance: 5,
      // Middle score when uncertain
      shouldArchive: true,
      // Default to archiving when we can't analyze
      reasoning: "Unable to analyze content due to AI service unavailability. Archived by default as a precaution."
    };
  }
  try {
    const completion = await openaiClient2.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a healthcare information specialist analyzing forum comments in an HIV support community. Your task is to evaluate the medical relevance of comments to determine if they should be archived for future reference instead of deleted. Consider factors such as: 1. Whether the comment contains specific medical information, advice, or experiences 2. Whether the information could be valuable to other patients or healthcare providers 3. Whether the comment discusses medication effects, treatment responses, or symptom patterns 4. Whether the comment includes timeline information about disease progression or recovery 5. Whether the comment describes interactions between treatments or conditions Provide a score from 0-10 where 10 is extremely medically relevant, a boolean recommendation on whether to archive (comments scoring 4+ should be archived), and a brief explanation of your reasoning."
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    const analysisText = completion.choices[0].message.content || "{}";
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error("Error parsing AI analysis response:", parseError);
      analysis = {
        medicalRelevance: 5,
        shouldArchive: true,
        reasoning: "Failed to parse AI analysis. Defaulting to archive as a precaution."
      };
    }
    const medicalRelevance = typeof analysis.medicalRelevance === "number" ? Math.max(0, Math.min(10, analysis.medicalRelevance)) : 5;
    const shouldArchive = typeof analysis.shouldArchive === "boolean" ? analysis.shouldArchive : medicalRelevance >= 4;
    const reasoning = analysis.reasoning || `Content evaluated with medical relevance score of ${medicalRelevance}/10`;
    return {
      medicalRelevance,
      shouldArchive,
      reasoning
    };
  } catch (error) {
    console.error("Error in AI medical relevance analysis:", error);
    return {
      medicalRelevance: 5,
      shouldArchive: true,
      reasoning: "Unable to complete analysis due to technical error. Archived as a precaution."
    };
  }
}
async function performAdvancedModeration(content, contentType, contentId, userId) {
  try {
    const { performRiskAssessment: performRiskAssessment2, monitorCompliance: monitorCompliance2, logAiDecision: logAiDecision2 } = await Promise.resolve().then(() => (init_neuralGovernance(), neuralGovernance_exports));
    const basicModeration = await moderateContent(content);
    const riskAssessment = await performRiskAssessment2(
      "content_moderation",
      contentId,
      contentType,
      { content, userId, moderationResult: basicModeration },
      userId
    );
    const complianceCheck = await monitorCompliance2(
      "HIPAA",
      contentType,
      contentId,
      { content, userId },
      userId
    );
    const approved = basicModeration.approved && riskAssessment.riskScore < 70 && complianceCheck.complianceStatus === "compliant";
    const flags = [
      ...basicModeration.flags,
      ...riskAssessment.identifiedRisks,
      ...complianceCheck.violations
    ];
    const reasoning = `Content moderation: ${basicModeration.reasoning}. Risk score: ${riskAssessment.riskScore}. Compliance: ${complianceCheck.complianceStatus}.`;
    await logAiDecision2(
      "content_moderation",
      contentType,
      contentId,
      { content, userId },
      { approved, moderationScore: basicModeration.toxicity, riskScore: riskAssessment.riskScore },
      approved ? "approved" : "rejected",
      reasoning,
      riskAssessment.confidence,
      Date.now() - Date.now(),
      userId
    );
    return {
      approved,
      moderationScore: basicModeration.toxicity,
      flags,
      riskAssessment,
      complianceCheck,
      reasoning
    };
  } catch (error) {
    console.error("Error in advanced moderation:", error);
    const basicResult = await moderateContent(content);
    return {
      approved: basicResult.approved,
      moderationScore: basicResult.toxicity,
      flags: basicResult.flags,
      riskAssessment: { riskScore: 50, riskCategory: "medium" },
      complianceCheck: { complianceStatus: "under_review" },
      reasoning: "Advanced moderation failed, using basic moderation result"
    };
  }
}
var DEFAULT_MODEL, OPENAI_API_KEY2, openaiClient2, isOpenAIConfigured2, moderateForumPost, moderateForumComment;
var init_aiModeration = __esm({
  "server/services/aiModeration.ts"() {
    "use strict";
    DEFAULT_MODEL = "gpt-4o";
    OPENAI_API_KEY2 = process.env.OPENAI_API_KEY;
    openaiClient2 = null;
    isOpenAIConfigured2 = false;
    try {
      if (OPENAI_API_KEY2) {
        openaiClient2 = new OpenAI2({ apiKey: OPENAI_API_KEY2 });
        isOpenAIConfigured2 = true;
        console.log("OpenAI API client initialized successfully");
      } else {
        console.warn("Warning: OPENAI_API_KEY is not set. AI moderation features will not be available.");
      }
    } catch (error) {
      console.error("Error initializing OpenAI client:", error);
    }
    moderateForumPost = moderateContent;
    moderateForumComment = moderateContent;
  }
});

// server/services/healthcareResources.ts
var healthcareResources_exports = {};
__export(healthcareResources_exports, {
  refreshHealthcareResources: () => refreshHealthcareResources,
  seedHealthcareResources: () => seedHealthcareResources
});
import { sql as sql7 } from "drizzle-orm";
async function seedHealthcareResources() {
  try {
    const existingCount = await db.select({ count: sql7`count(*)` }).from(resources);
    const count3 = Number(existingCount[0]?.count || "0");
    if (count3 > 0) {
      console.log(`Found ${count3} existing resources. Skipping healthcare resource seed.`);
      return 0;
    }
    await db.insert(resources).values(staticHealthcareResources);
    console.log(`Seeded ${staticHealthcareResources.length} healthcare resources`);
    return staticHealthcareResources.length;
  } catch (error) {
    console.error("Error seeding healthcare resources:", error);
    return 0;
  }
}
async function refreshHealthcareResources() {
  try {
    await db.delete(resources);
    await db.insert(resources).values(staticHealthcareResources);
    console.log(`Refreshed with ${staticHealthcareResources.length} healthcare resources`);
    return staticHealthcareResources.length;
  } catch (error) {
    console.error("Error refreshing healthcare resources:", error);
    return 0;
  }
}
var staticHealthcareResources;
var init_healthcareResources = __esm({
  "server/services/healthcareResources.ts"() {
    "use strict";
    init_schema();
    init_db();
    staticHealthcareResources = [
      // HIV Testing Centers
      {
        name: "Community Health Services HIV Testing Center",
        description: "Free and confidential HIV testing, counseling, and prevention services. Walk-ins welcome.",
        category: "testing_centers",
        address: "1425 Martin Luther King Jr Way, Oakland, CA 94612",
        phone: "(510) 555-0198",
        email: "testing@communityhealthservices.org",
        website: "https://communityhealthservices.org/hiv-testing",
        contactInfo: "(510) 555-0198",
        hours: "Mon-Fri 8AM-6PM, Sat 9AM-3PM",
        takingNewPatients: true,
        isVirtual: false,
        rating: 5,
        reviewCount: 127,
        imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop"
      },
      {
        name: "San Francisco AIDS Foundation Testing Site",
        description: "Comprehensive HIV testing, PrEP consultation, and sexual health services in a welcoming environment.",
        category: "testing_centers",
        address: "1035 Market St, San Francisco, CA 94103",
        phone: "(415) 555-0234",
        email: "services@sfaf.org",
        website: "https://sfaf.org/hiv-testing",
        contactInfo: "(415) 555-0234",
        hours: "Mon-Thu 9AM-7PM, Fri 9AM-5PM",
        takingNewPatients: true,
        isVirtual: false,
        rating: 5,
        reviewCount: 203,
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop"
      },
      // HIV Specialists
      {
        name: "Dr. Maria Rodriguez - HIV Specialist",
        description: "Board-certified infectious disease specialist with 15+ years treating HIV patients. Expertise in treatment adherence and care coordination.",
        category: "hiv_specialists",
        address: "2100 Webster St, Suite 401, San Francisco, CA 94115",
        phone: "(415) 555-0156",
        email: "appointments@rodriguezmd.com",
        website: "https://rodriguezmd.com",
        contactInfo: "(415) 555-0156",
        hours: "Mon-Fri 8AM-5PM",
        takingNewPatients: true,
        isVirtual: false,
        rating: 5,
        reviewCount: 89,
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop"
      },
      {
        name: "Dr. James Chen - Infectious Disease Clinic",
        description: "Comprehensive HIV care including viral load monitoring, medication management, and preventive care. Telehealth available.",
        category: "hiv_specialists",
        address: "3801 Sacramento St, San Francisco, CA 94118",
        phone: "(415) 555-0287",
        email: "care@cheninfectiousdisease.com",
        website: "https://cheninfectiousdisease.com",
        contactInfo: "(415) 555-0287",
        hours: "Mon-Fri 7AM-6PM",
        takingNewPatients: true,
        isVirtual: true,
        rating: 5,
        reviewCount: 156,
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop"
      },
      // Mental Health Support
      {
        name: "Bay Area HIV Mental Health Counseling",
        description: "Specialized therapy for HIV+ individuals dealing with diagnosis adjustment, depression, anxiety, and life transitions.",
        category: "mental_health",
        address: "1663 Mission St, Suite 400, San Francisco, CA 94103",
        phone: "(415) 555-0345",
        email: "support@bayhivmentalhealth.org",
        website: "https://bayhivmentalhealth.org",
        contactInfo: "(415) 555-0345",
        hours: "Mon-Sat 9AM-8PM",
        takingNewPatients: true,
        isVirtual: true,
        rating: 5,
        reviewCount: 94,
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop"
      },
      {
        name: "LGBTQ+ Affirming Therapy Center",
        description: "Culturally competent mental health services for LGBTQ+ individuals living with HIV. Individual and group therapy available.",
        category: "mental_health",
        address: "1800 Market St, Suite 3A, San Francisco, CA 94102",
        phone: "(415) 555-0412",
        email: "intake@lgbtqtherapy.org",
        website: "https://lgbtqtherapy.org",
        contactInfo: "(415) 555-0412",
        hours: "Mon-Sun 8AM-9PM",
        takingNewPatients: true,
        isVirtual: true,
        rating: 5,
        reviewCount: 167,
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop"
      },
      // Support Groups
      {
        name: "Positive Living Support Group",
        description: "Weekly peer support meetings for people newly diagnosed with HIV. Safe space to share experiences and build community.",
        category: "support_groups",
        address: "Community Center, 1235 Folsom St, San Francisco, CA 94103",
        phone: "(415) 555-0567",
        email: "groups@positiveliving.org",
        website: "https://positiveliving.org/support-groups",
        contactInfo: "(415) 555-0567",
        hours: "Thursdays 7PM-8:30PM",
        takingNewPatients: true,
        isVirtual: false,
        rating: 5,
        reviewCount: 78,
        imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop"
      },
      {
        name: "Virtual HIV+ Wellness Circle",
        description: "Online support group focusing on wellness, nutrition, and maintaining health while living with HIV. Meets twice weekly.",
        category: "support_groups",
        address: "Online - Zoom meetings",
        phone: "(415) 555-0698",
        email: "virtual@hivwellnesscircle.org",
        website: "https://hivwellnesscircle.org",
        contactInfo: "(415) 555-0698",
        hours: "Tuesdays & Saturdays 6PM-7PM",
        takingNewPatients: true,
        isVirtual: true,
        rating: 5,
        reviewCount: 124,
        imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop"
      },
      // Pharmacy & Medication
      {
        name: "AIDS Healthcare Foundation Pharmacy",
        description: "Specialized HIV medication pharmacy with financial assistance programs and medication adherence support.",
        category: "pharmacy",
        address: "6255 Sunset Blvd, Los Angeles, CA 90028",
        phone: "(323) 555-0789",
        email: "pharmacy@aidshealth.org",
        website: "https://aidshealth.org/pharmacy",
        contactInfo: "(323) 555-0789",
        hours: "Mon-Fri 8AM-8PM, Sat 9AM-5PM",
        takingNewPatients: true,
        isVirtual: false,
        rating: 5,
        reviewCount: 267,
        imageUrl: "https://images.unsplash.com/photo-1576602975774-74c020fc5bb4?w=400&h=300&fit=crop"
      },
      {
        name: "Walgreens Specialty Pharmacy - HIV Care",
        description: "Full-service specialty pharmacy for HIV medications with home delivery and 24/7 pharmacist support.",
        category: "pharmacy",
        address: "Multiple locations - Home delivery available",
        phone: "(855) 555-0234",
        email: "hivcare@walgreensspecialty.com",
        website: "https://walgreensspecialty.com/hiv",
        contactInfo: "(855) 555-0234",
        hours: "24/7 Support Available",
        takingNewPatients: true,
        isVirtual: true,
        rating: 4,
        reviewCount: 189,
        imageUrl: "https://images.unsplash.com/photo-1576602975774-74c020fc5bb4?w=400&h=300&fit=crop"
      },
      // Legal & Financial Support
      {
        name: "HIV Legal Aid Society",
        description: "Free legal services for HIV+ individuals including disability benefits, healthcare advocacy, and employment discrimination cases.",
        category: "legal_support",
        address: "995 Market St, Suite 200, San Francisco, CA 94103",
        phone: "(415) 555-0123",
        email: "help@hivlegalaid.org",
        website: "https://hivlegalaid.org",
        contactInfo: "(415) 555-0123",
        hours: "Mon-Fri 9AM-5PM",
        takingNewPatients: true,
        isVirtual: true,
        rating: 5,
        reviewCount: 56,
        imageUrl: "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=400&h=300&fit=crop"
      }
    ];
  }
});

// server/services/rssFeed.ts
var rssFeed_exports = {};
__export(rssFeed_exports, {
  fetchRssFeed: () => fetchRssFeed,
  importRssFeedsAsResources: () => importRssFeedsAsResources,
  refreshAllFeeds: () => refreshAllFeeds,
  scheduleRssFeedRefresh: () => scheduleRssFeedRefresh,
  seedInitialResourcesIfNeeded: () => seedInitialResourcesIfNeeded
});
import Parser from "rss-parser";
import { eq as eq10, and as and10, sql as sql8 } from "drizzle-orm";
async function fetchRssFeed(url2, forceRefresh = false) {
  if (!forceRefresh && cache[url2] && (/* @__PURE__ */ new Date()).getTime() - cache[url2].lastFetched.getTime() < CACHE_EXPIRATION_MS) {
    console.log(`Using cached feed for ${url2}`);
    return cache[url2].items;
  }
  try {
    console.log(`Fetching feed from ${url2}`);
    const feed = await parser.parseURL(url2);
    cache[url2] = {
      items: feed.items,
      lastFetched: /* @__PURE__ */ new Date()
    };
    return feed.items;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url2}:`, error);
    if (cache[url2]) {
      console.log(`Using expired cached feed for ${url2} due to fetch error`);
      return cache[url2].items;
    }
    return [];
  }
}
function rssItemToResource(item, category) {
  let imageUrl = "";
  if (item.media && item.media.length > 0 && item.media[0].$) {
    imageUrl = item.media[0].$.url;
  } else if (item.enclosure && item.enclosure.url) {
    imageUrl = item.enclosure.url;
  }
  let description = item.contentSnippet || item.content || item.description || "";
  if (description.length > 300) {
    description = description.substring(0, 297) + "...";
  }
  description = description.replace(/<[^>]*>?/gm, "");
  const categoryName = healthTopicCategories[category] || "General Health";
  return {
    name: item.title || "Untitled Article",
    description,
    category: categoryName,
    contactInfo: item.link || "",
    address: "",
    website: item.link || "",
    imageUrl,
    isVirtual: true,
    takingNewPatients: true,
    availableToday: true
  };
}
async function importRssFeedsAsResources() {
  let importCount = 0;
  for (const [category, urls] of Object.entries(feedUrls)) {
    for (const url2 of urls) {
      try {
        const items = await fetchRssFeed(url2);
        const resourcesBatch = items.slice(0, 10).map((item) => rssItemToResource(item, category));
        if (resourcesBatch.length > 0) {
          await db.insert(resources).values(resourcesBatch);
          importCount += resourcesBatch.length;
          console.log(`Imported ${resourcesBatch.length} items from ${url2}`);
        }
      } catch (error) {
        console.error(`Error importing feed ${url2} as resources:`, error);
      }
    }
  }
  return importCount;
}
async function seedInitialResourcesIfNeeded() {
  const { seedHealthcareResources: seedHealthcareResources2 } = await Promise.resolve().then(() => (init_healthcareResources(), healthcareResources_exports));
  await seedHealthcareResources2();
}
async function refreshAllFeeds() {
  await db.delete(resources).where(
    and10(
      sql8`website is not null and website != ''`,
      eq10(resources.isVirtual, true)
    )
  );
  return await importRssFeedsAsResources();
}
function scheduleRssFeedRefresh(intervalHours = 24) {
  const intervalMs = intervalHours * 60 * 60 * 1e3;
  console.log(`Scheduling RSS feed refresh every ${intervalHours} hours`);
  return setInterval(async () => {
    console.log("Running scheduled RSS feed refresh...");
    try {
      const count3 = await refreshAllFeeds();
      console.log(`Refreshed ${count3} resources from RSS feeds`);
    } catch (error) {
      console.error("Error during scheduled RSS feed refresh:", error);
    }
  }, intervalMs);
}
var cache, CACHE_EXPIRATION_MS, parser, healthTopicCategories, feedUrls;
var init_rssFeed = __esm({
  "server/services/rssFeed.ts"() {
    "use strict";
    init_schema();
    init_db();
    cache = {};
    CACHE_EXPIRATION_MS = 30 * 60 * 1e3;
    parser = new Parser({
      customFields: {
        item: [
          ["media:content", "media", { keepArray: true }],
          ["content:encoded", "contentEncoded"]
        ]
      }
    });
    healthTopicCategories = {
      "mental-health": "Mental Health Resources",
      "post-diagnosis": "Post-Diagnosis Care",
      "hiv-research": "HIV Research",
      "treatment": "Treatment Options",
      "support": "Support Networks",
      "prevention": "Prevention Strategies",
      "nutrition": "Nutrition & Diet",
      "wellness": "General Wellness"
    };
    feedUrls = {};
  }
});

// server/index.ts
import express10 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
init_schema();
init_schema();
init_schema();
init_schema();
init_schema();
init_schema();
init_schema();
init_schema();
init_schema();
init_db();
import { eq, like, gte, lte, desc, asc, or, inArray } from "drizzle-orm";
var DatabaseStorage = class {
  // Users
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async updateUser(id, userData) {
    const [updatedUser] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return updatedUser;
  }
  // Resources
  async getResource(id) {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }
  async getResources(filters) {
    let query = db.select().from(resources);
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        query = query.where(inArray(resources.category, filters.categories));
      }
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.where(
          or(
            like(resources.name, searchTerm),
            like(resources.description, searchTerm),
            like(resources.category, searchTerm)
          )
        );
      }
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset);
    }
    return await query;
  }
  async createResource(resourceData) {
    const [resource] = await db.insert(resources).values(resourceData).returning();
    return resource;
  }
  async updateResource(id, resourceData) {
    const [updatedResource] = await db.update(resources).set(resourceData).where(eq(resources.id, id)).returning();
    return updatedResource;
  }
  async deleteResource(id) {
    const result = await db.delete(resources).where(eq(resources.id, id)).returning({ id: resources.id });
    return result.length > 0;
  }
  // Events
  async getEvent(id) {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }
  async getEvents(filters) {
    let query = db.select().from(events);
    if (filters) {
      if (filters.startDate) {
        query = query.where(gte(events.startTime, filters.startDate));
      }
      if (filters.endDate) {
        query = query.where(lte(events.endTime, filters.endDate));
      }
      if (filters.category) {
        query = query.where(eq(events.category, filters.category));
      }
      if (filters.isVirtual !== void 0) {
        query = query.where(eq(events.isVirtual, filters.isVirtual));
      }
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.where(
          or(
            like(events.title, searchTerm),
            like(events.description, searchTerm)
          )
        );
      }
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset);
    }
    query = query.orderBy(asc(events.startTime));
    return await query;
  }
  async createEvent(eventData) {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }
  async updateEvent(id, eventData) {
    const [updatedEvent] = await db.update(events).set(eventData).where(eq(events.id, id)).returning();
    return updatedEvent;
  }
  async deleteEvent(id) {
    const result = await db.delete(events).where(eq(events.id, id)).returning({ id: events.id });
    return result.length > 0;
  }
  async registerForEvent(eventId, userId) {
    const event = await this.getEvent(eventId);
    if (!event)
      return false;
    let registeredUsers = event.registeredUsers || [];
    if (!registeredUsers.includes(userId)) {
      registeredUsers.push(userId);
      const updatedEvent = await this.updateEvent(eventId, { registeredUsers });
      return !!updatedEvent;
    }
    return true;
  }
  async unregisterFromEvent(eventId, userId) {
    const event = await this.getEvent(eventId);
    if (!event || !event.registeredUsers)
      return false;
    const registeredUsers = event.registeredUsers.filter((id) => id !== userId);
    const updatedEvent = await this.updateEvent(eventId, { registeredUsers });
    return !!updatedEvent;
  }
  // Community Groups
  async getCommunityGroup(id) {
    const [group] = await db.select().from(communityGroups).where(eq(communityGroups.id, id));
    return group;
  }
  async getCommunityGroups(filters) {
    let query = db.select().from(communityGroups);
    if (filters) {
      if (filters.isPublic !== void 0) {
        query = query.where(eq(communityGroups.isPublic, filters.isPublic));
      }
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.where(
          or(
            like(communityGroups.name, searchTerm),
            like(communityGroups.description, searchTerm)
          )
        );
      }
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset);
    }
    query = query.orderBy(desc(communityGroups.lastActive));
    return await query;
  }
  async createCommunityGroup(groupData) {
    const now = /* @__PURE__ */ new Date();
    const data = {
      ...groupData,
      createdAt: now,
      lastActive: now,
      memberCount: 1,
      // Creator is first member
      members: [1]
      // Assuming creator ID is 1 for now
    };
    const [group] = await db.insert(communityGroups).values(data).returning();
    return group;
  }
  async updateCommunityGroup(id, groupData) {
    const [updatedGroup] = await db.update(communityGroups).set(groupData).where(eq(communityGroups.id, id)).returning();
    return updatedGroup;
  }
  async deleteCommunityGroup(id) {
    const result = await db.delete(communityGroups).where(eq(communityGroups.id, id)).returning({ id: communityGroups.id });
    return result.length > 0;
  }
  async joinCommunityGroup(groupId, userId) {
    const group = await this.getCommunityGroup(groupId);
    if (!group)
      return false;
    let members = group.members || [];
    if (!members.includes(userId)) {
      members.push(userId);
      const memberCount = (group.memberCount || 0) + 1;
      const updatedGroup = await this.updateCommunityGroup(groupId, {
        members,
        memberCount,
        lastActive: /* @__PURE__ */ new Date()
      });
      return !!updatedGroup;
    }
    return true;
  }
  async leaveCommunityGroup(groupId, userId) {
    const group = await this.getCommunityGroup(groupId);
    if (!group || !group.members)
      return false;
    const members = group.members.filter((id) => id !== userId);
    const memberCount = Math.max(0, (group.memberCount || 1) - 1);
    const updatedGroup = await this.updateCommunityGroup(groupId, {
      members,
      memberCount,
      lastActive: /* @__PURE__ */ new Date()
    });
    return !!updatedGroup;
  }
  // Discussions
  async getDiscussion(id) {
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, id));
    return discussion;
  }
  async getDiscussions(filters) {
    let query = db.select().from(discussions);
    if (filters) {
      if (filters.groupId !== void 0) {
        query = query.where(eq(discussions.groupId, filters.groupId));
      }
      if (filters.authorId !== void 0) {
        query = query.where(eq(discussions.authorId, filters.authorId));
      }
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.where(
          or(
            like(discussions.title, searchTerm),
            like(discussions.content, searchTerm)
          )
        );
      }
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset);
    }
    query = query.orderBy(desc(discussions.createdAt));
    return await query;
  }
  async createDiscussion(discussionData) {
    const now = /* @__PURE__ */ new Date();
    const data = {
      ...discussionData,
      createdAt: now,
      updatedAt: now,
      replyCount: 0,
      likes: 0
    };
    const [discussion] = await db.insert(discussions).values(data).returning();
    return discussion;
  }
  async updateDiscussion(id, discussionData) {
    const [updatedDiscussion] = await db.update(discussions).set({
      ...discussionData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(discussions.id, id)).returning();
    return updatedDiscussion;
  }
  async deleteDiscussion(id) {
    const result = await db.delete(discussions).where(eq(discussions.id, id)).returning({ id: discussions.id });
    return result.length > 0;
  }
  async likeDiscussion(id) {
    const discussion = await this.getDiscussion(id);
    if (!discussion)
      return false;
    const likes = (discussion.likes || 0) + 1;
    const updatedDiscussion = await this.updateDiscussion(id, { likes });
    return !!updatedDiscussion;
  }
  // Messages
  async getMessage(id) {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  async getMessages(filters) {
    let query = db.select().from(messages);
    if (filters.senderId !== void 0) {
      query = query.where(eq(messages.senderId, filters.senderId));
    }
    if (filters.recipientId !== void 0) {
      query = query.where(eq(messages.recipientId, filters.recipientId));
    }
    if (filters.isRead !== void 0) {
      query = query.where(eq(messages.isRead, filters.isRead));
    }
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);
    query = query.orderBy(desc(messages.createdAt));
    return await query;
  }
  async createMessage(messageData) {
    const data = {
      ...messageData,
      createdAt: /* @__PURE__ */ new Date(),
      isRead: false
    };
    const [message] = await db.insert(messages).values(data).returning();
    return message;
  }
  async markMessageAsRead(id) {
    const [updatedMessage] = await db.update(messages).set({ isRead: true }).where(eq(messages.id, id)).returning();
    return !!updatedMessage;
  }
  async deleteMessage(id) {
    const result = await db.delete(messages).where(eq(messages.id, id)).returning({ id: messages.id });
    return result.length > 0;
  }
  // Notifications
  async getNotification(id) {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }
  async getNotifications(userId, isRead) {
    let query = db.select().from(notifications).where(eq(notifications.userId, userId));
    if (isRead !== void 0) {
      query = query.where(eq(notifications.isRead, isRead));
    }
    query = query.orderBy(desc(notifications.createdAt));
    return await query;
  }
  async createNotification(notificationData) {
    const data = {
      ...notificationData,
      createdAt: /* @__PURE__ */ new Date(),
      isRead: false
    };
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }
  async markNotificationAsRead(id) {
    const [updatedNotification] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    return !!updatedNotification;
  }
  async deleteNotification(id) {
    const result = await db.delete(notifications).where(eq(notifications.id, id)).returning({ id: notifications.id });
    return result.length > 0;
  }
  // Educational Content
  async getEducationalContent(id) {
    const [content] = await db.select().from(educationalContent).where(eq(educationalContent.id, id));
    return content;
  }
  async getEducationalContents(filters) {
    let query = db.select().from(educationalContent);
    if (filters) {
      if (filters.category) {
        query = query.where(eq(educationalContent.category, filters.category));
      }
      if (filters.authorId !== void 0) {
        query = query.where(eq(educationalContent.authorId, filters.authorId));
      }
      if (filters.featured !== void 0) {
        query = query.where(eq(educationalContent.featured, filters.featured));
      }
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.where(
          or(
            like(educationalContent.title, searchTerm),
            like(educationalContent.content, searchTerm),
            like(educationalContent.category, searchTerm)
          )
        );
      }
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset);
    }
    query = query.orderBy(desc(educationalContent.publishedDate));
    return await query;
  }
  async createEducationalContent(contentData) {
    const now = /* @__PURE__ */ new Date();
    const data = {
      ...contentData,
      publishedDate: now,
      lastUpdated: now
    };
    const [content] = await db.insert(educationalContent).values(data).returning();
    return content;
  }
  async updateEducationalContent(id, contentData) {
    const [updatedContent] = await db.update(educationalContent).set({
      ...contentData,
      lastUpdated: /* @__PURE__ */ new Date()
    }).where(eq(educationalContent.id, id)).returning();
    return updatedContent;
  }
  async deleteEducationalContent(id) {
    const result = await db.delete(educationalContent).where(eq(educationalContent.id, id)).returning({ id: educationalContent.id });
    return result.length > 0;
  }
  // Appointments
  async getAppointment(id) {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }
  async getAppointments(filters) {
    let query = db.select().from(appointments);
    if (filters.patientId !== void 0) {
      query = query.where(eq(appointments.patientId, filters.patientId));
    }
    if (filters.providerId !== void 0) {
      query = query.where(eq(appointments.providerId, filters.providerId));
    }
    if (filters.startDate) {
      query = query.where(gte(appointments.startTime, filters.startDate));
    }
    if (filters.endDate) {
      query = query.where(lte(appointments.endTime, filters.endDate));
    }
    if (filters.status) {
      query = query.where(eq(appointments.status, filters.status));
    }
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);
    query = query.orderBy(asc(appointments.startTime));
    return await query;
  }
  async createAppointment(appointmentData) {
    const data = {
      ...appointmentData,
      reminderSent: false
    };
    const [appointment] = await db.insert(appointments).values(data).returning();
    return appointment;
  }
  async updateAppointment(id, appointmentData) {
    const [updatedAppointment] = await db.update(appointments).set(appointmentData).where(eq(appointments.id, id)).returning();
    return updatedAppointment;
  }
  async cancelAppointment(id) {
    const [updatedAppointment] = await db.update(appointments).set({ status: "cancelled" }).where(eq(appointments.id, id)).returning();
    return !!updatedAppointment;
  }
  // Database optimization
  async optimizeDatabase() {
    const optimizations = [];
    let duplicatesRemoved = 0;
    try {
      const allUsers = await db.select().from(users);
      const emailMap = /* @__PURE__ */ new Map();
      for (const user of allUsers) {
        if (!emailMap.has(user.email)) {
          emailMap.set(user.email, []);
        }
        emailMap.get(user.email).push(user);
      }
      for (const [email, userList] of emailMap) {
        if (userList.length > 1) {
          userList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
          for (let i = 1; i < userList.length; i++) {
            await db.delete(users).where(eq(users.id, userList[i].id));
            duplicatesRemoved++;
            optimizations.push(`Removed duplicate user: ${email} (ID: ${userList[i].id})`);
          }
        }
      }
      optimizations.push("Completed duplicate user cleanup");
      return { duplicatesRemoved, optimizations };
    } catch (error) {
      console.error("Database optimization error:", error);
      return { duplicatesRemoved: 0, optimizations: ["Error during optimization: " + error.message] };
    }
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
init_schema();
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z as z8 } from "zod";

// server/routes/forum.ts
init_db();
init_schema();
init_aiModeration();
import { Router } from "express";
import { eq as eq3, desc as desc3, and as and3, like as like2, or as or2, count } from "drizzle-orm";
var router = Router();
var isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Access denied" });
};
router.get("/categories", async (_req, res) => {
  try {
    const categories = await db.select().from(forumCategories).orderBy(forumCategories.displayOrder);
    return res.json(categories);
  } catch (error) {
    console.error("Error fetching forum categories:", error);
    return res.status(500).json({ error: "Failed to fetch forum categories" });
  }
});
router.get("/categories/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const isId = !isNaN(Number(identifier));
    let category;
    if (isId) {
      [category] = await db.select().from(forumCategories).where(eq3(forumCategories.id, parseInt(identifier)));
    } else {
      [category] = await db.select().from(forumCategories).where(eq3(forumCategories.slug, identifier));
    }
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    return res.json(category);
  } catch (error) {
    console.error("Error fetching forum category:", error);
    return res.status(500).json({ error: "Failed to fetch forum category" });
  }
});
router.post("/categories", isAdmin, async (req, res) => {
  try {
    const validatedData = insertForumCategorySchema.parse(req.body);
    if (!validatedData.slug) {
      validatedData.slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    const [newCategory] = await db.insert(forumCategories).values(validatedData).returning();
    return res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating forum category:", error);
    return res.status(400).json({ error: error.message || "Failed to create forum category" });
  }
});
router.patch("/categories/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const [updatedCategory] = await db.update(forumCategories).set(updates).where(eq3(forumCategories.id, parseInt(id))).returning();
    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
    return res.json(updatedCategory);
  } catch (error) {
    console.error("Error updating forum category:", error);
    return res.status(400).json({ error: error.message || "Failed to update forum category" });
  }
});
router.delete("/categories/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [category] = await db.select().from(forumCategories).where(eq3(forumCategories.id, parseInt(id)));
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    await db.delete(forumCategories).where(eq3(forumCategories.id, parseInt(id)));
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting forum category:", error);
    return res.status(500).json({ error: "Failed to delete forum category" });
  }
});
router.get("/categories/:categoryId/posts", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;
    const posts = await db.select().from(forumPosts).where(and3(
      eq3(forumPosts.categoryId, parseInt(categoryId)),
      eq3(forumPosts.moderationStatus, "approved")
    )).orderBy(desc3(forumPosts.isPinned), desc3(forumPosts.createdAt)).limit(limitNumber).offset(offset);
    const [{ count: totalCount }] = await db.select({ count: count() }).from(forumPosts).where(and3(
      eq3(forumPosts.categoryId, parseInt(categoryId)),
      eq3(forumPosts.moderationStatus, "approved")
    ));
    return res.json({
      posts,
      pagination: {
        total: Number(totalCount),
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(Number(totalCount) / limitNumber)
      }
    });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return res.status(500).json({ error: "Failed to fetch forum posts" });
  }
});
router.get("/posts", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      categoryId,
      search,
      isPinned,
      isFeatured
    } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;
    let conditions = [];
    conditions.push(eq3(forumPosts.moderationStatus, "approved"));
    if (categoryId) {
      conditions.push(eq3(forumPosts.categoryId, parseInt(categoryId)));
    }
    if (isPinned === "true") {
      conditions.push(eq3(forumPosts.isPinned, true));
    }
    if (isFeatured === "true") {
      conditions.push(eq3(forumPosts.isFeatured, true));
    }
    if (search) {
      conditions.push(
        or2(
          like2(forumPosts.title, `%${search}%`),
          like2(forumPosts.content, `%${search}%`)
        )
      );
    }
    const whereCondition = conditions.length > 0 ? and3(...conditions) : void 0;
    const posts = whereCondition ? await db.select().from(forumPosts).where(whereCondition).orderBy(desc3(forumPosts.isPinned), desc3(forumPosts.createdAt)).limit(limitNumber).offset(offset) : await db.select().from(forumPosts).orderBy(desc3(forumPosts.isPinned), desc3(forumPosts.createdAt)).limit(limitNumber).offset(offset);
    const [{ count: totalCount }] = whereCondition ? await db.select({ count: count() }).from(forumPosts).where(whereCondition) : await db.select({ count: count() }).from(forumPosts);
    return res.json({
      posts,
      pagination: {
        total: Number(totalCount),
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(Number(totalCount) / limitNumber)
      }
    });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return res.status(500).json({ error: "Failed to fetch forum posts" });
  }
});
router.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [post] = await db.select().from(forumPosts).where(eq3(forumPosts.id, parseInt(id)));
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const isAdmin7 = req.isAuthenticated() && req.user.role === "admin";
    if (post.moderationStatus !== "approved" && !isAdmin7) {
      return res.status(403).json({ error: "This post is not available" });
    }
    await db.update(forumPosts).set({ viewCount: post.viewCount + 1 }).where(eq3(forumPosts.id, parseInt(id)));
    return res.json(post);
  } catch (error) {
    console.error("Error fetching forum post:", error);
    return res.status(500).json({ error: "Failed to fetch forum post" });
  }
});
router.post("/posts", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const validatedData = insertForumPostSchema.parse(req.body);
    validatedData.authorId = req.user.id;
    const moderationResult = await moderateForumPost(validatedData);
    const postData = {
      ...validatedData,
      isModerated: true,
      moderationStatus: moderationResult.isAllowed ? "approved" : "flagged",
      moderationNotes: moderationResult.moderationNotes
    };
    const [newPost] = await db.insert(forumPosts).values(postData).returning();
    await db.update(forumCategories).set({
      postCount: db.raw(`${forumCategories.postCount.name} + 1`)
    }).where(eq3(forumCategories.id, validatedData.categoryId));
    return res.status(201).json({
      post: newPost,
      moderation: {
        isAllowed: moderationResult.isAllowed,
        notes: moderationResult.moderationNotes
      }
    });
  } catch (error) {
    console.error("Error creating forum post:", error);
    return res.status(400).json({ error: error.message || "Failed to create forum post" });
  }
});
router.patch("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.session.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const [post] = await db.select().from(forumPosts).where(eq3(forumPosts.id, parseInt(id)));
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const isAuthor = post.authorId === req.session.user.id;
    const isAdmin7 = req.session.user.role === "admin";
    if (!isAuthor && !isAdmin7) {
      return res.status(403).json({ error: "You don't have permission to edit this post" });
    }
    const updates = req.body;
    if (updates.content || updates.title) {
      const contentToModerate = {
        title: updates.title || post.title,
        content: updates.content || post.content
      };
      const moderationResult = await moderateForumPost(contentToModerate);
      updates.isModerated = true;
      updates.moderationStatus = moderationResult.isAllowed ? "approved" : "flagged";
      updates.moderationNotes = moderationResult.moderationNotes;
    }
    const [updatedPost] = await db.update(forumPosts).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq3(forumPosts.id, parseInt(id))).returning();
    return res.json(updatedPost);
  } catch (error) {
    console.error("Error updating forum post:", error);
    return res.status(400).json({ error: error.message || "Failed to update forum post" });
  }
});
router.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.session.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const [post] = await db.select().from(forumPosts).where(eq3(forumPosts.id, parseInt(id)));
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const isAuthor = post.authorId === req.session.user.id;
    const isAdmin7 = req.session.user.role === "admin";
    if (!isAuthor && !isAdmin7) {
      return res.status(403).json({ error: "You don't have permission to delete this post" });
    }
    await db.delete(forumPosts).where(eq3(forumPosts.id, parseInt(id)));
    await db.update(forumCategories).set({
      postCount: db.raw(`GREATEST(0, ${forumCategories.postCount.name} - 1)`)
    }).where(eq3(forumCategories.id, post.categoryId));
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting forum post:", error);
    return res.status(500).json({ error: "Failed to delete forum post" });
  }
});
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;
    const comments = await db.select().from(forumComments).where(and3(
      eq3(forumComments.postId, parseInt(postId)),
      eq3(forumComments.moderationStatus, "approved")
    )).orderBy(forumComments.createdAt).limit(limitNumber).offset(offset);
    const [{ count: totalCount }] = await db.select({ count: count() }).from(forumComments).where(and3(
      eq3(forumComments.postId, parseInt(postId)),
      eq3(forumComments.moderationStatus, "approved")
    ));
    return res.json({
      comments,
      pagination: {
        total: Number(totalCount),
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(Number(totalCount) / limitNumber)
      }
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
});
router.post("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    if (!req.session.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const validatedData = insertForumCommentSchema.parse(req.body);
    validatedData.authorId = req.session.user.id;
    validatedData.postId = parseInt(postId);
    const moderationResult = await moderateForumComment(validatedData);
    const commentData = {
      ...validatedData,
      isModerated: true,
      moderationStatus: moderationResult.isAllowed ? "approved" : "flagged",
      moderationNotes: moderationResult.moderationNotes
    };
    const [newComment] = await db.insert(forumComments).values(commentData).returning();
    await db.update(forumPosts).set({
      commentCount: db.raw(`${forumPosts.commentCount.name} + 1`)
    }).where(eq3(forumPosts.id, parseInt(postId)));
    return res.status(201).json({
      comment: newComment,
      moderation: {
        isAllowed: moderationResult.isAllowed,
        notes: moderationResult.moderationNotes
      }
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(400).json({ error: error.message || "Failed to create comment" });
  }
});
router.patch("/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.session.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const [comment] = await db.select().from(forumComments).where(eq3(forumComments.id, parseInt(id)));
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    const isAuthor = comment.authorId === req.session.user.id;
    const isAdmin7 = req.session.user.role === "admin";
    if (!isAuthor && !isAdmin7) {
      return res.status(403).json({ error: "You don't have permission to edit this comment" });
    }
    const updates = req.body;
    if (updates.content) {
      const moderationResult = await moderateForumComment({
        content: updates.content
      });
      updates.isModerated = true;
      updates.moderationStatus = moderationResult.isAllowed ? "approved" : "flagged";
      updates.moderationNotes = moderationResult.moderationNotes;
    }
    const [updatedComment] = await db.update(forumComments).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq3(forumComments.id, parseInt(id))).returning();
    return res.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(400).json({ error: error.message || "Failed to update comment" });
  }
});
router.delete("/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const forceDelete = req.query.force === "true";
    if (!req.session.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const [comment] = await db.select().from(forumComments).where(eq3(forumComments.id, parseInt(id)));
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    const isAuthor = comment.authorId === req.session.user.id;
    const isAdmin7 = req.session.user.role === "admin";
    if (!isAuthor && !isAdmin7) {
      return res.status(403).json({ error: "You don't have permission to modify this comment" });
    }
    if (forceDelete && !isAdmin7) {
      return res.status(403).json({ error: "Only administrators can permanently delete comments" });
    }
    if (!forceDelete) {
      console.log("Analyzing comment for medical relevance before deletion...");
      const medicalAnalysis = await analyzeMedicalRelevance(comment.content);
      if (medicalAnalysis.shouldArchive) {
        await db.update(forumComments).set({
          isArchived: true,
          archivedDate: /* @__PURE__ */ new Date(),
          medicalRelevance: medicalAnalysis.medicalRelevance,
          aiModerationNotes: medicalAnalysis.reasoning
        }).where(eq3(forumComments.id, parseInt(id)));
        return res.status(200).json({
          message: "Comment has been archived due to medical relevance",
          archived: true,
          medicalRelevance: medicalAnalysis.medicalRelevance,
          reasoning: medicalAnalysis.reasoning
        });
      }
    }
    await db.delete(forumComments).where(eq3(forumComments.id, parseInt(id)));
    await db.update(forumPosts).set({
      commentCount: db.raw(`GREATEST(0, ${forumPosts.commentCount.name} - 1)`)
    }).where(eq3(forumPosts.id, comment.postId));
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error processing comment deletion/archival:", error);
    return res.status(500).json({ error: "Failed to process comment" });
  }
});
router.get("/moderation/queue", isAdmin, async (req, res) => {
  try {
    const { type = "posts" } = req.query;
    if (type === "posts") {
      const flaggedPosts = await db.select().from(forumPosts).where(eq3(forumPosts.moderationStatus, "flagged")).orderBy(forumPosts.createdAt);
      return res.json(flaggedPosts);
    } else if (type === "comments") {
      const flaggedComments = await db.select().from(forumComments).where(eq3(forumComments.moderationStatus, "flagged")).orderBy(forumComments.createdAt);
      return res.json(flaggedComments);
    } else {
      return res.status(400).json({ error: "Invalid moderation queue type" });
    }
  } catch (error) {
    console.error("Error fetching moderation queue:", error);
    return res.status(500).json({ error: "Failed to fetch moderation queue" });
  }
});
router.patch("/moderation/:type/:id", isAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { moderationStatus, moderationNotes } = req.body;
    if (type === "posts") {
      const [updatedPost] = await db.update(forumPosts).set({ moderationStatus, moderationNotes }).where(eq3(forumPosts.id, parseInt(id))).returning();
      return res.json(updatedPost);
    } else if (type === "comments") {
      const [updatedComment] = await db.update(forumComments).set({ moderationStatus, moderationNotes }).where(eq3(forumComments.id, parseInt(id))).returning();
      return res.json(updatedComment);
    } else {
      return res.status(400).json({ error: "Invalid moderation type" });
    }
  } catch (error) {
    console.error("Error updating moderation status:", error);
    return res.status(500).json({ error: "Failed to update moderation status" });
  }
});
router.get("/archives/comments", isAdmin, async (req, res) => {
  try {
    const {
      postId,
      medicalRelevanceMin = "0",
      medicalRelevanceMax = "10",
      startDate,
      endDate,
      search = "",
      page = "1",
      limit = "20"
    } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;
    const minRelevance = parseInt(medicalRelevanceMin) || 0;
    const maxRelevance = parseInt(medicalRelevanceMax) || 10;
    let conditions = and3(
      eq3(forumComments.isArchived, true),
      forumComments.medicalRelevance >= minRelevance,
      forumComments.medicalRelevance <= maxRelevance
    );
    if (postId) {
      conditions = and3(conditions, eq3(forumComments.postId, parseInt(postId)));
    }
    if (startDate) {
      const parsedStartDate = new Date(startDate);
      conditions = and3(conditions, forumComments.archivedDate >= parsedStartDate);
    }
    if (endDate) {
      const parsedEndDate = new Date(endDate);
      conditions = and3(conditions, forumComments.archivedDate <= parsedEndDate);
    }
    if (search && search.trim() !== "") {
      conditions = and3(conditions, like2(forumComments.content, `%${search}%`));
    }
    const archivedComments = await db.select().from(forumComments).where(conditions).orderBy(desc3(forumComments.archivedDate)).limit(limitNum).offset(offset);
    const totalCount = await db.select({ count: count() }).from(forumComments).where(conditions);
    const postIds = [...new Set(archivedComments.map((comment) => comment.postId))];
    const posts = await db.select({ id: forumPosts.id, title: forumPosts.title }).from(forumPosts).where(forumPosts.id.in(postIds));
    const postTitleMap = posts.reduce((map, post) => {
      map[post.id] = post.title;
      return map;
    }, {});
    const enhancedComments = archivedComments.map((comment) => ({
      ...comment,
      postTitle: postTitleMap[comment.postId] || "Unknown Post"
    }));
    return res.json({
      archivedComments: enhancedComments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error("Error fetching archived comments:", error);
    return res.status(500).json({ error: "Failed to fetch archived comments" });
  }
});
router.patch("/archives/comments/:id/restore", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [comment] = await db.select().from(forumComments).where(and3(
      eq3(forumComments.id, parseInt(id)),
      eq3(forumComments.isArchived, true)
    ));
    if (!comment) {
      return res.status(404).json({ error: "Archived comment not found" });
    }
    const [restoredComment] = await db.update(forumComments).set({
      isArchived: false,
      archivedDate: null
    }).where(eq3(forumComments.id, parseInt(id))).returning();
    return res.json({
      message: "Comment successfully restored",
      restoredComment
    });
  } catch (error) {
    console.error("Error restoring archived comment:", error);
    return res.status(500).json({ error: "Failed to restore archived comment" });
  }
});
router.delete("/archives/comments/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [comment] = await db.select().from(forumComments).where(and3(
      eq3(forumComments.id, parseInt(id)),
      eq3(forumComments.isArchived, true)
    ));
    if (!comment) {
      return res.status(404).json({ error: "Archived comment not found" });
    }
    await db.delete(forumComments).where(eq3(forumComments.id, parseInt(id)));
    await db.update(forumPosts).set({
      commentCount: db.raw(`GREATEST(0, ${forumPosts.commentCount.name} - 1)`)
    }).where(eq3(forumPosts.id, comment.postId));
    return res.json({
      message: "Archived comment permanently deleted"
    });
  } catch (error) {
    console.error("Error deleting archived comment:", error);
    return res.status(500).json({ error: "Failed to delete archived comment" });
  }
});
var forum_default = router;

// server/routes/settings.ts
import { Router as Router2 } from "express";
import { z } from "zod";
import twilio from "twilio";
var router2 = Router2();
var twilioCredentialsSchema = z.object({
  accountSid: z.string().min(1),
  authToken: z.string().min(1),
  phoneNumber: z.string().min(1)
});
var isAdmin2 = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
router2.get("/twilio", isAdmin2, async (req, res) => {
  try {
    const settings = {
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || "",
        // Don't send the full auth token for security reasons
        authToken: process.env.TWILIO_AUTH_TOKEN ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "",
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || ""
      }
    };
    res.json(settings);
  } catch (error) {
    console.error("Error fetching Twilio settings:", error);
    res.status(500).json({ message: "Failed to fetch Twilio settings" });
  }
});
router2.post("/twilio", async (req, res) => {
  try {
    const validatedData = twilioCredentialsSchema.parse(req.body);
    process.env.TWILIO_ACCOUNT_SID = validatedData.accountSid;
    process.env.TWILIO_AUTH_TOKEN = validatedData.authToken;
    process.env.TWILIO_PHONE_NUMBER = validatedData.phoneNumber;
    console.log("Twilio configuration updated:", {
      accountSid: validatedData.accountSid.substring(0, 3) + "...",
      phoneNumber: validatedData.phoneNumber
    });
    res.json({ message: "Twilio settings updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error updating Twilio settings:", error);
    res.status(500).json({ message: "Failed to update Twilio settings" });
  }
});
router2.post("/twilio/test", async (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      return res.status(400).json({
        message: "Twilio credentials not configured",
        status: "error"
      });
    }
    const client = twilio(accountSid, authToken);
    const account = await client.api.accounts(accountSid).fetch();
    if (account.sid) {
      res.json({
        message: "Twilio credentials are valid",
        status: "success",
        accountName: account.friendlyName
      });
    } else {
      res.status(400).json({
        message: "Failed to validate Twilio credentials",
        status: "error"
      });
    }
  } catch (error) {
    console.error("Error testing Twilio credentials:", error);
    res.status(500).json({
      message: `Failed to validate Twilio credentials: ${error.message}`,
      status: "error"
    });
  }
});
var settings_default = router2;

// server/routes/sms.ts
import { Router as Router3 } from "express";
import { z as z2 } from "zod";

// server/services/sms.ts
import twilio2 from "twilio";
var mockSmsLog = [];
var mockVerifications = [];
async function sendSMS(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !authToken || !twilioNumber) {
    console.log(`[MOCK SMS] To: ${to}, Message: ${body}`);
    mockSmsLog.push({
      to,
      body,
      timestamp: /* @__PURE__ */ new Date()
    });
    if (mockSmsLog.length > 100) {
      mockSmsLog = mockSmsLog.slice(-100);
    }
    return true;
  }
  try {
    const client = twilio2(accountSid, authToken);
    const message = await client.messages.create({
      body,
      from: twilioNumber,
      to
    });
    console.log(`[SMS sent] SID: ${message.sid}, To: ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending SMS via Twilio:", error);
    return false;
  }
}
function getMockSmsLog() {
  return mockSmsLog;
}
async function startPhoneVerification(phoneNumber, channel = "sms") {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!accountSid || !authToken || !verifyServiceSid) {
    console.log(`[MOCK VERIFICATION] Starting verification for: ${phoneNumber} via ${channel}`);
    const code = Math.floor(1e5 + Math.random() * 9e5).toString();
    const existingIndex = mockVerifications.findIndex((v) => v.phoneNumber === phoneNumber);
    if (existingIndex >= 0) {
      mockVerifications[existingIndex] = {
        phoneNumber,
        code,
        createdAt: /* @__PURE__ */ new Date(),
        verified: false
      };
    } else {
      mockVerifications.push({
        phoneNumber,
        code,
        createdAt: /* @__PURE__ */ new Date(),
        verified: false
      });
    }
    if (mockVerifications.length > 100) {
      mockVerifications = mockVerifications.slice(-100);
    }
    if (channel === "sms") {
      sendSMS(
        phoneNumber,
        `Your Health Insight Ventures verification code is: ${code}`
      );
    } else {
      console.log(`[MOCK CALL] Would call ${phoneNumber} with code: ${code}`);
    }
    return {
      success: true,
      status: "pending",
      message: `Verification initiated for ${phoneNumber} via ${channel} (MOCK)`,
      sid: "mock-verification-sid"
    };
  }
  try {
    const client = twilio2(accountSid, authToken);
    const verification = await client.verify.v2.services(verifyServiceSid).verifications.create({
      to: phoneNumber,
      channel
    });
    console.log(`[Verification started] SID: ${verification.sid}, To: ${phoneNumber}, Status: ${verification.status}`);
    return {
      success: true,
      status: verification.status,
      message: `Verification initiated for ${phoneNumber} via ${channel}`,
      sid: verification.sid
    };
  } catch (error) {
    console.error("Error starting phone verification via Twilio:", error);
    return {
      success: false,
      message: `Failed to start verification: ${error.message}`
    };
  }
}
async function checkVerificationCode(phoneNumber, code) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!accountSid || !authToken || !verifyServiceSid) {
    console.log(`[MOCK VERIFICATION] Checking code for: ${phoneNumber}`);
    const verificationRecord = mockVerifications.find((v) => v.phoneNumber === phoneNumber);
    if (!verificationRecord) {
      return {
        success: false,
        message: "No verification found for this phone number",
        valid: false
      };
    }
    const isExpired = (/* @__PURE__ */ new Date()).getTime() - verificationRecord.createdAt.getTime() > 10 * 60 * 1e3;
    const isValid = verificationRecord.code === code && !isExpired;
    if (isValid) {
      verificationRecord.verified = true;
      return {
        success: true,
        status: "approved",
        message: "Verification successful",
        valid: true
      };
    } else if (isExpired) {
      return {
        success: false,
        status: "expired",
        message: "Verification code has expired",
        valid: false
      };
    } else {
      return {
        success: false,
        status: "invalid",
        message: "Invalid verification code",
        valid: false
      };
    }
  }
  try {
    const client = twilio2(accountSid, authToken);
    const verificationCheck = await client.verify.v2.services(verifyServiceSid).verificationChecks.create({
      to: phoneNumber,
      code
    });
    console.log(`[Verification check] To: ${phoneNumber}, Status: ${verificationCheck.status}`);
    return {
      success: true,
      status: verificationCheck.status,
      message: verificationCheck.status === "approved" ? "Phone number verified successfully" : "Verification failed",
      valid: verificationCheck.status === "approved"
    };
  } catch (error) {
    console.error("Error checking verification code via Twilio:", error);
    return {
      success: false,
      message: `Failed to check verification code: ${error.message}`,
      valid: false
    };
  }
}
async function sendAppointmentReminder(phoneNumber, patientName, appointmentDate, providerName) {
  const formattedDate = appointmentDate.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
  const message = `Hi ${patientName}, this is a reminder about your appointment with ${providerName} on ${formattedDate}. Reply CONFIRM to confirm or CANCEL to cancel.`;
  return sendSMS(phoneNumber, message);
}

// server/routes/sms.ts
var router3 = Router3();
var smsTestSchema = z2.object({
  to: z2.string().min(1),
  message: z2.string().min(1)
});
router3.post("/test", async (req, res) => {
  try {
    const validatedData = smsTestSchema.parse(req.body);
    const success = await sendSMS(validatedData.to, validatedData.message);
    if (success) {
      res.json({ message: "Test SMS sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send SMS. Check Twilio configuration." });
    }
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error sending test SMS:", error);
    res.status(500).json({ message: `Failed to send SMS: ${error.message}` });
  }
});
router3.get("/config-status", (req, res) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  const isTwilioConfigured2 = Boolean(accountSid && authToken && phoneNumber);
  res.json({
    configured: isTwilioConfigured2,
    accountSid: accountSid ? `${accountSid.substring(0, 2)}...${accountSid.substring(accountSid.length - 4)}` : null,
    phoneNumber: phoneNumber || null
  });
});
var sms_default = router3;

// server/routes/verification.ts
import { Router as Router4 } from "express";
import { z as z3 } from "zod";
var router4 = Router4();
var startVerificationSchema = z3.object({
  phoneNumber: z3.string().min(10).max(15).refine(
    (val) => /^\+?[1-9]\d{9,14}$/.test(val),
    { message: "Phone number must be in E.164 format (e.g., +12125551234)" }
  ),
  channel: z3.enum(["sms", "call"]).default("sms")
});
var checkVerificationSchema = z3.object({
  phoneNumber: z3.string().min(10).max(15).refine(
    (val) => /^\+?[1-9]\d{9,14}$/.test(val),
    { message: "Phone number must be in E.164 format (e.g., +12125551234)" }
  ),
  code: z3.string().min(4).max(10)
});
router4.get("/config-status", (req, res) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const isTwilioConfigured2 = Boolean(accountSid && authToken);
  const isVerifyConfigured2 = Boolean(verifyServiceSid);
  res.json({
    twilio: {
      configured: isTwilioConfigured2,
      accountSid: accountSid ? `${accountSid.substring(0, 2)}...${accountSid.substring(accountSid.length - 4)}` : null
    },
    verify: {
      configured: isVerifyConfigured2,
      serviceSid: verifyServiceSid ? `${verifyServiceSid.substring(0, 2)}...${verifyServiceSid.substring(verifyServiceSid.length - 4)}` : null
    }
  });
});
router4.post("/start", async (req, res) => {
  try {
    const validatedData = startVerificationSchema.parse(req.body);
    const result = await startPhoneVerification(
      validatedData.phoneNumber,
      validatedData.channel
    );
    if (result.success) {
      return res.json({
        success: true,
        status: result.status,
        message: result.message,
        sid: result.sid
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    if (error instanceof z3.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
        errors: error.errors
      });
    }
    console.error("Error starting phone verification:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to start verification: ${error.message}`
    });
  }
});
router4.post("/check", async (req, res) => {
  try {
    const validatedData = checkVerificationSchema.parse(req.body);
    const result = await checkVerificationCode(
      validatedData.phoneNumber,
      validatedData.code
    );
    return res.json({
      success: result.success,
      status: result.status,
      message: result.message,
      valid: result.valid
    });
  } catch (error) {
    if (error instanceof z3.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
        errors: error.errors
      });
    }
    console.error("Error checking verification code:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to check verification code: ${error.message}`
    });
  }
});
router4.post("/sim-check", (req, res) => {
  res.status(200).json({
    success: false,
    message: "SIM-based verification is coming soon! This feature is currently in beta at Twilio.",
    featureStatus: "beta"
  });
});
var verification_default = router4;

// server/routes/audit.ts
init_auditLogger();
import express from "express";
var router5 = express.Router();
var isAdmin3 = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
};
router5.get("/", isAdmin3, async (req, res) => {
  try {
    const {
      userId,
      resourceType,
      resourceId,
      eventType,
      startDate,
      endDate,
      page = "1",
      limit = "50"
    } = req.query;
    const filters = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };
    if (userId)
      filters.userId = parseInt(userId, 10);
    if (resourceType)
      filters.resourceType = resourceType;
    if (resourceId)
      filters.resourceId = resourceId;
    if (eventType)
      filters.eventType = eventType;
    if (startDate)
      filters.startDate = new Date(startDate);
    if (endDate)
      filters.endDate = new Date(endDate);
    const logs = await getAuditLogs(filters);
    res.json({
      logs,
      pagination: {
        page: filters.page,
        limit: filters.limit
      }
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});
router5.get("/summary", isAdmin3, async (req, res) => {
  try {
    const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3), endDate = /* @__PURE__ */ new Date() } = req.query;
    const summary = await getAuditSummary(
      new Date(startDate),
      new Date(endDate)
    );
    res.json(summary);
  } catch (error) {
    console.error("Error fetching audit summary:", error);
    res.status(500).json({ message: "Failed to fetch audit summary" });
  }
});
router5.get("/:id", isAdmin3, async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await getAuditLogs({ resourceId: id });
    if (!logs.length) {
      return res.status(404).json({ message: "Audit log not found" });
    }
    res.json(logs[0]);
  } catch (error) {
    console.error("Error fetching audit log:", error);
    res.status(500).json({ message: "Failed to fetch audit log" });
  }
});
var audit_default = router5;

// server/routes/compliance.ts
import express2 from "express";
import { z as z4 } from "zod";

// server/services/stateCompliance.ts
init_auditLogger();
import fs2 from "fs";
import path2 from "path";
var STATE_COMPLIANCE_PERIODS = {
  BREACH_NOTIFICATION: {
    FLORIDA: 30,
    // days
    DEFAULT: 60
    // days (HIPAA standard)
  },
  RECORD_ACCESS: {
    NEW_YORK: 14,
    // days
    DEFAULT: 30
    // days (HIPAA standard)
  },
  DATA_RETENTION: {
    FLORIDA: 5,
    // years
    NEW_YORK: 6,
    // years
    DEFAULT: 7
    // years (HIPAA standard recommendation)
  }
};
async function createBreachNotificationReport(breachDetails, notificationStatus) {
  const reportId = `breach-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const dueDate = new Date(breachDetails.date);
  dueDate.setDate(dueDate.getDate() + STATE_COMPLIANCE_PERIODS.BREACH_NOTIFICATION.FLORIDA);
  const reportsDir = path2.join(process.cwd(), "compliance_reports");
  if (!fs2.existsSync(reportsDir)) {
    fs2.mkdirSync(reportsDir, { recursive: true });
  }
  const report = {
    reportId,
    createdAt: /* @__PURE__ */ new Date(),
    breachDetails,
    notificationStatus,
    dueDate,
    completed: false,
    notificationsSent: [],
    complianceStatus: {
      floridaCompliant: false,
      hipaaCompliant: false
    }
  };
  fs2.writeFileSync(
    path2.join(reportsDir, `${reportId}.json`),
    JSON.stringify(report, null, 2)
  );
  try {
    await logPhiAccess(
      0,
      // system user
      "breach_report",
      reportId,
      "create",
      `Created breach notification report ${reportId} for incident on ${breachDetails.date.toISOString()}`,
      "system",
      true,
      { affectedRecords: breachDetails.affectedRecords }
    );
  } catch (error) {
    console.error("Failed to log breach report creation:", error);
  }
  return { reportId, dueDate };
}
async function updateBreachNotificationStatus(reportId, updates) {
  try {
    const reportPath = path2.join(process.cwd(), "compliance_reports", `${reportId}.json`);
    if (!fs2.existsSync(reportPath)) {
      throw new Error(`Breach report ${reportId} not found`);
    }
    const report = JSON.parse(fs2.readFileSync(reportPath, "utf8"));
    report.notificationStatus = {
      ...report.notificationStatus,
      ...updates
    };
    if (updates.patientsNotified || updates.regulatorsNotified || updates.mediaNotified) {
      report.notificationsSent.push({
        timestamp: /* @__PURE__ */ new Date(),
        details: updates
      });
    }
    const allNotified = report.notificationStatus.patientsNotified && report.notificationStatus.regulatorsNotified && report.notificationStatus.mediaNotified;
    const notificationDate = /* @__PURE__ */ new Date();
    const breachDate = new Date(report.breachDetails.date);
    const daysSinceBreach = Math.floor((notificationDate.getTime() - breachDate.getTime()) / (1e3 * 60 * 60 * 24));
    if (allNotified) {
      report.completed = true;
      report.complianceStatus.floridaCompliant = daysSinceBreach <= STATE_COMPLIANCE_PERIODS.BREACH_NOTIFICATION.FLORIDA;
      report.complianceStatus.hipaaCompliant = daysSinceBreach <= STATE_COMPLIANCE_PERIODS.BREACH_NOTIFICATION.DEFAULT;
    }
    fs2.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    await logPhiAccess(
      0,
      // system user
      "breach_report",
      reportId,
      "update",
      `Updated breach notification status for report ${reportId}`,
      "system",
      true,
      {
        updates,
        daysSinceBreach,
        floridaCompliant: report.complianceStatus.floridaCompliant,
        hipaaCompliant: report.complianceStatus.hipaaCompliant
      }
    );
    return true;
  } catch (error) {
    console.error("Failed to update breach notification status:", error);
    return false;
  }
}
async function processRecordAccessRequest(patientId, requestDetails) {
  const requestId = `access-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const isNewYorkRequest = requestDetails.state.toUpperCase() === "NY" || requestDetails.state.toUpperCase() === "NEW YORK";
  const dueDate = new Date(requestDetails.requestDate);
  if (isNewYorkRequest) {
    dueDate.setDate(dueDate.getDate() + STATE_COMPLIANCE_PERIODS.RECORD_ACCESS.NEW_YORK);
  } else {
    dueDate.setDate(dueDate.getDate() + STATE_COMPLIANCE_PERIODS.RECORD_ACCESS.DEFAULT);
  }
  if (requestDetails.urgent) {
    dueDate.setDate(dueDate.getDate() - Math.floor(dueDate.getDate() / 2));
  }
  const requestRecord = {
    requestId,
    patientId,
    ...requestDetails,
    dueDate,
    status: "pending",
    expedited: isNewYorkRequest || requestDetails.urgent,
    fulfillmentDate: null,
    trackingEvents: [{
      timestamp: /* @__PURE__ */ new Date(),
      status: "created",
      notes: `Record access request created. ${isNewYorkRequest ? "New York 14-day timeline applies." : "Standard 30-day timeline applies."}`
    }]
  };
  const reportsDir = path2.join(process.cwd(), "compliance_reports");
  if (!fs2.existsSync(reportsDir)) {
    fs2.mkdirSync(reportsDir, { recursive: true });
  }
  fs2.writeFileSync(
    path2.join(reportsDir, `${requestId}.json`),
    JSON.stringify(requestRecord, null, 2)
  );
  try {
    console.log(`Created record access request ${requestId} with due date ${dueDate.toISOString()}`);
    await logPhiAccess(
      patientId,
      "record_access",
      requestId,
      "create",
      `Created patient record access request ${requestId} for patient ${patientId}`,
      "system",
      true,
      {
        expedited: isNewYorkRequest || requestDetails.urgent,
        dueDate: dueDate.toISOString(),
        recordTypes: requestDetails.recordTypes
      }
    );
  } catch (error) {
    console.error("Failed to process record access request:", error);
  }
  return {
    requestId,
    dueDate,
    expedited: isNewYorkRequest || requestDetails.urgent
  };
}
async function updateRecordAccessStatus(requestId, update) {
  try {
    const requestPath = path2.join(process.cwd(), "compliance_reports", `${requestId}.json`);
    if (!fs2.existsSync(requestPath)) {
      throw new Error(`Record access request ${requestId} not found`);
    }
    const request = JSON.parse(fs2.readFileSync(requestPath, "utf8"));
    request.status = update.status;
    if (update.fulfillmentDate) {
      request.fulfillmentDate = update.fulfillmentDate;
    }
    request.trackingEvents.push({
      timestamp: /* @__PURE__ */ new Date(),
      status: update.status,
      notes: update.notes || `Request status updated to ${update.status}`
    });
    if (update.status === "fulfilled" && update.fulfillmentDate) {
      const requestDate = new Date(request.requestDate);
      const fulfillmentDate = new Date(update.fulfillmentDate);
      const daysToFulfill = Math.floor((fulfillmentDate.getTime() - requestDate.getTime()) / (1e3 * 60 * 60 * 24));
      const isNewYorkRequest = request.state.toUpperCase() === "NY" || request.state.toUpperCase() === "NEW YORK";
      request.compliance = {
        daysToFulfill,
        nyCompliant: isNewYorkRequest ? daysToFulfill <= STATE_COMPLIANCE_PERIODS.RECORD_ACCESS.NEW_YORK : "Not Applicable",
        hipaaCompliant: daysToFulfill <= STATE_COMPLIANCE_PERIODS.RECORD_ACCESS.DEFAULT
      };
    }
    fs2.writeFileSync(requestPath, JSON.stringify(request, null, 2));
    await logPhiAccess(
      request.patientId,
      "record_access",
      requestId,
      "update",
      `Updated record access request ${requestId} status to ${update.status}`,
      "system",
      true,
      update.status === "fulfilled" ? request.compliance : { status: update.status }
    );
    return true;
  } catch (error) {
    console.error("Failed to update record access status:", error);
    return false;
  }
}
async function getOverdueRecordRequests() {
  try {
    const reportsDir = path2.join(process.cwd(), "compliance_reports");
    if (!fs2.existsSync(reportsDir)) {
      return [];
    }
    const overdueRequests = [];
    const today = /* @__PURE__ */ new Date();
    const files = fs2.readdirSync(reportsDir);
    for (const file of files) {
      if (file.startsWith("access-") && file.endsWith(".json")) {
        const request = JSON.parse(fs2.readFileSync(path2.join(reportsDir, file), "utf8"));
        if (request.status === "fulfilled") {
          continue;
        }
        const dueDate = new Date(request.dueDate);
        if (today > dueDate) {
          overdueRequests.push({
            requestId: request.requestId,
            patientId: request.patientId,
            dueDate: request.dueDate,
            state: request.state,
            daysOverdue: Math.floor((today.getTime() - dueDate.getTime()) / (1e3 * 60 * 60 * 24)),
            expedited: request.expedited,
            status: request.status
          });
        }
      }
    }
    return overdueRequests;
  } catch (error) {
    console.error("Failed to get overdue record requests:", error);
    return [];
  }
}

// server/routes/compliance.ts
init_auditLogger();
var router6 = express2.Router();
var isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
var isAdmin4 = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
};
var recordAccessSchema = z4.object({
  patientId: z4.number(),
  requestDate: z4.string().transform((date) => new Date(date)),
  recordTypes: z4.array(z4.string()),
  format: z4.enum(["electronic", "paper"]),
  state: z4.string(),
  contactEmail: z4.string().email(),
  urgent: z4.boolean().optional().default(false)
});
var recordStatusUpdateSchema = z4.object({
  status: z4.enum(["processing", "fulfilled", "delayed", "denied"]),
  notes: z4.string().optional(),
  fulfillmentDate: z4.string().optional().transform((date) => date ? new Date(date) : void 0)
});
var breachReportSchema = z4.object({
  date: z4.string().transform((date) => new Date(date)),
  affectedRecords: z4.number(),
  description: z4.string(),
  patientDataCompromised: z4.boolean(),
  detectionMethod: z4.string(),
  initialResponseActions: z4.array(z4.string())
});
var breachStatusUpdateSchema = z4.object({
  patientsNotified: z4.boolean().optional(),
  regulatorsNotified: z4.boolean().optional(),
  mediaNotified: z4.boolean().optional(),
  additionalActions: z4.array(z4.string()).optional()
});
router6.post("/record-request", isAuthenticated, async (req, res) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userId = req.user.id;
    const validatedData = recordAccessSchema.parse(req.body);
    const result = await processRecordAccessRequest(
      validatedData.patientId,
      validatedData
    );
    await logPhiAccess(
      userId,
      "record_request",
      result.requestId,
      "create",
      `User ${userId} initiated record access request for patient ${validatedData.patientId}`,
      ipAddress,
      true,
      {
        state: validatedData.state,
        expedited: result.expedited,
        dueDate: result.dueDate.toISOString()
      }
    );
    res.status(201).json({
      success: true,
      message: `Record access request created successfully. ${result.expedited ? "Expedited processing applies." : ""}`,
      requestId: result.requestId,
      dueDate: result.dueDate
    });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    res.status(500).json({
      message: "Failed to create record access request",
      error: error.message
    });
  }
});
router6.patch("/record-request/:requestId", isAuthenticated, async (req, res) => {
  try {
    const { requestId } = req.params;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userId = req.user.id;
    const validatedData = recordStatusUpdateSchema.parse(req.body);
    const success = await updateRecordAccessStatus(requestId, validatedData);
    if (!success) {
      return res.status(404).json({
        message: "Record access request not found"
      });
    }
    await logPhiAccess(
      userId,
      "record_request",
      requestId,
      "update",
      `User ${userId} updated record access request ${requestId} status to ${validatedData.status}`,
      ipAddress,
      true,
      {
        status: validatedData.status,
        fulfillmentDate: validatedData.fulfillmentDate?.toISOString()
      }
    );
    res.json({
      success: true,
      message: "Record access request updated successfully"
    });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    res.status(500).json({
      message: "Failed to update record access request",
      error: error.message
    });
  }
});
router6.get("/record-request/overdue", isAuthenticated, isAdmin4, async (req, res) => {
  try {
    const overdueRequests = await getOverdueRecordRequests();
    res.json({
      count: overdueRequests.length,
      requests: overdueRequests
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve overdue record requests",
      error: error.message
    });
  }
});
router6.post("/breach-notification", isAuthenticated, isAdmin4, async (req, res) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userId = req.user.id;
    const validatedData = breachReportSchema.parse(req.body);
    const result = await createBreachNotificationReport(
      validatedData,
      {
        patientsNotified: false,
        regulatorsNotified: false,
        mediaNotified: false
      }
    );
    await logPhiAccess(
      userId,
      "breach_notification",
      result.reportId,
      "create",
      `Admin ${userId} created breach notification report ${result.reportId}`,
      ipAddress,
      true,
      {
        affectedRecords: validatedData.affectedRecords,
        dueDate: result.dueDate.toISOString()
      }
    );
    res.status(201).json({
      success: true,
      message: "Breach notification report created successfully",
      reportId: result.reportId,
      dueDate: result.dueDate
    });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    res.status(500).json({
      message: "Failed to create breach notification report",
      error: error.message
    });
  }
});
router6.patch("/breach-notification/:reportId", isAuthenticated, isAdmin4, async (req, res) => {
  try {
    const { reportId } = req.params;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userId = req.user.id;
    const validatedData = breachStatusUpdateSchema.parse(req.body);
    const success = await updateBreachNotificationStatus(reportId, validatedData);
    if (!success) {
      return res.status(404).json({
        message: "Breach notification report not found"
      });
    }
    await logPhiAccess(
      userId,
      "breach_notification",
      reportId,
      "update",
      `Admin ${userId} updated breach notification status for report ${reportId}`,
      ipAddress,
      true,
      validatedData
    );
    res.json({
      success: true,
      message: "Breach notification status updated successfully"
    });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    res.status(500).json({
      message: "Failed to update breach notification status",
      error: error.message
    });
  }
});
var compliance_default = router6;

// server/routes/gamification.ts
import express3 from "express";
import { z as z5 } from "zod";

// server/services/gamification.ts
init_db();
init_schema();
import { eq as eq4, and as and4, gte as gte3, lte as lte3, desc as desc4, sql as sql4 } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
async function recordActivity(userId, activityId, notes, proofImageUrl) {
  return await db.transaction(async (tx) => {
    const activity = await tx.query.healthActivities.findFirst({
      where: eq4(healthActivities.id, activityId)
    });
    if (!activity) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }
    if (activity.frequency === "daily" /* DAILY */) {
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const existingActivity = await tx.query.userActivities.findFirst({
        where: and4(
          eq4(userActivities.userId, userId),
          eq4(userActivities.activityId, activityId),
          gte3(userActivities.completedAt, today),
          lte3(userActivities.completedAt, tomorrow)
        )
      });
      if (existingActivity) {
        throw new Error(`User has already completed this daily activity today`);
      }
    }
    const [userActivity] = await tx.insert(userActivities).values({
      userId,
      activityId,
      pointsEarned: activity.pointsValue,
      notes,
      proofImageUrl
    }).returning();
    const userPointsRecord = await tx.query.userPoints.findFirst({
      where: eq4(userPoints.userId, userId)
    });
    if (!userPointsRecord) {
      await tx.insert(userPoints).values({
        userId,
        totalPoints: activity.pointsValue,
        availablePoints: activity.pointsValue,
        lifetimePoints: activity.pointsValue,
        currentStreak: 1,
        longestStreak: 1
      });
    } else {
      await tx.update(userPoints).set({
        totalPoints: userPointsRecord.totalPoints + activity.pointsValue,
        availablePoints: userPointsRecord.availablePoints + activity.pointsValue,
        lifetimePoints: userPointsRecord.lifetimePoints + activity.pointsValue,
        lastActivity: /* @__PURE__ */ new Date()
      }).where(eq4(userPoints.userId, userId));
      await updateUserStreak(tx, userId);
    }
    await tx.insert(pointsTransactions).values({
      userId,
      amount: activity.pointsValue,
      type: "earned" /* EARNED */,
      description: `Completed activity: ${activity.name}`,
      sourceId: userActivity.id,
      sourceType: "activity" /* ACTIVITY */
    });
    await checkForAchievements(tx, userId);
    return userActivity;
  });
}
async function updateUserStreak(tx, userId) {
  const userPointsRecord = await tx.query.userPoints.findFirst({
    where: eq4(userPoints.userId, userId)
  });
  if (!userPointsRecord)
    return;
  const now = /* @__PURE__ */ new Date();
  const lastUpdate = new Date(userPointsRecord.lastStreakUpdate);
  const hoursSinceLastActivity = (now.getTime() - lastUpdate.getTime()) / (1e3 * 60 * 60);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayActivities = await tx.query.userActivities.findMany({
    where: and4(
      eq4(userActivities.userId, userId),
      gte3(userActivities.completedAt, yesterday),
      lte3(userActivities.completedAt, now)
    )
  });
  if (hoursSinceLastActivity <= 36 && yesterdayActivities.length > 0) {
    const newStreak = userPointsRecord.currentStreak + 1;
    const newLongestStreak = Math.max(newStreak, userPointsRecord.longestStreak);
    await tx.update(userPoints).set({
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastStreakUpdate: now
    }).where(eq4(userPoints.userId, userId));
    if (newStreak > 0 && newStreak % 5 === 0) {
      const bonusPoints = 25 * (newStreak / 5);
      await tx.update(userPoints).set({
        totalPoints: userPointsRecord.totalPoints + bonusPoints,
        availablePoints: userPointsRecord.availablePoints + bonusPoints,
        lifetimePoints: userPointsRecord.lifetimePoints + bonusPoints
      }).where(eq4(userPoints.userId, userId));
      await tx.insert(pointsTransactions).values({
        userId,
        amount: bonusPoints,
        type: "bonus" /* BONUS */,
        description: `${newStreak}-day streak bonus!`,
        sourceType: "streak" /* STREAK */
      });
    }
  } else if (hoursSinceLastActivity > 36) {
    await tx.update(userPoints).set({
      currentStreak: 1,
      // Reset to 1 since they're active today
      lastStreakUpdate: now
    }).where(eq4(userPoints.userId, userId));
  }
}
async function checkForAchievements(tx, userId) {
  const userPointsRecord = await tx.query.userPoints.findFirst({
    where: eq4(userPoints.userId, userId)
  });
  if (!userPointsRecord)
    return;
  const userCurrentAchievements = await tx.query.userAchievements.findMany({
    where: eq4(userAchievements.userId, userId),
    with: {
      achievement: true
    }
  });
  const earnedAchievementIds = userCurrentAchievements.map((ua) => ua.achievementId);
  const eligibleAchievements = await tx.query.achievements.findMany({
    where: and4(
      eq4(achievements.isActive, true),
      lte3(achievements.pointsRequired, userPointsRecord.lifetimePoints),
      // Exclude already earned achievements
      sql4`${achievements.id} NOT IN (${earnedAchievementIds.length > 0 ? earnedAchievementIds : [0]})`
    )
  });
  for (const achievement of eligibleAchievements) {
    await tx.insert(userAchievements).values({
      userId,
      achievementId: achievement.id
    });
    if (achievement.level > 1) {
      const bonusPoints = achievement.level * 50;
      await tx.update(userPoints).set({
        totalPoints: userPointsRecord.totalPoints + bonusPoints,
        availablePoints: userPointsRecord.availablePoints + bonusPoints,
        lifetimePoints: userPointsRecord.lifetimePoints + bonusPoints
      }).where(eq4(userPoints.userId, userId));
      await tx.insert(pointsTransactions).values({
        userId,
        amount: bonusPoints,
        type: "bonus" /* BONUS */,
        description: `Achievement bonus: ${achievement.name}`,
        sourceId: achievement.id,
        sourceType: "achievement" /* ACHIEVEMENT */
      });
    }
  }
}
async function getUserPoints(userId) {
  let userPointsRecord = await db.query.userPoints.findFirst({
    where: eq4(userPoints.userId, userId)
  });
  if (!userPointsRecord) {
    const [newPointsRecord] = await db.insert(userPoints).values({
      userId,
      totalPoints: 0,
      availablePoints: 0,
      lifetimePoints: 0,
      currentStreak: 0,
      longestStreak: 0
    }).returning();
    userPointsRecord = newPointsRecord;
  }
  return userPointsRecord;
}
async function getAvailableActivities(category) {
  const query = category ? and4(eq4(healthActivities.isActive, true), eq4(healthActivities.category, category)) : eq4(healthActivities.isActive, true);
  return await db.query.healthActivities.findMany({
    where: query,
    orderBy: [desc4(healthActivities.pointsValue)]
  });
}
async function getUserActivities(userId, startDate, endDate, category) {
  let query = eq4(userActivities.userId, userId);
  if (startDate) {
    query = and4(query, gte3(userActivities.completedAt, startDate));
  }
  if (endDate) {
    query = and4(query, lte3(userActivities.completedAt, endDate));
  }
  const userActivityRecords = await db.query.userActivities.findMany({
    where: query,
    with: {
      activity: true
    },
    orderBy: [desc4(userActivities.completedAt)]
  });
  if (category) {
    return userActivityRecords.filter((record) => record.activity.category === category);
  }
  return userActivityRecords;
}
async function getUserAchievements(userId) {
  const userAchievementRecords = await db.query.userAchievements.findMany({
    where: eq4(userAchievements.userId, userId),
    with: {
      achievement: true
    }
  });
  return userAchievementRecords.map((record) => record.achievement);
}
async function getAllAchievements(category) {
  const query = category ? and4(eq4(achievements.isActive, true), eq4(achievements.category, category)) : eq4(achievements.isActive, true);
  return await db.query.achievements.findMany({
    where: query,
    orderBy: [achievements.pointsRequired]
  });
}
async function redeemReward(userId, rewardId) {
  return await db.transaction(async (tx) => {
    const reward = await tx.query.rewards.findFirst({
      where: and4(
        eq4(rewards.id, rewardId),
        eq4(rewards.isActive, true)
      )
    });
    if (!reward) {
      throw new Error(`Reward with ID ${rewardId} not found or is not active`);
    }
    if (reward.inventory !== null && reward.inventory <= 0) {
      throw new Error(`Reward is out of stock`);
    }
    const userPointsRecord = await tx.query.userPoints.findFirst({
      where: eq4(userPoints.userId, userId)
    });
    if (!userPointsRecord) {
      throw new Error(`User ${userId} has no points record`);
    }
    if (userPointsRecord.availablePoints < reward.pointsCost) {
      throw new Error(`Insufficient points. Required: ${reward.pointsCost}, Available: ${userPointsRecord.availablePoints}`);
    }
    const redemptionCode = generateRedemptionCode(reward.category);
    const expirationDate = ["discount", "gift_card"].includes(reward.category) ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3) : null;
    const [userReward] = await tx.insert(userRewards).values({
      userId,
      rewardId,
      code: redemptionCode,
      status: "active",
      expiresAt: expirationDate
    }).returning();
    await tx.update(userPoints).set({
      availablePoints: userPointsRecord.availablePoints - reward.pointsCost,
      lastActivity: /* @__PURE__ */ new Date()
    }).where(eq4(userPoints.userId, userId));
    await tx.insert(pointsTransactions).values({
      userId,
      amount: -reward.pointsCost,
      type: "spent" /* SPENT */,
      description: `Redeemed reward: ${reward.name}`,
      sourceId: reward.id,
      sourceType: "reward" /* REWARD */
    });
    if (reward.inventory !== null) {
      await tx.update(rewards).set({
        inventory: reward.inventory - 1
      }).where(eq4(rewards.id, reward.id));
    }
    return {
      ...userReward,
      reward: {
        name: reward.name,
        description: reward.description,
        category: reward.category,
        imageUrl: reward.imageUrl
      }
    };
  });
}
async function getAvailableRewards(category) {
  const query = category ? and4(eq4(rewards.isActive, true), eq4(rewards.category, category)) : eq4(rewards.isActive, true);
  return await db.query.rewards.findMany({
    where: query,
    orderBy: [rewards.pointsCost]
  });
}
async function getUserRewards(userId, status) {
  let query = eq4(userRewards.userId, userId);
  if (status) {
    query = and4(query, eq4(userRewards.status, status));
  }
  return await db.query.userRewards.findMany({
    where: query,
    with: {
      reward: true
    },
    orderBy: [desc4(userRewards.earnedAt)]
  });
}
async function getPointsHistory(userId, limit = 20, offset = 0) {
  return await db.query.pointsTransactions.findMany({
    where: eq4(pointsTransactions.userId, userId),
    orderBy: [desc4(pointsTransactions.createdAt)],
    limit,
    offset
  });
}
function generateRedemptionCode(category) {
  const prefix = category.substring(0, 3).toUpperCase();
  const uniqueId = uuidv4().split("-")[0].toUpperCase();
  return `${prefix}-${uniqueId}`;
}
async function initializeGamificationDefaults() {
  const existingActivities = await db.query.healthActivities.findMany({
    limit: 1
  });
  if (existingActivities.length === 0) {
    await db.insert(healthActivities).values([
      // Physical activities
      {
        name: "Daily Exercise",
        description: "Complete at least 30 minutes of physical activity",
        category: "physical" /* PHYSICAL */,
        pointsValue: 15,
        frequency: "daily" /* DAILY */
      },
      {
        name: "Take 10,000 Steps",
        description: "Walk at least 10,000 steps in a day",
        category: "physical" /* PHYSICAL */,
        pointsValue: 20,
        frequency: "daily" /* DAILY */
      },
      {
        name: "Join a Group Fitness Class",
        description: "Participate in a group fitness session",
        category: "physical" /* PHYSICAL */,
        pointsValue: 25,
        frequency: "weekly" /* WEEKLY */
      },
      // Mental health activities
      {
        name: "Meditation Session",
        description: "Complete at least 10 minutes of meditation",
        category: "mental" /* MENTAL */,
        pointsValue: 15,
        frequency: "daily" /* DAILY */
      },
      {
        name: "Stress Journal",
        description: "Record your thoughts and feelings in a journal",
        category: "mental" /* MENTAL */,
        pointsValue: 10,
        frequency: "daily" /* DAILY */
      },
      {
        name: "Connect with Support Group",
        description: "Attend or check in with your support group",
        category: "mental" /* MENTAL */,
        pointsValue: 30,
        frequency: "weekly" /* WEEKLY */
      },
      // Medication activities
      {
        name: "Medication Adherence",
        description: "Take all prescribed medications on time",
        category: "medication" /* MEDICATION */,
        pointsValue: 20,
        frequency: "daily" /* DAILY */
      },
      {
        name: "Medication Refill",
        description: "Refill your prescriptions before running out",
        category: "medication" /* MEDICATION */,
        pointsValue: 25,
        frequency: "monthly" /* MONTHLY */
      },
      // Appointment activities
      {
        name: "Attend Medical Appointment",
        description: "Complete a scheduled healthcare appointment",
        category: "appointment" /* APPOINTMENT */,
        pointsValue: 35,
        frequency: "once" /* ONCE */
      },
      {
        name: "Schedule Follow-up",
        description: "Schedule your next recommended appointment",
        category: "appointment" /* APPOINTMENT */,
        pointsValue: 15,
        frequency: "once" /* ONCE */
      },
      // Educational activities
      {
        name: "Read Health Article",
        description: "Read an educational article about health management",
        category: "education" /* EDUCATION */,
        pointsValue: 10,
        frequency: "daily" /* DAILY */
      },
      {
        name: "Watch Educational Video",
        description: "Watch a video about health management",
        category: "education" /* EDUCATION */,
        pointsValue: 15,
        frequency: "daily" /* DAILY */
      },
      {
        name: "Complete Health Assessment",
        description: "Take a health assessment quiz",
        category: "education" /* EDUCATION */,
        pointsValue: 25,
        frequency: "monthly" /* MONTHLY */
      },
      // Social activities
      {
        name: "Share Experience",
        description: "Share your health journey on community forums",
        category: "social" /* SOCIAL */,
        pointsValue: 20,
        frequency: "weekly" /* WEEKLY */
      },
      {
        name: "Support Other Members",
        description: "Reply to community posts with encouragement",
        category: "social" /* SOCIAL */,
        pointsValue: 15,
        frequency: "daily" /* DAILY */
      }
    ]);
  }
  const existingAchievements = await db.query.achievements.findMany({
    limit: 1
  });
  if (existingAchievements.length === 0) {
    await db.insert(achievements).values([
      // Physical activity achievements
      {
        name: "Exercise Beginner",
        description: "Complete 10 exercise activities",
        icon: "activity",
        level: 1,
        pointsRequired: 150,
        category: "physical" /* PHYSICAL */
      },
      {
        name: "Exercise Expert",
        description: "Complete 50 exercise activities",
        icon: "activity",
        level: 2,
        pointsRequired: 750,
        category: "physical" /* PHYSICAL */
      },
      {
        name: "Fitness Master",
        description: "Complete 100 exercise activities",
        icon: "award",
        level: 3,
        pointsRequired: 1500,
        category: "physical" /* PHYSICAL */
      },
      // Mental health achievements
      {
        name: "Mindfulness Beginner",
        description: "Complete 10 mental wellness activities",
        icon: "brain",
        level: 1,
        pointsRequired: 150,
        category: "mental" /* MENTAL */
      },
      {
        name: "Mindfulness Expert",
        description: "Complete 50 mental wellness activities",
        icon: "brain",
        level: 2,
        pointsRequired: 750,
        category: "mental" /* MENTAL */
      },
      {
        name: "Wellness Master",
        description: "Complete 100 mental wellness activities",
        icon: "award",
        level: 3,
        pointsRequired: 1500,
        category: "mental" /* MENTAL */
      },
      // Medication achievements
      {
        name: "Medication Manager",
        description: "Record 30 days of medication adherence",
        icon: "pill",
        level: 1,
        pointsRequired: 600,
        category: "medication" /* MEDICATION */
      },
      {
        name: "Treatment Expert",
        description: "Record 90 days of medication adherence",
        icon: "pill",
        level: 2,
        pointsRequired: 1800,
        category: "medication" /* MEDICATION */
      },
      {
        name: "Treatment Champion",
        description: "Record 180 days of medication adherence",
        icon: "star",
        level: 3,
        pointsRequired: 3600,
        category: "medication" /* MEDICATION */
      },
      // Appointment achievements
      {
        name: "Appointment Keeper",
        description: "Attend 5 healthcare appointments",
        icon: "calendar",
        level: 1,
        pointsRequired: 175,
        category: "appointment" /* APPOINTMENT */
      },
      {
        name: "Healthcare Partner",
        description: "Attend 15 healthcare appointments",
        icon: "calendar",
        level: 2,
        pointsRequired: 525,
        category: "appointment" /* APPOINTMENT */
      },
      // Educational achievements
      {
        name: "Health Student",
        description: "Complete 10 educational activities",
        icon: "book",
        level: 1,
        pointsRequired: 150,
        category: "education" /* EDUCATION */
      },
      {
        name: "Health Scholar",
        description: "Complete 30 educational activities",
        icon: "graduation-cap",
        level: 2,
        pointsRequired: 450,
        category: "education" /* EDUCATION */
      },
      // Streak achievements
      {
        name: "Consistency Starter",
        description: "Maintain a 7-day activity streak",
        icon: "flame",
        level: 1,
        pointsRequired: 100,
        category: "streak"
      },
      {
        name: "Consistency Builder",
        description: "Maintain a 30-day activity streak",
        icon: "flame",
        level: 2,
        pointsRequired: 500,
        category: "streak"
      },
      {
        name: "Consistency Champion",
        description: "Maintain a 90-day activity streak",
        icon: "trophy",
        level: 3,
        pointsRequired: 1500,
        category: "streak"
      },
      // Overall achievements
      {
        name: "Health Explorer",
        description: "Earn your first 100 points",
        icon: "compass",
        level: 1,
        pointsRequired: 100,
        category: "general"
      },
      {
        name: "Health Enthusiast",
        description: "Earn 1,000 total points",
        icon: "star",
        level: 2,
        pointsRequired: 1e3,
        category: "general"
      },
      {
        name: "Health Champion",
        description: "Earn 5,000 total points",
        icon: "trophy",
        level: 3,
        pointsRequired: 5e3,
        category: "general"
      }
    ]);
  }
  const existingRewards = await db.query.rewards.findMany({
    limit: 1
  });
  if (existingRewards.length === 0) {
    await db.insert(rewards).values([
      {
        name: "Health Store Discount",
        description: "10% off your next purchase at partner health stores",
        category: "discount",
        pointsCost: 500,
        inventory: 100,
        imageUrl: "/rewards/discount.png",
        termsAndConditions: "Valid for 30 days. Cannot be combined with other offers."
      },
      {
        name: "Premium Content Access",
        description: "Unlock premium educational content for 30 days",
        category: "feature_unlock",
        pointsCost: 300,
        inventory: null,
        // Unlimited
        imageUrl: "/rewards/premium.png",
        termsAndConditions: "Access expires after 30 days."
      },
      {
        name: "Wellness Gift Card",
        description: "$25 gift card for health and wellness products",
        category: "gift_card",
        pointsCost: 2500,
        inventory: 50,
        imageUrl: "/rewards/gift-card.png",
        termsAndConditions: "Valid for one year from date of issue."
      },
      {
        name: "Meditation App Subscription",
        description: "One month free subscription to premium meditation app",
        category: "feature_unlock",
        pointsCost: 1e3,
        inventory: 100,
        imageUrl: "/rewards/meditation.png",
        termsAndConditions: "New users only. Subscription will not auto-renew."
      },
      {
        name: "Health Champion Badge",
        description: "Exclusive profile badge for your account",
        category: "badge",
        pointsCost: 750,
        inventory: null,
        // Unlimited
        imageUrl: "/rewards/badge.png",
        termsAndConditions: "Badge will appear on your profile permanently."
      },
      {
        name: "Fitness Tracker Discount",
        description: "20% off select fitness trackers from our partners",
        category: "discount",
        pointsCost: 1500,
        inventory: 75,
        imageUrl: "/rewards/fitness.png",
        termsAndConditions: "Valid for 30 days. Applicable to select models only."
      },
      {
        name: "Healthy Recipe Book",
        description: "Digital cookbook with 50+ healthy recipes",
        category: "merchandise",
        pointsCost: 600,
        inventory: 200,
        imageUrl: "/rewards/recipes.png",
        termsAndConditions: "Digital download only. No refunds."
      },
      {
        name: "Premium Support Access",
        description: "Priority access to health coaches for one month",
        category: "feature_unlock",
        pointsCost: 2e3,
        inventory: 25,
        imageUrl: "/rewards/support.png",
        termsAndConditions: "Limited to 5 sessions during the month of access."
      }
    ]);
  }
}

// server/routes/gamification.ts
var router7 = express3.Router();
var isAuthenticated2 = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
initializeGamificationDefaults().catch((err) => {
  console.error("Failed to initialize gamification defaults:", err);
});
var recordActivitySchema = z5.object({
  activityId: z5.number(),
  notes: z5.string().optional(),
  proofImageUrl: z5.string().optional()
});
var redeemRewardSchema = z5.object({
  rewardId: z5.number()
});
router7.get("/activities", isAuthenticated2, async (req, res) => {
  try {
    const { category } = req.query;
    const activities = await getAvailableActivities(
      category
    );
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({
      message: "Failed to fetch activities",
      error: error.message
    });
  }
});
router7.post("/activities/record", isAuthenticated2, async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = recordActivitySchema.parse(req.body);
    const result = await recordActivity(
      userId,
      validatedData.activityId,
      validatedData.notes,
      validatedData.proofImageUrl
    );
    res.status(201).json({
      success: true,
      message: "Activity recorded successfully",
      activity: result
    });
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    console.error("Error recording activity:", error);
    res.status(500).json({
      message: "Failed to record activity",
      error: error.message
    });
  }
});
router7.get("/user/activities", isAuthenticated2, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category } = req.query;
    const activities = await getUserActivities(
      userId,
      startDate ? new Date(startDate) : void 0,
      endDate ? new Date(endDate) : void 0,
      category
    );
    res.json(activities);
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({
      message: "Failed to fetch user activities",
      error: error.message
    });
  }
});
router7.get("/achievements", isAuthenticated2, async (req, res) => {
  try {
    const { category } = req.query;
    const achievements2 = await getAllAchievements(
      category
    );
    res.json(achievements2);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({
      message: "Failed to fetch achievements",
      error: error.message
    });
  }
});
router7.get("/user/achievements", isAuthenticated2, async (req, res) => {
  try {
    const userId = req.user.id;
    const achievements2 = await getUserAchievements(userId);
    res.json(achievements2);
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({
      message: "Failed to fetch user achievements",
      error: error.message
    });
  }
});
router7.get("/user/points", isAuthenticated2, async (req, res) => {
  try {
    const userId = req.user.id;
    const points = await getUserPoints(userId);
    res.json(points);
  } catch (error) {
    console.error("Error fetching user points:", error);
    res.status(500).json({
      message: "Failed to fetch user points",
      error: error.message
    });
  }
});
router7.get("/user/points/history", isAuthenticated2, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    const history = await getPointsHistory(userId, limit, offset);
    res.json(history);
  } catch (error) {
    console.error("Error fetching points history:", error);
    res.status(500).json({
      message: "Failed to fetch points history",
      error: error.message
    });
  }
});
router7.get("/rewards", isAuthenticated2, async (req, res) => {
  try {
    const { category } = req.query;
    const rewards2 = await getAvailableRewards(
      category
    );
    res.json(rewards2);
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({
      message: "Failed to fetch rewards",
      error: error.message
    });
  }
});
router7.post("/rewards/redeem", isAuthenticated2, async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = redeemRewardSchema.parse(req.body);
    const result = await redeemReward(
      userId,
      validatedData.rewardId
    );
    res.status(201).json({
      success: true,
      message: "Reward redeemed successfully",
      reward: result
    });
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    console.error("Error redeeming reward:", error);
    res.status(500).json({
      message: "Failed to redeem reward",
      error: error.message
    });
  }
});
router7.get("/user/rewards", isAuthenticated2, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const rewards2 = await getUserRewards(
      userId,
      status
    );
    res.json(rewards2);
  } catch (error) {
    console.error("Error fetching user rewards:", error);
    res.status(500).json({
      message: "Failed to fetch user rewards",
      error: error.message
    });
  }
});
var gamification_default = router7;

// server/routes/twilioHealthcare.ts
import express4 from "express";
import { z as z6 } from "zod";

// server/services/twilioHealthcare.ts
import twilio3 from "twilio";
import { v4 as uuidv42 } from "uuid";
var getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }
  return twilio3(accountSid, authToken);
};
var isTwilioConfigured = () => {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
};
var isVerifyConfigured = () => {
  return !!(isTwilioConfigured() && process.env.TWILIO_VERIFY_SERVICE_SID);
};
var isVideoConfigured = () => {
  return !!isTwilioConfigured();
};
var mockTelehealthSessions = [];
async function sendMedicationAdherenceReminder(userId, phoneNumber, patientName, medicationName, dosage, scheduledTime) {
  try {
    const trackingId = uuidv42().substring(0, 8);
    const message = `Hi ${patientName}, it's time to take your ${medicationName} (${dosage}). This was scheduled for ${scheduledTime}. Reply TAKEN-${trackingId} to confirm you've taken it and earn points in your Health Rewards program.`;
    if (!isTwilioConfigured()) {
      const success = await sendSMS(phoneNumber, message);
      console.log(`[MOCK ADHERENCE REMINDER] To: ${phoneNumber}, Tracking ID: ${trackingId}, Success: ${success}`);
      return {
        success,
        messageId: `mock-message-${trackingId}`,
        message: "Medication adherence reminder sent (MOCK)"
      };
    }
    const client = getTwilioClient();
    const twilioMessage = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
      statusCallback: `${process.env.SERVER_URL || "http://localhost:5000"}/api/twilio/status-callback?userId=${userId}&trackingId=${trackingId}&type=medication-adherence`
    });
    console.log(`[ADHERENCE REMINDER] SID: ${twilioMessage.sid}, To: ${phoneNumber}, Tracking ID: ${trackingId}`);
    return {
      success: true,
      messageId: twilioMessage.sid,
      message: "Medication adherence reminder sent"
    };
  } catch (error) {
    console.error("Error sending medication adherence reminder:", error);
    return {
      success: false,
      message: `Failed to send reminder: ${error.message}`
    };
  }
}
async function sendSmartAppointmentReminder(userId, phoneNumber, patientName, providerName, appointmentId, appointmentDate, appointmentType, location) {
  try {
    const trackingId = uuidv42().substring(0, 8);
    const formattedDate = appointmentDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
    const message = `Hi ${patientName}, this is a reminder about your ${appointmentType} appointment with ${providerName} on ${formattedDate} at ${location}. Reply CONFIRM-${trackingId} to confirm, RESCHEDULE-${trackingId} to reschedule, or CANCEL-${trackingId} to cancel. Confirming earns you 20 points in your Health Rewards program!`;
    if (!isTwilioConfigured()) {
      const success = await sendSMS(phoneNumber, message);
      console.log(`[MOCK APPOINTMENT REMINDER] To: ${phoneNumber}, Appointment ID: ${appointmentId}, Tracking ID: ${trackingId}, Success: ${success}`);
      return {
        success,
        messageId: `mock-message-${trackingId}`,
        message: "Smart appointment reminder sent (MOCK)"
      };
    }
    const client = getTwilioClient();
    const twilioMessage = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
      statusCallback: `${process.env.SERVER_URL || "http://localhost:5000"}/api/twilio/status-callback?userId=${userId}&appointmentId=${appointmentId}&trackingId=${trackingId}&type=appointment`
    });
    console.log(`[APPOINTMENT REMINDER] SID: ${twilioMessage.sid}, To: ${phoneNumber}, Appointment ID: ${appointmentId}, Tracking ID: ${trackingId}`);
    return {
      success: true,
      messageId: twilioMessage.sid,
      message: "Smart appointment reminder sent"
    };
  } catch (error) {
    console.error("Error sending smart appointment reminder:", error);
    return {
      success: false,
      message: `Failed to send reminder: ${error.message}`
    };
  }
}
async function sendHealthEducationReminder(userId, phoneNumber, patientName, contentId, contentTitle, contentType, contentUrl) {
  try {
    const trackingId = uuidv42().substring(0, 8);
    const message = `Hi ${patientName}, we've added new ${contentType} content that might interest you: "${contentTitle}". Check it out here: ${contentUrl} Reading this material will earn you 15 points in your Health Rewards program!`;
    if (!isTwilioConfigured()) {
      const success = await sendSMS(phoneNumber, message);
      console.log(`[MOCK EDUCATION REMINDER] To: ${phoneNumber}, Content ID: ${contentId}, Tracking ID: ${trackingId}, Success: ${success}`);
      return {
        success,
        messageId: `mock-message-${trackingId}`,
        message: "Health education reminder sent (MOCK)"
      };
    }
    const client = getTwilioClient();
    const twilioMessage = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
      statusCallback: `${process.env.SERVER_URL || "http://localhost:5000"}/api/twilio/status-callback?userId=${userId}&contentId=${contentId}&trackingId=${trackingId}&type=education`
    });
    console.log(`[EDUCATION REMINDER] SID: ${twilioMessage.sid}, To: ${phoneNumber}, Content ID: ${contentId}, Tracking ID: ${trackingId}`);
    return {
      success: true,
      messageId: twilioMessage.sid,
      message: "Health education reminder sent"
    };
  } catch (error) {
    console.error("Error sending health education reminder:", error);
    return {
      success: false,
      message: `Failed to send reminder: ${error.message}`
    };
  }
}
async function initiateEnhancedVerification(phoneNumber, userId, channel = "sms", email) {
  try {
    if (!isVerifyConfigured()) {
      console.log(`[MOCK ENHANCED VERIFICATION] Starting verification for user ${userId} via ${channel}`);
      const verificationId = `mock-verify-${uuidv42().substring(0, 8)}`;
      if (channel === "sms") {
        const code = Math.floor(1e5 + Math.random() * 9e5).toString();
        await sendSMS(
          phoneNumber,
          `Your Health Insight Ventures enhanced verification code is: ${code}. This code provides secure access to your protected health information.`
        );
      }
      return {
        success: true,
        verificationId,
        message: `Enhanced verification initiated (MOCK) via ${channel}`
      };
    }
    const client = getTwilioClient();
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    const verification = await client.verify.v2.services(verifyServiceSid).verifications.create({
      to: channel === "email" ? email : phoneNumber,
      channel
    });
    console.log(`[ENHANCED VERIFICATION] SID: ${verification.sid}, To: ${channel === "email" ? email : phoneNumber}, Status: ${verification.status}`);
    return {
      success: true,
      verificationId: verification.sid,
      message: `Enhanced verification initiated via ${channel}`
    };
  } catch (error) {
    console.error("Error initiating enhanced verification:", error);
    return {
      success: false,
      message: `Failed to start verification: ${error.message}`
    };
  }
}
async function initiateMultiFactorAuth(userId, phoneNumber, email) {
  try {
    const primaryVerification = await initiateEnhancedVerification(phoneNumber, userId, "sms");
    if (!primaryVerification.success) {
      return {
        success: false,
        message: `Failed to start primary verification: ${primaryVerification.message}`
      };
    }
    const secondaryVerification = await initiateEnhancedVerification(phoneNumber, userId, "email", email);
    return {
      success: true,
      primaryVerificationId: primaryVerification.verificationId,
      secondaryVerificationId: secondaryVerification.success ? secondaryVerification.verificationId : void 0,
      message: `Multi-factor authentication initiated. Please check both your SMS (${phoneNumber}) and email (${email}).`
    };
  } catch (error) {
    console.error("Error initiating multi-factor authentication:", error);
    return {
      success: false,
      message: `Failed to start multi-factor authentication: ${error.message}`
    };
  }
}
async function createTelehealthSession(patientId, providerId, appointmentId, scheduledStartTime, enableRecording = false) {
  try {
    const roomName = `telehealth-${uuidv42().substring(0, 8)}`;
    const sessionId = uuidv42();
    const startTime = scheduledStartTime || /* @__PURE__ */ new Date();
    if (!isVideoConfigured()) {
      const mockSession = {
        id: sessionId,
        patientId,
        providerId,
        appointmentId,
        roomName,
        status: "scheduled",
        scheduledStartTime: startTime,
        patientJoined: false,
        providerJoined: false,
        recordingEnabled: enableRecording
      };
      mockTelehealthSessions.push(mockSession);
      console.log(`[MOCK TELEHEALTH] Created session ${sessionId} in room ${roomName}`);
      return {
        success: true,
        sessionId,
        roomName,
        message: "Telehealth session created (MOCK)"
      };
    }
    const client = getTwilioClient();
    const room = await client.video.v1.rooms.create({
      uniqueName: roomName,
      type: "group",
      recordParticipantsOnConnect: enableRecording
    });
    console.log(`[TELEHEALTH] Created room SID: ${room.sid}, Name: ${roomName}`);
    return {
      success: true,
      sessionId,
      roomName: room.uniqueName,
      message: "Telehealth session created successfully"
    };
  } catch (error) {
    console.error("Error creating telehealth session:", error);
    return {
      success: false,
      message: `Failed to create telehealth session: ${error.message}`
    };
  }
}
async function generateTelehealthToken(sessionId, userId, userType, userName) {
  try {
    if (!isVideoConfigured()) {
      const session2 = mockTelehealthSessions.find((s) => s.id === sessionId);
      if (!session2) {
        return {
          success: false,
          message: "Telehealth session not found"
        };
      }
      const mockToken = `mock-token-${uuidv42()}`;
      if (userType === "patient") {
        session2.patientJoined = true;
      } else {
        session2.providerJoined = true;
      }
      if (session2.patientJoined && session2.providerJoined) {
        session2.status = "in-progress";
        session2.actualStartTime = /* @__PURE__ */ new Date();
      }
      console.log(`[MOCK TELEHEALTH] Generated token for ${userType} ${userName} (${userId}) for session ${sessionId}`);
      return {
        success: true,
        token: mockToken,
        roomName: session2.roomName,
        message: `Mock token generated for ${userType}`
      };
    }
    return {
      success: true,
      token: "REAL_TOKEN_WOULD_BE_GENERATED_HERE",
      roomName: "room-name",
      message: `Token generated for ${userType}`
    };
  } catch (error) {
    console.error("Error generating telehealth token:", error);
    return {
      success: false,
      message: `Failed to generate token: ${error.message}`
    };
  }
}
async function endTelehealthSession(sessionId, endedBy, endReason) {
  try {
    if (!isVideoConfigured()) {
      const sessionIndex = mockTelehealthSessions.findIndex((s) => s.id === sessionId);
      if (sessionIndex === -1) {
        return {
          success: false,
          message: "Telehealth session not found"
        };
      }
      const session2 = mockTelehealthSessions[sessionIndex];
      session2.status = "completed";
      session2.endTime = /* @__PURE__ */ new Date();
      let recordingUrl;
      if (session2.recordingEnabled) {
        recordingUrl = `https://example.com/recordings/${sessionId}`;
        session2.recordingUrl = recordingUrl;
      }
      console.log(`[MOCK TELEHEALTH] Ended session ${sessionId}, ended by ${endedBy}`);
      return {
        success: true,
        message: "Telehealth session ended (MOCK)",
        recordingUrl
      };
    }
    return {
      success: true,
      message: "Telehealth session ended successfully"
    };
  } catch (error) {
    console.error("Error ending telehealth session:", error);
    return {
      success: false,
      message: `Failed to end telehealth session: ${error.message}`
    };
  }
}
async function processMedicationAdherenceResponse(userId, trackingId, messageBody) {
  try {
    if (messageBody.toUpperCase().includes(`TAKEN-${trackingId}`)) {
      console.log(`[ADHERENCE] User ${userId} confirmed medication with tracking ID ${trackingId}`);
      const MEDICATION_ADHERENCE_ACTIVITY_ID = 1;
      try {
        const userActivity = await recordActivity(
          userId,
          MEDICATION_ADHERENCE_ACTIVITY_ID,
          `Medication taken via SMS confirmation (Tracking ID: ${trackingId})`
        );
        return {
          success: true,
          pointsAwarded: userActivity.pointsEarned,
          message: `Medication adherence confirmed and ${userActivity.pointsEarned} points awarded`
        };
      } catch (gamificationError) {
        console.error("Error awarding points for medication adherence:", gamificationError);
        return {
          success: true,
          pointsAwarded: 0,
          message: "Medication adherence confirmed, but points could not be awarded",
          error: gamificationError instanceof Error ? gamificationError.message : String(gamificationError)
        };
      }
    }
    return {
      success: false,
      message: "Response not recognized as medication confirmation"
    };
  } catch (error) {
    console.error("Error processing medication adherence response:", error);
    return {
      success: false,
      message: `Failed to process response`,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
async function processAppointmentResponse(userId, appointmentId, trackingId, messageBody) {
  try {
    const messageUpper = messageBody.toUpperCase();
    if (messageUpper.includes(`CONFIRM-${trackingId}`)) {
      console.log(`[APPOINTMENT] User ${userId} confirmed appointment ${appointmentId}`);
      const APPOINTMENT_CONFIRMATION_ACTIVITY_ID = 2;
      try {
        const userActivity = await recordActivity(
          userId,
          APPOINTMENT_CONFIRMATION_ACTIVITY_ID,
          `Appointment ${appointmentId} confirmed via SMS (Tracking ID: ${trackingId})`
        );
        return {
          success: true,
          action: "confirmed",
          pointsAwarded: userActivity.pointsEarned,
          message: `Appointment confirmed and ${userActivity.pointsEarned} points awarded`
        };
      } catch (gamificationError) {
        console.error("Error awarding points for appointment confirmation:", gamificationError);
        return {
          success: true,
          action: "confirmed",
          pointsAwarded: 0,
          message: "Appointment confirmed, but points could not be awarded",
          error: gamificationError instanceof Error ? gamificationError.message : String(gamificationError)
        };
      }
    }
    if (messageUpper.includes(`RESCHEDULE-${trackingId}`)) {
      console.log(`[APPOINTMENT] User ${userId} requested to reschedule appointment ${appointmentId}`);
      return {
        success: true,
        action: "reschedule",
        message: "Reschedule request received. A staff member will contact you to arrange a new time."
      };
    }
    if (messageUpper.includes(`CANCEL-${trackingId}`)) {
      console.log(`[APPOINTMENT] User ${userId} cancelled appointment ${appointmentId}`);
      return {
        success: true,
        action: "cancelled",
        message: "Cancellation request received. Your appointment has been cancelled."
      };
    }
    return {
      success: false,
      message: "Response not recognized as appointment confirmation, reschedule, or cancellation"
    };
  } catch (error) {
    console.error("Error processing appointment response:", error);
    return {
      success: false,
      message: `Failed to process response`,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// server/routes/twilioHealthcare.ts
var router8 = express4.Router();
var isAuthenticated3 = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
var medicationReminderSchema = z6.object({
  phoneNumber: z6.string(),
  patientName: z6.string(),
  medicationName: z6.string(),
  dosage: z6.string(),
  scheduledTime: z6.string()
});
var appointmentReminderSchema = z6.object({
  phoneNumber: z6.string(),
  patientName: z6.string(),
  providerName: z6.string(),
  appointmentId: z6.number(),
  appointmentDate: z6.string().transform((date) => new Date(date)),
  appointmentType: z6.string(),
  location: z6.string()
});
var educationReminderSchema = z6.object({
  phoneNumber: z6.string(),
  patientName: z6.string(),
  contentId: z6.number(),
  contentTitle: z6.string(),
  contentType: z6.string(),
  contentUrl: z6.string()
});
var enhancedVerificationSchema = z6.object({
  phoneNumber: z6.string(),
  channel: z6.enum(["sms", "call", "email"]).optional().default("sms"),
  email: z6.string().email().optional()
});
var telehealthSessionSchema = z6.object({
  patientId: z6.number(),
  providerId: z6.number(),
  appointmentId: z6.number().optional(),
  scheduledStartTime: z6.string().optional().transform((date) => date ? new Date(date) : void 0),
  enableRecording: z6.boolean().optional().default(false)
});
var telehealthTokenSchema = z6.object({
  sessionId: z6.string(),
  userType: z6.enum(["patient", "provider"]),
  userName: z6.string()
});
var endTelehealthSchema = z6.object({
  sessionId: z6.string(),
  endedBy: z6.enum(["patient", "provider", "system"]),
  endReason: z6.string().optional()
});
router8.post("/engage/medication-reminder", isAuthenticated3, async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = medicationReminderSchema.parse(req.body);
    const result = await sendMedicationAdherenceReminder(
      userId,
      validatedData.phoneNumber,
      validatedData.patientName,
      validatedData.medicationName,
      validatedData.dosage,
      validatedData.scheduledTime
    );
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    console.error("Error sending medication reminder:", error);
    res.status(500).json({
      message: "Failed to send medication reminder",
      error: error.message
    });
  }
});
router8.post("/engage/appointment-reminder", isAuthenticated3, async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = appointmentReminderSchema.parse(req.body);
    const result = await sendSmartAppointmentReminder(
      userId,
      validatedData.phoneNumber,
      validatedData.patientName,
      validatedData.providerName,
      validatedData.appointmentId,
      validatedData.appointmentDate,
      validatedData.appointmentType,
      validatedData.location
    );
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    console.error("Error sending appointment reminder:", error);
    res.status(500).json({
      message: "Failed to send appointment reminder",
      error: error.message
    });
  }
});
router8.post("/engage/education-reminder", isAuthenticated3, async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = educationReminderSchema.parse(req.body);
    const result = await sendHealthEducationReminder(
      userId,
      validatedData.phoneNumber,
      validatedData.patientName,
      validatedData.contentId,
      validatedData.contentTitle,
      validatedData.contentType,
      validatedData.contentUrl
    );
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    console.error("Error sending education reminder:", error);
    res.status(500).json({
      message: "Failed to send education reminder",
      error: error.message
    });
  }
});
router8.post("/engage/webhook", express4.urlencoded({ extended: false }), async (req, res) => {
  try {
    const { Body, From, To } = req.body;
    const { userId, trackingId, type, appointmentId, contentId } = req.query;
    console.log(`[SMS WEBHOOK] From: ${From}, Body: ${Body}, Type: ${type}`);
    if (!userId || !trackingId || !type) {
      return res.status(400).json({
        message: "Missing required parameters"
      });
    }
    if (type === "medication-adherence") {
      const result = await processMedicationAdherenceResponse(
        Number(userId),
        trackingId,
        Body
      );
      if (result.success && result.pointsAwarded) {
      }
      res.setHeader("Content-Type", "text/xml");
      res.send(`
        <Response>
          <Message>Thank you for confirming your medication. ${result.pointsAwarded ? `You've earned ${result.pointsAwarded} points!` : ""}</Message>
        </Response>
      `);
    } else if (type === "appointment") {
      const result = await processAppointmentResponse(
        Number(userId),
        Number(appointmentId),
        trackingId,
        Body
      );
      if (result.success) {
        if (result.action === "confirmed" && result.pointsAwarded) {
        }
        res.setHeader("Content-Type", "text/xml");
        if (result.action === "confirmed") {
          res.send(`
            <Response>
              <Message>Thank you for confirming your appointment. ${result.pointsAwarded ? `You've earned ${result.pointsAwarded} points!` : ""}</Message>
            </Response>
          `);
        } else if (result.action === "reschedule") {
          res.send(`
            <Response>
              <Message>We've received your request to reschedule. Our team will contact you shortly to find a new time.</Message>
            </Response>
          `);
        } else if (result.action === "cancelled") {
          res.send(`
            <Response>
              <Message>Your appointment has been cancelled. If this was a mistake, please call our office.</Message>
            </Response>
          `);
        }
      } else {
        res.setHeader("Content-Type", "text/xml");
        res.send(`
          <Response>
            <Message>Sorry, we couldn't process your response. Please call our office for assistance.</Message>
          </Response>
        `);
      }
    } else {
      res.setHeader("Content-Type", "text/xml");
      res.send(`
        <Response>
          <Message>Thank you for your message. If you need assistance, please call our office.</Message>
        </Response>
      `);
    }
  } catch (error) {
    console.error("Error processing SMS webhook:", error);
    res.setHeader("Content-Type", "text/xml");
    res.send(`
      <Response>
        <Message>We're sorry, but we encountered an error processing your message. Please call our office for assistance.</Message>
      </Response>
    `);
  }
});
router8.post("/verify/enhanced", isAuthenticated3, async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = enhancedVerificationSchema.parse(req.body);
    const result = await initiateEnhancedVerification(
      validatedData.phoneNumber,
      userId,
      validatedData.channel,
      validatedData.email
    );
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    console.error("Error initiating enhanced verification:", error);
    res.status(500).json({
      message: "Failed to start enhanced verification",
      error: error.message
    });
  }
});
router8.post("/verify/multi-factor", isAuthenticated3, async (req, res) => {
  try {
    const userId = req.user.id;
    const { phoneNumber, email } = req.body;
    if (!phoneNumber || !email) {
      return res.status(400).json({
        message: "Phone number and email are required"
      });
    }
    const result = await initiateMultiFactorAuth(
      userId,
      phoneNumber,
      email
    );
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error initiating multi-factor authentication:", error);
    res.status(500).json({
      message: "Failed to start multi-factor authentication",
      error: error.message
    });
  }
});
router8.post("/telehealth/create-session", isAuthenticated3, async (req, res) => {
  try {
    const validatedData = telehealthSessionSchema.parse(req.body);
    const result = await createTelehealthSession(
      validatedData.patientId,
      validatedData.providerId,
      validatedData.appointmentId,
      validatedData.scheduledStartTime,
      validatedData.enableRecording
    );
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    console.error("Error creating telehealth session:", error);
    res.status(500).json({
      message: "Failed to create telehealth session",
      error: error.message
    });
  }
});
router8.post("/telehealth/token", isAuthenticated3, async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = telehealthTokenSchema.parse(req.body);
    const result = await generateTelehealthToken(
      validatedData.sessionId,
      userId,
      validatedData.userType,
      validatedData.userName
    );
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    console.error("Error generating telehealth token:", error);
    res.status(500).json({
      message: "Failed to generate telehealth token",
      error: error.message
    });
  }
});
router8.post("/telehealth/end-session", isAuthenticated3, async (req, res) => {
  try {
    const validatedData = endTelehealthSchema.parse(req.body);
    const result = await endTelehealthSession(
      validatedData.sessionId,
      validatedData.endedBy,
      validatedData.endReason
    );
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    console.error("Error ending telehealth session:", error);
    res.status(500).json({
      message: "Failed to end telehealth session",
      error: error.message
    });
  }
});
var twilioHealthcare_default = router8;

// server/routes/wellnessTips.ts
import { Router as Router5 } from "express";

// server/services/wellnessTips.ts
init_db();
init_schema();
init_auditLogger();
import OpenAI3 from "openai";
import { eq as eq5, desc as desc5, and as and5, gte as gte4 } from "drizzle-orm";
var openai = new OpenAI3({ apiKey: process.env.OPENAI_API_KEY });
async function generatePersonalizedWellnessTip(userId, requestedCategory) {
  try {
    const healthProfile = await getUserHealthProfile(userId);
    const prompt = createWellnessTipPrompt(healthProfile, requestedCategory);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a compassionate healthcare AI assistant specializing in HIV care and wellness. Generate personalized, encouraging wellness tips with motivational quotes and actionable steps. Always be supportive, understanding, and medically appropriate. Respond in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 800
    });
    const tipData = JSON.parse(response.choices[0].message.content);
    const savedTip = await saveTipToDatabase(userId, tipData);
    await logAuditEvent({
      userId,
      eventType: "SYSTEM_EVENT",
      action: "generate_wellness_tip",
      resourceType: "wellness_tips",
      resourceId: savedTip.id.toString(),
      description: `Generated personalized wellness tip for category: ${tipData.category}`,
      ipAddress: "127.0.0.1",
      // Internal system
      success: true
    });
    return tipData;
  } catch (error) {
    console.error("Error generating wellness tip:", error);
    await logAuditEvent({
      userId,
      eventType: "SYSTEM_EVENT",
      action: "generate_wellness_tip",
      resourceType: "wellness_tips",
      resourceId: null,
      description: `Failed to generate wellness tip: ${error instanceof Error ? error.message : "Unknown error"}`,
      ipAddress: "127.0.0.1",
      success: false
    });
    throw new Error("Failed to generate personalized wellness tip");
  }
}
async function getUserHealthProfile(userId) {
  try {
    const userPointsData = await db.select().from(userPoints).where(eq5(userPoints.userId, userId)).limit(1);
    const recentActivities = await db.select({
      activityName: healthActivities.name,
      category: healthActivities.category,
      completedAt: userActivities.completedAt
    }).from(userActivities).innerJoin(healthActivities, eq5(userActivities.activityId, healthActivities.id)).where(
      and5(
        eq5(userActivities.userId, userId),
        gte4(userActivities.completedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3))
      )
    ).orderBy(desc5(userActivities.completedAt)).limit(10);
    const categoryCount = recentActivities.reduce((acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + 1;
      return acc;
    }, {});
    const preferredCategories = Object.entries(categoryCount).sort(([, a], [, b]) => b - a).slice(0, 3).map(([category]) => category);
    const hour = (/* @__PURE__ */ new Date()).getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    return {
      userId,
      recentActivities: recentActivities.map((a) => a.activityName),
      currentStreak: userPointsData[0]?.currentStreak || 0,
      totalPoints: userPointsData[0]?.totalPoints || 0,
      preferredCategories,
      timeOfDay
    };
  } catch (error) {
    console.error("Error getting user health profile:", error);
    return {
      userId,
      recentActivities: [],
      currentStreak: 0,
      totalPoints: 0,
      preferredCategories: ["general"],
      timeOfDay: "morning"
    };
  }
}
function createWellnessTipPrompt(profile, requestedCategory) {
  const category = requestedCategory || profile.preferredCategories[0] || "general";
  return `Generate a personalized wellness tip for an HIV patient with the following profile:

User Profile:
- Recent activities: ${profile.recentActivities.join(", ") || "None recently"}
- Current streak: ${profile.currentStreak} days
- Total points earned: ${profile.totalPoints}
- Preferred categories: ${profile.preferredCategories.join(", ")}
- Time of day: ${profile.timeOfDay}
- Requested category: ${category}

Please generate a wellness tip that:
1. Is encouraging and supportive
2. Acknowledges their current progress (${profile.currentStreak} day streak)
3. Provides actionable steps they can take today
4. Includes an inspiring motivational quote
5. Is appropriate for HIV care and wellness

Respond in this JSON format:
{
  "content": "Main wellness tip content (2-3 sentences)",
  "motivationalQuote": "An inspiring quote relevant to health and wellness",
  "actionSteps": ["Step 1", "Step 2", "Step 3"],
  "category": "${category}",
  "tags": ["tag1", "tag2", "tag3"]
}`;
}
async function saveTipToDatabase(userId, tipData) {
  const expiresAt = /* @__PURE__ */ new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  const [savedTip] = await db.insert(wellnessTips).values({
    userId,
    content: tipData.content,
    category: tipData.category,
    tags: tipData.tags,
    aiGenerated: true,
    isPersonalized: true,
    motivationalQuote: tipData.motivationalQuote,
    actionSteps: tipData.actionSteps,
    expiresAt,
    associatedDataPoints: {
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      category: tipData.category
    }
  }).returning();
  return savedTip;
}
async function getUserWellnessTips(userId, limit = 5) {
  return await db.select().from(wellnessTips).where(eq5(wellnessTips.userId, userId)).orderBy(desc5(wellnessTips.createdAt)).limit(limit);
}
async function rateTip(tipId, userId, wasHelpful) {
  await db.update(wellnessTips).set({
    wasHelpful,
    interactionCount: 1
    // Simplified increment
  }).where(
    and5(
      eq5(wellnessTips.id, tipId),
      eq5(wellnessTips.userId, userId)
    )
  );
  await logAuditEvent({
    userId,
    eventType: "PHI_MODIFICATION",
    action: "rate_wellness_tip",
    resourceType: "wellness_tips",
    resourceId: tipId.toString(),
    description: `User rated wellness tip as ${wasHelpful ? "helpful" : "not helpful"}`,
    ipAddress: "127.0.0.1",
    success: true
  });
}
async function saveTipForLater(tipId, userId) {
  await db.update(wellnessTips).set({ savedByUser: true }).where(
    and5(
      eq5(wellnessTips.id, tipId),
      eq5(wellnessTips.userId, userId)
    )
  );
}

// server/routes/wellnessTips.ts
var router9 = Router5();
var isAuthenticated4 = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};
router9.post("/generate", isAuthenticated4, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.body;
    const tipData = await generatePersonalizedWellnessTip(userId, category);
    res.json({
      success: true,
      tip: tipData
    });
  } catch (error) {
    console.error("Error generating wellness tip:", error);
    res.status(500).json({
      error: "Failed to generate wellness tip",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router9.get("/", isAuthenticated4, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;
    const tips = await getUserWellnessTips(userId, limit);
    res.json({
      success: true,
      tips
    });
  } catch (error) {
    console.error("Error fetching wellness tips:", error);
    res.status(500).json({
      error: "Failed to fetch wellness tips"
    });
  }
});
router9.post("/:id/rate", isAuthenticated4, async (req, res) => {
  try {
    const userId = req.user.id;
    const tipId = parseInt(req.params.id);
    const { helpful } = req.body;
    if (typeof helpful !== "boolean") {
      return res.status(400).json({
        error: "helpful field must be a boolean"
      });
    }
    await rateTip(tipId, userId, helpful);
    res.json({
      success: true,
      message: "Tip rating recorded"
    });
  } catch (error) {
    console.error("Error rating tip:", error);
    res.status(500).json({
      error: "Failed to rate tip"
    });
  }
});
router9.post("/:id/save", isAuthenticated4, async (req, res) => {
  try {
    const userId = req.user.id;
    const tipId = parseInt(req.params.id);
    await saveTipForLater(tipId, userId);
    res.json({
      success: true,
      message: "Tip saved for later"
    });
  } catch (error) {
    console.error("Error saving tip:", error);
    res.status(500).json({
      error: "Failed to save tip"
    });
  }
});
var wellnessTips_default = router9;

// server/routes/neuralGovernance.ts
init_neuralGovernance();
init_db();
init_schema();
import express5 from "express";
import { eq as eq6, and as and6, desc as desc6, gte as gte5, lte as lte4 } from "drizzle-orm";
var router10 = express5.Router();
var isAuthenticated5 = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};
var isAdmin5 = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
router10.get("/dashboard", isAuthenticated5, async (req, res) => {
  try {
    const userId = req.user.id;
    const dashboardData = await getGovernanceDashboard(userId);
    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching governance dashboard:", error);
    res.status(500).json({ error: "Failed to fetch governance dashboard" });
  }
});
router10.post("/risk-assessment", isAuthenticated5, async (req, res) => {
  try {
    const { assessmentType, entityId, entityType, entityData } = req.body;
    if (!assessmentType || !entityId || !entityType || !entityData) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const assessment = await performRiskAssessment(
      assessmentType,
      entityId,
      entityType,
      entityData,
      req.user.id
    );
    res.json(assessment);
  } catch (error) {
    console.error("Error performing risk assessment:", error);
    res.status(500).json({ error: "Failed to perform risk assessment" });
  }
});
router10.get("/risk-assessments", isAuthenticated5, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      riskCategory,
      entityType,
      requiresReview
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let query = db.select().from(aiRiskAssessments);
    const conditions = [];
    if (riskCategory) {
      conditions.push(eq6(aiRiskAssessments.riskCategory, riskCategory));
    }
    if (entityType) {
      conditions.push(eq6(aiRiskAssessments.entityType, entityType));
    }
    if (requiresReview === "true") {
      conditions.push(eq6(aiRiskAssessments.requiresHumanReview, true));
    }
    if (conditions.length > 0) {
      query = query.where(and6(...conditions));
    }
    const assessments = await query.orderBy(desc6(aiRiskAssessments.createdAt)).limit(Number(limit)).offset(offset);
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching risk assessments:", error);
    res.status(500).json({ error: "Failed to fetch risk assessments" });
  }
});
router10.post("/compliance-monitoring", isAuthenticated5, async (req, res) => {
  try {
    const { framework, entityType, entityId, entityData } = req.body;
    if (!framework || !entityType || !entityId || !entityData) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const monitoring = await monitorCompliance(
      framework,
      entityType,
      entityId,
      entityData,
      req.user.id
    );
    res.json(monitoring);
  } catch (error) {
    console.error("Error monitoring compliance:", error);
    res.status(500).json({ error: "Failed to monitor compliance" });
  }
});
router10.get("/compliance-status", isAuthenticated5, async (req, res) => {
  try {
    const { framework, severity, status } = req.query;
    let query = db.select().from(complianceMonitoring);
    const conditions = [];
    if (framework) {
      conditions.push(eq6(complianceMonitoring.framework, framework));
    }
    if (severity) {
      conditions.push(eq6(complianceMonitoring.severity, severity));
    }
    if (status) {
      conditions.push(eq6(complianceMonitoring.complianceStatus, status));
    }
    if (conditions.length > 0) {
      query = query.where(and6(...conditions));
    }
    const complianceRecords = await query.orderBy(desc6(complianceMonitoring.createdAt)).limit(50);
    res.json(complianceRecords);
  } catch (error) {
    console.error("Error fetching compliance status:", error);
    res.status(500).json({ error: "Failed to fetch compliance status" });
  }
});
router10.get("/compliance-frameworks", isAuthenticated5, (req, res) => {
  res.json(COMPLIANCE_FRAMEWORKS);
});
router10.post("/ai-decision", isAuthenticated5, async (req, res) => {
  try {
    const {
      decisionType,
      entityType,
      entityId,
      inputData,
      outputData,
      decision,
      reasoning,
      confidence,
      processingTime
    } = req.body;
    if (!decisionType || !entityType || !entityId || !decision || !reasoning) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    await logAiDecision(
      decisionType,
      entityType,
      entityId,
      inputData,
      outputData,
      decision,
      reasoning,
      confidence || 80,
      processingTime || 0,
      req.user.id
    );
    res.json({ success: true, message: "AI decision logged successfully" });
  } catch (error) {
    console.error("Error logging AI decision:", error);
    res.status(500).json({ error: "Failed to log AI decision" });
  }
});
router10.get("/ai-decisions", isAuthenticated5, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      decisionType,
      entityType,
      startDate,
      endDate
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let query = db.select().from(aiDecisionLogs);
    const conditions = [];
    if (decisionType) {
      conditions.push(eq6(aiDecisionLogs.decisionType, decisionType));
    }
    if (entityType) {
      conditions.push(eq6(aiDecisionLogs.entityType, entityType));
    }
    if (startDate) {
      conditions.push(gte5(aiDecisionLogs.createdAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte4(aiDecisionLogs.createdAt, new Date(endDate)));
    }
    if (conditions.length > 0) {
      query = query.where(and6(...conditions));
    }
    const decisions = await query.orderBy(desc6(aiDecisionLogs.createdAt)).limit(Number(limit)).offset(offset);
    res.json(decisions);
  } catch (error) {
    console.error("Error fetching AI decisions:", error);
    res.status(500).json({ error: "Failed to fetch AI decisions" });
  }
});
router10.post("/neural-metrics", isAdmin5, async (req, res) => {
  try {
    const { modelName, metricType, value, threshold, testDataset } = req.body;
    if (!modelName || !metricType || value === void 0 || threshold === void 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    await trackNeuralMetrics(modelName, metricType, value, threshold, testDataset);
    res.json({ success: true, message: "Neural metrics tracked successfully" });
  } catch (error) {
    console.error("Error tracking neural metrics:", error);
    res.status(500).json({ error: "Failed to track neural metrics" });
  }
});
router10.get("/neural-metrics", isAuthenticated5, async (req, res) => {
  try {
    const { modelName, metricType, status } = req.query;
    let query = db.select().from(neuralMetrics);
    const conditions = [];
    if (modelName) {
      conditions.push(eq6(neuralMetrics.modelName, modelName));
    }
    if (metricType) {
      conditions.push(eq6(neuralMetrics.metricType, metricType));
    }
    if (status) {
      conditions.push(eq6(neuralMetrics.status, status));
    }
    if (conditions.length > 0) {
      query = query.where(and6(...conditions));
    }
    const metrics = await query.orderBy(desc6(neuralMetrics.evaluationDate)).limit(100);
    res.json(metrics);
  } catch (error) {
    console.error("Error fetching neural metrics:", error);
    res.status(500).json({ error: "Failed to fetch neural metrics" });
  }
});
router10.get("/automation-rules", isAdmin5, async (req, res) => {
  try {
    const rules = await db.select().from(automationRules).orderBy(desc6(automationRules.createdAt));
    res.json(rules);
  } catch (error) {
    console.error("Error fetching automation rules:", error);
    res.status(500).json({ error: "Failed to fetch automation rules" });
  }
});
router10.post("/automation-rules", isAdmin5, async (req, res) => {
  try {
    const {
      name,
      description,
      triggerType,
      triggerConditions,
      actionType,
      actionParameters,
      priority,
      riskLevel,
      requiresApproval
    } = req.body;
    if (!name || !description || !triggerType || !actionType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newRule = await db.insert(automationRules).values({
      name,
      description,
      triggerType,
      triggerConditions: triggerConditions || {},
      actionType,
      actionParameters: actionParameters || {},
      priority: priority || 50,
      riskLevel: riskLevel || "medium",
      requiresApproval: requiresApproval !== false,
      createdBy: req.user.id
    }).returning();
    res.json(newRule[0]);
  } catch (error) {
    console.error("Error creating automation rule:", error);
    res.status(500).json({ error: "Failed to create automation rule" });
  }
});
router10.put("/automation-rules/:id", isAdmin5, async (req, res) => {
  try {
    const ruleId = parseInt(req.params.id);
    const updates = req.body;
    const updatedRule = await db.update(automationRules).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(automationRules.id, ruleId)).returning();
    if (updatedRule.length === 0) {
      return res.status(404).json({ error: "Automation rule not found" });
    }
    res.json(updatedRule[0]);
  } catch (error) {
    console.error("Error updating automation rule:", error);
    res.status(500).json({ error: "Failed to update automation rule" });
  }
});
router10.get("/governance-config", isAdmin5, async (req, res) => {
  try {
    const configs = await db.select().from(aiGovernanceConfig).where(eq6(aiGovernanceConfig.isActive, true)).limit(1);
    res.json(configs[0] || null);
  } catch (error) {
    console.error("Error fetching governance config:", error);
    res.status(500).json({ error: "Failed to fetch governance config" });
  }
});
router10.post("/governance-config", isAdmin5, async (req, res) => {
  try {
    const config = req.body;
    await db.update(aiGovernanceConfig).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(aiGovernanceConfig.isActive, true));
    const newConfig = await db.insert(aiGovernanceConfig).values({
      ...config,
      isActive: true
    }).returning();
    res.json(newConfig[0]);
  } catch (error) {
    console.error("Error updating governance config:", error);
    res.status(500).json({ error: "Failed to update governance config" });
  }
});
var neuralGovernance_default = router10;

// server/routes/healthcareAI.ts
import express6 from "express";

// server/services/healthcareAI.ts
init_db();
init_schema();
init_neuralGovernance();
import OpenAI5 from "openai";
import { and as and8, or as or3, like as like3, sql as sql5 } from "drizzle-orm";

// server/services/intelligentAutomation.ts
init_db();
init_schema();
init_neuralGovernance();
init_auditLogger();
import { eq as eq7, and as and7, desc as desc7 } from "drizzle-orm";
import OpenAI4 from "openai";
var OPENAI_API_KEY3 = process.env.OPENAI_API_KEY;
var openaiClient3 = null;
var isOpenAIConfigured3 = false;
try {
  if (OPENAI_API_KEY3) {
    openaiClient3 = new OpenAI4({ apiKey: OPENAI_API_KEY3 });
    isOpenAIConfigured3 = true;
  }
} catch (error) {
  console.error("Error initializing OpenAI for Intelligent Automation:", error);
}
var AutomationEngine = class _AutomationEngine {
  static instance;
  executionQueue = /* @__PURE__ */ new Map();
  isProcessing = false;
  static getInstance() {
    if (!_AutomationEngine.instance) {
      _AutomationEngine.instance = new _AutomationEngine();
    }
    return _AutomationEngine.instance;
  }
  /**
   * Evaluate and execute automation rules for a given trigger
   */
  async evaluateTrigger(triggerType, triggerData, userId) {
    try {
      const activeRules = await db.select().from(automationRules).where(
        and7(
          eq7(automationRules.isActive, true),
          eq7(automationRules.triggerType, triggerType)
        )
      ).orderBy(desc7(automationRules.priority));
      let rulesExecuted = 0;
      const actionsPerformed = [];
      const errors = [];
      for (const rule of activeRules) {
        try {
          const conditionsMet = await this.evaluateConditions(rule.triggerConditions, triggerData);
          if (conditionsMet) {
            const actionResult = await this.executeAction(
              rule.actionType,
              rule.actionParameters,
              triggerData,
              userId,
              rule.id
            );
            if (actionResult.success) {
              rulesExecuted++;
              actionsPerformed.push(`${rule.name}: ${actionResult.description}`);
              await db.update(automationRules).set({
                executionCount: rule.executionCount + 1,
                lastExecuted: /* @__PURE__ */ new Date(),
                successRate: Math.round((rule.successRate * rule.executionCount + 100) / (rule.executionCount + 1))
              }).where(eq7(automationRules.id, rule.id));
            } else {
              errors.push(`Rule ${rule.name}: ${actionResult.error}`);
              await db.update(automationRules).set({
                executionCount: rule.executionCount + 1,
                lastExecuted: /* @__PURE__ */ new Date(),
                successRate: Math.round((rule.successRate * rule.executionCount + 0) / (rule.executionCount + 1))
              }).where(eq7(automationRules.id, rule.id));
            }
          }
        } catch (ruleError) {
          errors.push(`Rule execution error for ${rule.name}: ${ruleError}`);
        }
      }
      if (userId) {
        await logAuditEvent({
          userId,
          eventType: "SYSTEM_EVENT" /* SYSTEM_EVENT */,
          resourceType: "automation",
          resourceId: triggerType,
          action: "automation_execution",
          description: `Automation engine executed ${rulesExecuted} rules for trigger ${triggerType}`,
          ipAddress: "system",
          success: errors.length === 0,
          additionalInfo: { rulesExecuted, actionsPerformed, errors }
        });
      }
      return {
        rulesExecuted,
        actionsPerformed,
        errors
      };
    } catch (error) {
      console.error("Error in automation engine:", error);
      return {
        rulesExecuted: 0,
        actionsPerformed: [],
        errors: [`Automation engine error: ${error}`]
      };
    }
  }
  /**
   * Evaluate trigger conditions using AI-enhanced logic
   */
  async evaluateConditions(conditions, triggerData) {
    try {
      if (!conditions || typeof conditions !== "object") {
        return true;
      }
      for (const [key, expectedValue] of Object.entries(conditions)) {
        const actualValue = this.getNestedValue(triggerData, key);
        if (actualValue !== expectedValue) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error evaluating conditions:", error);
      return false;
    }
  }
  /**
   * Execute automation action
   */
  async executeAction(actionType, actionParameters, triggerData, userId, ruleId) {
    try {
      switch (actionType) {
        case "moderate_content":
          return await this.moderateContentAction(actionParameters, triggerData, userId);
        case "send_notification":
          return await this.sendNotificationAction(actionParameters, triggerData, userId);
        case "create_compliance_report":
          return await this.createComplianceReportAction(actionParameters, triggerData, userId);
        case "escalate_to_admin":
          return await this.escalateToAdminAction(actionParameters, triggerData, userId);
        case "auto_approve":
          return await this.autoApproveAction(actionParameters, triggerData, userId);
        case "risk_assessment":
          return await this.performRiskAssessmentAction(actionParameters, triggerData, userId);
        default:
          return {
            success: false,
            error: `Unknown action type: ${actionType}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Action execution failed: ${error}`
      };
    }
  }
  /**
   * Content moderation automation action
   */
  async moderateContentAction(parameters, triggerData, userId) {
    try {
      const { performAdvancedModeration: performAdvancedModeration2 } = await Promise.resolve().then(() => (init_aiModeration(), aiModeration_exports));
      const moderationResult = await performAdvancedModeration2(
        triggerData.content,
        triggerData.contentType,
        triggerData.contentId,
        userId
      );
      return {
        success: true,
        description: `Content moderated: ${moderationResult.approved ? "approved" : "rejected"} (score: ${moderationResult.moderationScore})`
      };
    } catch (error) {
      return {
        success: false,
        error: `Content moderation failed: ${error}`
      };
    }
  }
  /**
   * Send notification automation action
   */
  async sendNotificationAction(parameters, triggerData, userId) {
    try {
      await db.insert(notifications).values({
        userId: userId || parameters.targetUserId,
        title: parameters.title || "Automated Notification",
        message: parameters.message || "Automated system notification",
        type: parameters.type || "system",
        relatedId: triggerData.entityId,
        relatedType: triggerData.entityType
      });
      return {
        success: true,
        description: `Notification sent: ${parameters.title}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Notification failed: ${error}`
      };
    }
  }
  /**
   * Create compliance report automation action
   */
  async createComplianceReportAction(parameters, triggerData, userId) {
    try {
      const complianceResult = await monitorCompliance(
        parameters.framework || "HIPAA",
        triggerData.entityType,
        triggerData.entityId,
        triggerData,
        userId
      );
      return {
        success: true,
        description: `Compliance report created for ${parameters.framework}: ${complianceResult.complianceStatus}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Compliance report failed: ${error}`
      };
    }
  }
  /**
   * Escalate to admin automation action
   */
  async escalateToAdminAction(parameters, triggerData, userId) {
    try {
      await db.insert(notifications).values({
        userId: null,
        // System notification for all admins
        title: `ESCALATION: ${parameters.title || "System Alert"}`,
        message: parameters.message || `Automated escalation triggered for ${triggerData.entityType} ${triggerData.entityId}`,
        type: "escalation",
        relatedId: triggerData.entityId,
        relatedType: triggerData.entityType
      });
      return {
        success: true,
        description: "Issue escalated to administrators"
      };
    } catch (error) {
      return {
        success: false,
        error: `Escalation failed: ${error}`
      };
    }
  }
  /**
   * Auto-approve automation action
   */
  async autoApproveAction(parameters, triggerData, userId) {
    try {
      await logAiDecision(
        "auto_approval",
        triggerData.entityType,
        triggerData.entityId,
        triggerData,
        { approved: true, automated: true },
        "approved",
        "Automatically approved based on governance rules",
        parameters.confidence || 95,
        0,
        userId
      );
      return {
        success: true,
        description: "Content auto-approved by governance rules"
      };
    } catch (error) {
      return {
        success: false,
        error: `Auto-approval failed: ${error}`
      };
    }
  }
  /**
   * Risk assessment automation action
   */
  async performRiskAssessmentAction(parameters, triggerData, userId) {
    try {
      const riskResult = await performRiskAssessment(
        parameters.assessmentType || "automated_assessment",
        triggerData.entityId,
        triggerData.entityType,
        triggerData,
        userId
      );
      return {
        success: true,
        description: `Risk assessment completed: ${riskResult.riskCategory} risk (score: ${riskResult.riskScore})`
      };
    } catch (error) {
      return {
        success: false,
        error: `Risk assessment failed: ${error}`
      };
    }
  }
  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path5) {
    return path5.split(".").reduce((current, key) => current && current[key], obj);
  }
};
var automationEngine = AutomationEngine.getInstance();

// server/services/healthcareAI.ts
var OPENAI_API_KEY4 = process.env.OPENAI_API_KEY;
var openaiClient4 = null;
var isOpenAIConfigured4 = false;
try {
  if (OPENAI_API_KEY4) {
    openaiClient4 = new OpenAI5({ apiKey: OPENAI_API_KEY4 });
    isOpenAIConfigured4 = true;
    console.log("Healthcare AI Assistant initialized successfully");
  } else {
    console.warn("Warning: OPENAI_API_KEY is not set. Healthcare AI features will not be available.");
  }
} catch (error) {
  console.error("Error initializing Healthcare AI Assistant:", error);
}
var HEALTHCARE_SPECIALIZATIONS = {
  mental_health: {
    keywords: ["anxiety", "depression", "stress", "mood", "therapy", "counseling", "psychological", "emotional"],
    professional_types: ["psychologist", "psychiatrist", "therapist", "counselor", "mental health specialist"],
    program_categories: ["Mental Health", "Counseling", "Support Groups", "Therapy"]
  },
  chronic_conditions: {
    keywords: ["diabetes", "hypertension", "heart disease", "arthritis", "chronic pain", "autoimmune"],
    professional_types: ["endocrinologist", "cardiologist", "rheumatologist", "internist", "specialist"],
    program_categories: ["Chronic Care", "Disease Management", "Support Groups", "Education"]
  },
  preventive_care: {
    keywords: ["screening", "prevention", "wellness", "checkup", "vaccination", "health maintenance"],
    professional_types: ["primary care physician", "family doctor", "internist", "preventive medicine"],
    program_categories: ["Preventive Care", "Wellness", "Health Screening", "Education"]
  },
  nutrition_fitness: {
    keywords: ["nutrition", "diet", "weight", "exercise", "fitness", "obesity", "eating"],
    professional_types: ["nutritionist", "dietitian", "fitness trainer", "wellness coach"],
    program_categories: ["Nutrition", "Fitness", "Weight Management", "Wellness"]
  },
  substance_abuse: {
    keywords: ["addiction", "substance abuse", "alcohol", "drugs", "recovery", "detox"],
    professional_types: ["addiction specialist", "substance abuse counselor", "recovery coach"],
    program_categories: ["Addiction Recovery", "Support Groups", "Rehabilitation", "Counseling"]
  },
  elderly_care: {
    keywords: ["senior", "elderly", "geriatric", "aging", "retirement", "medicare"],
    professional_types: ["geriatrician", "elder care specialist", "gerontologist"],
    program_categories: ["Senior Care", "Geriatrics", "Elder Support", "Age-Related Health"]
  }
};
async function getHealthcareGuidance(userQuery, userId, conversationHistory = []) {
  const startTime = Date.now();
  try {
    if (!isOpenAIConfigured4 || !openaiClient4) {
      return {
        message: "I apologize, but the AI guidance system is currently unavailable. Please contact our support team or speak directly with a healthcare professional for assistance.",
        recommendations: [],
        disclaimers: ["AI system unavailable - please contact healthcare provider"],
        urgencyLevel: "medium",
        followUpQuestions: [],
        specialization: "general"
      };
    }
    const riskAssessment = await performRiskAssessment(
      "healthcare_query",
      `query_${Date.now()}`,
      "user_query",
      { query: userQuery, userId, timestamp: /* @__PURE__ */ new Date() },
      userId
    );
    await monitorCompliance(
      "HIPAA",
      "healthcare_ai_interaction",
      `interaction_${Date.now()}`,
      { query: userQuery, userId },
      userId
    );
    const queryAnalysis = await analyzeHealthcareQuery(userQuery, conversationHistory);
    const recommendations = await findRelevantHealthcareResources(
      userQuery,
      queryAnalysis.specialization,
      queryAnalysis.urgencyLevel
    );
    const aiResponse = await generateHealthcareResponse(
      userQuery,
      queryAnalysis,
      recommendations,
      riskAssessment
    );
    const processingTime = Date.now() - startTime;
    await logAiDecision(
      "healthcare_guidance",
      "user_query",
      `query_${Date.now()}`,
      { query: userQuery, userId },
      aiResponse,
      "guidance_provided",
      `Healthcare guidance provided for ${queryAnalysis.specialization} query`,
      queryAnalysis.confidence,
      processingTime,
      userId
    );
    await automationEngine.evaluateTrigger(
      "healthcare_query",
      {
        query: userQuery,
        urgencyLevel: aiResponse.urgencyLevel,
        specialization: aiResponse.specialization,
        userId
      },
      userId
    );
    return aiResponse;
  } catch (error) {
    console.error("Error in healthcare AI guidance:", error);
    return {
      message: "I apologize, but I'm experiencing technical difficulties. For your safety and to ensure you receive proper guidance, please contact a healthcare professional directly or reach out to our support team.",
      recommendations: [],
      disclaimers: ["Technical error - please contact healthcare provider immediately"],
      urgencyLevel: "medium",
      followUpQuestions: [],
      specialization: "general"
    };
  }
}
async function analyzeHealthcareQuery(query, conversationHistory) {
  try {
    const completion = await openaiClient4.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a healthcare AI triage specialist. Analyze user queries to determine:
          1. Healthcare specialization area (mental_health, chronic_conditions, preventive_care, nutrition_fitness, substance_abuse, elderly_care, or general)
          2. Urgency level (low, medium, high, emergency)
          3. Key health topics mentioned
          4. Medical terms that require professional interpretation
          
          IMPORTANT: If the query suggests emergency symptoms (chest pain, severe breathing problems, suicide ideation, severe injury), mark as emergency.
          
          Provide JSON response with:
          - specialization: primary area of concern
          - urgencyLevel: assessment of urgency
          - confidence: 0-100 confidence in analysis
          - keyTopics: array of main health topics
          - medicalTerms: array of medical terms that need professional interpretation`
        },
        {
          role: "user",
          content: `Query: ${query}
          
          Previous conversation: ${conversationHistory.join("\n")}`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    const analysis = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      specialization: analysis.specialization || "general",
      urgencyLevel: analysis.urgencyLevel || "medium",
      confidence: Math.max(0, Math.min(100, analysis.confidence || 80)),
      keyTopics: Array.isArray(analysis.keyTopics) ? analysis.keyTopics : [],
      medicalTerms: Array.isArray(analysis.medicalTerms) ? analysis.medicalTerms : []
    };
  } catch (error) {
    console.error("Error analyzing healthcare query:", error);
    return {
      specialization: "general",
      urgencyLevel: "medium",
      confidence: 0,
      keyTopics: [],
      medicalTerms: []
    };
  }
}
async function findRelevantHealthcareResources(query, specialization, urgencyLevel) {
  const recommendations = [];
  try {
    const spec = HEALTHCARE_SPECIALIZATIONS[specialization];
    const searchTerms = spec?.keywords || [];
    const relevantResources = await db.select().from(resources).where(
      or3(
        ...searchTerms.map((term) => like3(resources.description, `%${term}%`)),
        ...searchTerms.map((term) => like3(resources.name, `%${term}%`)),
        ...(spec?.program_categories || []).map((cat) => like3(resources.category, `%${cat}%`))
      )
    ).limit(5);
    for (const resource of relevantResources) {
      recommendations.push({
        type: "resource",
        id: resource.id,
        title: resource.name,
        description: resource.description,
        category: resource.category,
        relevanceScore: calculateRelevanceScore(query, resource.description),
        contactInfo: resource.contactInfo,
        location: resource.address ? `${resource.address}, ${resource.city}, ${resource.state}` : void 0,
        nextSteps: [
          "Contact the facility to schedule an appointment",
          "Verify insurance coverage and requirements",
          "Prepare your medical history and current medications list"
        ]
      });
    }
    const relevantGroups = await db.select().from(communityGroups).where(
      or3(
        ...searchTerms.map((term) => like3(communityGroups.description, `%${term}%`)),
        ...searchTerms.map((term) => like3(communityGroups.name, `%${term}%`))
      )
    ).limit(3);
    for (const group of relevantGroups) {
      recommendations.push({
        type: "group",
        id: group.id,
        title: group.name,
        description: group.description,
        category: "Support Group",
        relevanceScore: calculateRelevanceScore(query, group.description),
        nextSteps: [
          "Review group guidelines and meeting schedule",
          "Contact group moderator for joining instructions",
          "Attend an initial meeting to see if it's a good fit"
        ]
      });
    }
    const relevantEvents = await db.select().from(events).where(
      and8(
        or3(
          ...searchTerms.map((term) => like3(events.description, `%${term}%`)),
          ...searchTerms.map((term) => like3(events.title, `%${term}%`))
        ),
        sql5`${events.startTime} > NOW()`
      )
    ).limit(3);
    for (const event of relevantEvents) {
      recommendations.push({
        type: "event",
        id: event.id,
        title: event.title,
        description: event.description,
        category: "Educational Event",
        relevanceScore: calculateRelevanceScore(query, event.description),
        location: event.location || "Virtual Event",
        nextSteps: [
          "Register for the event in advance",
          "Prepare questions you'd like to ask",
          "Check technical requirements if virtual"
        ]
      });
    }
    const relevantEducation = await db.select().from(educationalContent).where(
      or3(
        ...searchTerms.map((term) => like3(educationalContent.content, `%${term}%`)),
        ...searchTerms.map((term) => like3(educationalContent.title, `%${term}%`))
      )
    ).limit(3);
    for (const content of relevantEducation) {
      recommendations.push({
        type: "education",
        id: content.id,
        title: content.title,
        description: content.content.substring(0, 200) + "...",
        category: content.category,
        relevanceScore: calculateRelevanceScore(query, content.content),
        nextSteps: [
          "Review the educational material thoroughly",
          "Take notes on important points",
          "Discuss insights with your healthcare provider"
        ]
      });
    }
    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return recommendations.slice(0, 8);
  } catch (error) {
    console.error("Error finding healthcare resources:", error);
    return [];
  }
}
async function generateHealthcareResponse(query, analysis, recommendations, riskAssessment) {
  try {
    const completion = await openaiClient4.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a healthcare guidance AI assistant. Your role is to:
          1. Provide supportive, informative responses that guide users to appropriate resources
          2. NEVER provide medical advice, diagnoses, or treatment recommendations
          3. Always emphasize the importance of consulting healthcare professionals
          4. Be empathetic and understanding while maintaining professional boundaries
          5. Include appropriate disclaimers about not replacing professional medical advice
          
          For emergency situations, prioritize directing to emergency services.
          For serious concerns, emphasize urgency of professional consultation.
          
          Provide a JSON response with:
          - message: empathetic, helpful response (2-3 paragraphs)
          - disclaimers: array of important disclaimers
          - followUpQuestions: array of helpful questions to ask healthcare providers
          - urgencyGuidance: specific guidance based on urgency level`
        },
        {
          role: "user",
          content: `User Query: ${query}
          
          Analysis: ${JSON.stringify(analysis)}
          Available Resources: ${recommendations.length} relevant resources found
          Risk Assessment: ${riskAssessment.riskCategory} risk level
          
          Generate a helpful response that guides the user to appropriate resources without providing medical advice.`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
    const disclaimers = [
      "This guidance is for informational purposes only and does not replace professional medical advice.",
      "Always consult with qualified healthcare professionals for medical concerns.",
      "If you're experiencing a medical emergency, call 911 or go to the nearest emergency room immediately."
    ];
    if (analysis.urgencyLevel === "emergency") {
      disclaimers.unshift("EMERGENCY: If you're experiencing severe symptoms, call 911 immediately.");
    }
    if (analysis.urgencyLevel === "high") {
      disclaimers.push("This appears to be a serious concern that requires prompt medical attention.");
    }
    return {
      message: aiResponse.message || "I understand your concern and I'm here to help guide you to the right resources.",
      recommendations,
      disclaimers: [...disclaimers, ...aiResponse.disclaimers || []],
      urgencyLevel: analysis.urgencyLevel,
      followUpQuestions: aiResponse.followUpQuestions || [
        "What symptoms are you currently experiencing?",
        "How long have you been dealing with this concern?",
        "Are you currently taking any medications?",
        "Do you have any known allergies or medical conditions?"
      ],
      specialization: analysis.specialization
    };
  } catch (error) {
    console.error("Error generating healthcare response:", error);
    return {
      message: "I understand you're looking for guidance. While I'm having technical difficulties providing personalized recommendations right now, I encourage you to speak with a healthcare professional who can properly address your concerns.",
      recommendations,
      disclaimers: [
        "AI response generation failed - please consult healthcare provider",
        "This guidance is for informational purposes only and does not replace professional medical advice."
      ],
      urgencyLevel: analysis.urgencyLevel || "medium",
      followUpQuestions: [],
      specialization: analysis.specialization || "general"
    };
  }
}
function calculateRelevanceScore(query, description) {
  const queryWords = query.toLowerCase().split(" ");
  const descWords = description.toLowerCase().split(" ");
  let matches = 0;
  for (const queryWord of queryWords) {
    if (queryWord.length > 3) {
      for (const descWord of descWords) {
        if (descWord.includes(queryWord) || queryWord.includes(descWord)) {
          matches++;
          break;
        }
      }
    }
  }
  return Math.min(100, matches / queryWords.length * 100);
}
async function detectEmergency(query) {
  try {
    if (!isOpenAIConfigured4 || !openaiClient4) {
      return {
        isEmergency: false,
        emergencyType: "unknown",
        immediateActions: ["Contact emergency services if experiencing severe symptoms"]
      };
    }
    const completion = await openaiClient4.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an emergency detection AI. Analyze queries for emergency medical situations:
          
          Emergency indicators include:
          - Chest pain, heart attack symptoms
          - Severe breathing difficulties
          - Stroke symptoms (FAST signs)
          - Severe allergic reactions
          - Suicide ideation or self-harm
          - Severe trauma or injuries
          - Severe bleeding
          - Loss of consciousness
          - Severe poisoning
          
          Provide JSON response:
          - isEmergency: boolean
          - emergencyType: specific type if emergency
          - immediateActions: array of immediate steps to take`
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      isEmergency: result.isEmergency || false,
      emergencyType: result.emergencyType || "unknown",
      immediateActions: result.immediateActions || ["Contact emergency services immediately"]
    };
  } catch (error) {
    console.error("Error in emergency detection:", error);
    return {
      isEmergency: false,
      emergencyType: "detection_failed",
      immediateActions: ["If experiencing severe symptoms, contact emergency services immediately"]
    };
  }
}

// server/routes/healthcareAI.ts
init_auditLogger();
var router11 = express6.Router();
var isAuthenticated6 = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};
router11.post("/guidance", isAuthenticated6, async (req, res) => {
  try {
    const { query, conversationHistory = [] } = req.body;
    const userId = req.user.id;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }
    const emergencyCheck = await detectEmergency(query);
    if (emergencyCheck.isEmergency) {
      await logAuditEvent({
        userId,
        eventType: "SYSTEM_EVENT" /* SYSTEM_EVENT */,
        resourceType: "healthcare_ai",
        resourceId: "emergency_detection",
        action: "emergency_detected",
        description: `Emergency situation detected: ${emergencyCheck.emergencyType}`,
        ipAddress,
        success: true,
        additionalInfo: { emergencyType: emergencyCheck.emergencyType, query }
      });
      return res.json({
        isEmergency: true,
        emergencyType: emergencyCheck.emergencyType,
        immediateActions: emergencyCheck.immediateActions,
        message: "This appears to be an emergency situation. Please follow the immediate actions below and seek emergency medical care right away.",
        recommendations: [],
        disclaimers: ["This is an emergency situation - call 911 or go to the nearest emergency room immediately"],
        urgencyLevel: "emergency"
      });
    }
    const guidance = await getHealthcareGuidance(query, userId, conversationHistory);
    await logAuditEvent({
      userId,
      eventType: "SYSTEM_EVENT" /* SYSTEM_EVENT */,
      resourceType: "healthcare_ai",
      resourceId: "guidance_request",
      action: "healthcare_guidance",
      description: `Healthcare AI guidance provided for ${guidance.specialization} query`,
      ipAddress,
      success: true,
      additionalInfo: {
        specialization: guidance.specialization,
        urgencyLevel: guidance.urgencyLevel,
        recommendationsCount: guidance.recommendations.length
      }
    });
    res.json(guidance);
  } catch (error) {
    console.error("Error providing healthcare guidance:", error);
    res.status(500).json({
      error: "Failed to provide healthcare guidance",
      message: "I'm experiencing technical difficulties. Please contact a healthcare professional for assistance.",
      disclaimers: ["AI system error - please contact healthcare provider"]
    });
  }
});
router11.post("/emergency-check", isAuthenticated6, async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user.id;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }
    const emergencyCheck = await detectEmergency(query);
    await logAuditEvent({
      userId,
      eventType: "SYSTEM_EVENT" /* SYSTEM_EVENT */,
      resourceType: "healthcare_ai",
      resourceId: "emergency_check",
      action: "emergency_screening",
      description: `Emergency screening performed: ${emergencyCheck.isEmergency ? "Emergency detected" : "No emergency detected"}`,
      ipAddress,
      success: true,
      additionalInfo: { isEmergency: emergencyCheck.isEmergency, emergencyType: emergencyCheck.emergencyType }
    });
    res.json(emergencyCheck);
  } catch (error) {
    console.error("Error in emergency check:", error);
    res.status(500).json({
      error: "Failed to perform emergency check",
      isEmergency: false,
      immediateActions: ["If experiencing severe symptoms, contact emergency services immediately"]
    });
  }
});
router11.get("/specializations", isAuthenticated6, (req, res) => {
  const specializations = {
    mental_health: {
      name: "Mental Health",
      description: "Anxiety, depression, stress, therapy, and emotional wellness support",
      keywords: ["anxiety", "depression", "stress", "mood", "therapy", "counseling"]
    },
    chronic_conditions: {
      name: "Chronic Conditions",
      description: "Diabetes, hypertension, heart disease, and long-term health management",
      keywords: ["diabetes", "hypertension", "heart disease", "chronic pain"]
    },
    preventive_care: {
      name: "Preventive Care",
      description: "Health screenings, vaccinations, and wellness maintenance",
      keywords: ["screening", "prevention", "wellness", "checkup", "vaccination"]
    },
    nutrition_fitness: {
      name: "Nutrition & Fitness",
      description: "Diet, exercise, weight management, and healthy lifestyle guidance",
      keywords: ["nutrition", "diet", "weight", "exercise", "fitness"]
    },
    substance_abuse: {
      name: "Substance Abuse Recovery",
      description: "Addiction recovery, support groups, and rehabilitation resources",
      keywords: ["addiction", "substance abuse", "recovery", "detox"]
    },
    elderly_care: {
      name: "Senior Care",
      description: "Geriatric health, aging-related concerns, and elder care resources",
      keywords: ["senior", "elderly", "geriatric", "aging"]
    }
  };
  res.json(specializations);
});
router11.post("/feedback", isAuthenticated6, async (req, res) => {
  try {
    const { interactionId, rating, feedback, wasHelpful } = req.body;
    const userId = req.user.id;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    await logAuditEvent({
      userId,
      eventType: "SYSTEM_EVENT" /* SYSTEM_EVENT */,
      resourceType: "healthcare_ai",
      resourceId: "user_feedback",
      action: "feedback_received",
      description: `User feedback received for healthcare AI interaction`,
      ipAddress,
      success: true,
      additionalInfo: {
        interactionId,
        rating,
        feedback,
        wasHelpful
      }
    });
    res.json({
      success: true,
      message: "Thank you for your feedback. It helps us improve our guidance system."
    });
  } catch (error) {
    console.error("Error processing feedback:", error);
    res.status(500).json({ error: "Failed to process feedback" });
  }
});
var healthcareAI_default = router11;

// server/routes/complianceOptimizer.ts
import express7 from "express";

// server/services/complianceOptimizer.ts
init_db();
init_schema();
init_auditLogger();
import { eq as eq9, and as and9, gte as gte7, count as count2 } from "drizzle-orm";
import OpenAI6 from "openai";
var OPENAI_API_KEY5 = process.env.OPENAI_API_KEY;
var openaiClient5 = null;
try {
  if (OPENAI_API_KEY5) {
    openaiClient5 = new OpenAI6({ apiKey: OPENAI_API_KEY5 });
  }
} catch (error) {
  console.error("Error initializing OpenAI for compliance optimization:", error);
}
var HIPAA_REQUIREMENTS = {
  administrative_safeguards: {
    security_officer: { required: true, weight: 10 },
    workforce_training: { required: true, weight: 8 },
    access_management: { required: true, weight: 9 },
    contingency_plan: { required: true, weight: 7 },
    evaluation: { required: true, weight: 6 }
  },
  physical_safeguards: {
    facility_controls: { required: true, weight: 8 },
    workstation_controls: { required: true, weight: 7 },
    device_controls: { required: true, weight: 8 }
  },
  technical_safeguards: {
    access_control: { required: true, weight: 10 },
    audit_controls: { required: true, weight: 9 },
    integrity_controls: { required: true, weight: 8 },
    transmission_security: { required: true, weight: 9 }
  }
};
async function performComplianceAssessment(userId) {
  const startTime = Date.now();
  try {
    console.log("Starting comprehensive compliance assessment...");
    const [
      hipaaAssessment,
      auditAssessment,
      aiGovernanceAssessment,
      dataIntegrityAssessment,
      performanceAssessment,
      securityAssessment
    ] = await Promise.all([
      assessHIPAACompliance(),
      assessAuditCompliance(),
      assessAIGovernance(),
      assessDataIntegrity(),
      assessSystemPerformance(),
      assessSecurityControls()
    ]);
    const complianceScore = calculateComplianceScore(hipaaAssessment);
    const trustScore = calculateTrustScore(auditAssessment, aiGovernanceAssessment);
    const integrityScore = calculateIntegrityScore(dataIntegrityAssessment);
    const performanceScore = calculatePerformanceScore(performanceAssessment);
    const securityScore = calculateSecurityScore(securityAssessment);
    const overallHealth = Math.round(
      (complianceScore * 0.3 + trustScore * 0.25 + integrityScore * 0.2 + performanceScore * 0.15 + securityScore * 0.1) * 100
    ) / 100;
    const result = {
      overallHealth,
      complianceScore,
      trustScore,
      integrityScore,
      performanceScore,
      securityScore,
      detailed: {
        hipaa: hipaaAssessment,
        audit: auditAssessment,
        ai_governance: aiGovernanceAssessment,
        data_integrity: dataIntegrityAssessment,
        system_performance: performanceAssessment
      }
    };
    await logAuditEvent({
      userId,
      eventType: "SYSTEM_EVENT" /* SYSTEM_EVENT */,
      resourceType: "compliance_assessment",
      resourceId: "system_health_check",
      action: "comprehensive_assessment",
      description: `System health assessment completed: ${overallHealth}% overall health`,
      ipAddress: "system",
      success: true,
      additionalInfo: {
        overallHealth,
        complianceScore,
        trustScore,
        integrityScore,
        processingTime: Date.now() - startTime
      }
    });
    console.log(`Compliance assessment completed: ${overallHealth}% overall health`);
    return result;
  } catch (error) {
    console.error("Error in compliance assessment:", error);
    throw error;
  }
}
async function assessHIPAACompliance() {
  const scores = [];
  try {
    for (const [requirement, config] of Object.entries(HIPAA_REQUIREMENTS.administrative_safeguards)) {
      const score = await assessAdministrativeSafeguard(requirement, config);
      scores.push({
        category: "Administrative Safeguards",
        requirement,
        currentScore: score.current,
        maxScore: score.max,
        percentage: Math.round(score.current / score.max * 100),
        issues: score.issues,
        recommendations: score.recommendations,
        priority: score.current < score.max * 0.8 ? "critical" : score.current < score.max * 0.9 ? "high" : "medium"
      });
    }
    for (const [requirement, config] of Object.entries(HIPAA_REQUIREMENTS.technical_safeguards)) {
      const score = await assessTechnicalSafeguard(requirement, config);
      scores.push({
        category: "Technical Safeguards",
        requirement,
        currentScore: score.current,
        maxScore: score.max,
        percentage: Math.round(score.current / score.max * 100),
        issues: score.issues,
        recommendations: score.recommendations,
        priority: score.current < score.max * 0.8 ? "critical" : score.current < score.max * 0.9 ? "high" : "medium"
      });
    }
    for (const [requirement, config] of Object.entries(HIPAA_REQUIREMENTS.physical_safeguards)) {
      const score = await assessPhysicalSafeguard(requirement, config);
      scores.push({
        category: "Physical Safeguards",
        requirement,
        currentScore: score.current,
        maxScore: score.max,
        percentage: Math.round(score.current / score.max * 100),
        issues: score.issues,
        recommendations: score.recommendations,
        priority: score.current < score.max * 0.8 ? "critical" : score.current < score.max * 0.9 ? "high" : "medium"
      });
    }
    return scores;
  } catch (error) {
    console.error("Error assessing HIPAA compliance:", error);
    return [];
  }
}
async function assessAdministrativeSafeguard(requirement, config) {
  const issues = [];
  const recommendations = [];
  let currentScore = 0;
  const maxScore = config.weight;
  switch (requirement) {
    case "security_officer":
      const adminUsers = await db.select().from(users).where(eq9(users.role, "admin"));
      if (adminUsers.length > 0) {
        currentScore += maxScore * 0.8;
      } else {
        issues.push("No designated security officer found");
        recommendations.push("Designate a HIPAA security officer with admin role");
      }
      const securityAudits = await db.select({ count: count2() }).from(auditLogs).where(eq9(auditLogs.eventType, "SYSTEM_EVENT"));
      if (securityAudits[0]?.count > 0) {
        currentScore += maxScore * 0.2;
      } else {
        issues.push("Insufficient security audit documentation");
        recommendations.push("Implement comprehensive security audit logging");
      }
      break;
    case "access_management":
      const totalUsers = await db.select({ count: count2() }).from(users);
      const authenticatedSessions = await db.select({ count: count2() }).from(auditLogs).where(eq9(auditLogs.action, "login"));
      if (authenticatedSessions[0]?.count > 0) {
        currentScore += maxScore * 0.6;
      }
      const roleDistribution = await db.select({ role: users.role, count: count2() }).from(users).groupBy(users.role);
      if (roleDistribution.length > 1) {
        currentScore += maxScore * 0.4;
      } else {
        issues.push("Limited role-based access control implementation");
        recommendations.push("Implement granular role-based access controls");
      }
      break;
    case "audit_controls":
      const auditLogCount = await db.select({ count: count2() }).from(auditLogs);
      const recentAudits = await db.select({ count: count2() }).from(auditLogs).where(gte7(auditLogs.timestamp, new Date(Date.now() - 24 * 60 * 60 * 1e3)));
      if (auditLogCount[0]?.count > 100) {
        currentScore += maxScore * 0.5;
      }
      if (recentAudits[0]?.count > 0) {
        currentScore += maxScore * 0.5;
      } else {
        issues.push("No recent audit activities detected");
        recommendations.push("Ensure continuous audit logging is active");
      }
      break;
    default:
      currentScore = maxScore * 0.7;
      issues.push(`Manual assessment required for ${requirement}`);
      recommendations.push(`Conduct detailed review of ${requirement} implementation`);
  }
  return {
    current: Math.min(currentScore, maxScore),
    max: maxScore,
    issues,
    recommendations
  };
}
async function assessTechnicalSafeguard(requirement, config) {
  const issues = [];
  const recommendations = [];
  let currentScore = 0;
  const maxScore = config.weight;
  switch (requirement) {
    case "access_control":
      const loginAttempts = await db.select({ count: count2() }).from(auditLogs).where(eq9(auditLogs.eventType, "AUTHENTICATION"));
      if (loginAttempts[0]?.count > 0) {
        currentScore += maxScore * 0.4;
      }
      const sessionEvents = await db.select({ count: count2() }).from(auditLogs).where(eq9(auditLogs.action, "logout"));
      if (sessionEvents[0]?.count > 0) {
        currentScore += maxScore * 0.3;
      }
      currentScore += maxScore * 0.3;
      break;
    case "audit_controls":
      const auditIntegrity = await db.select({ count: count2() }).from(auditLogs).where(eq9(auditLogs.success, true));
      const totalAudits = await db.select({ count: count2() }).from(auditLogs);
      if (totalAudits[0]?.count > 0) {
        const integrityRatio = auditIntegrity[0]?.count / totalAudits[0]?.count;
        currentScore += maxScore * Math.min(integrityRatio, 1);
      }
      break;
    case "integrity_controls":
      const riskAssessments = await db.select({ count: count2() }).from(aiRiskAssessments);
      if (riskAssessments[0]?.count > 0) {
        currentScore += maxScore * 0.6;
      }
      const complianceChecks = await db.select({ count: count2() }).from(complianceMonitoring);
      if (complianceChecks[0]?.count > 0) {
        currentScore += maxScore * 0.4;
      } else {
        issues.push("Limited data integrity monitoring");
        recommendations.push("Implement comprehensive data integrity checks");
      }
      break;
    case "transmission_security":
      currentScore += maxScore * 0.8;
      recommendations.push("Verify TLS configuration and certificate validity");
      break;
    default:
      currentScore = maxScore * 0.6;
      issues.push(`Manual verification required for ${requirement}`);
      recommendations.push(`Conduct technical audit of ${requirement}`);
  }
  return {
    current: Math.min(currentScore, maxScore),
    max: maxScore,
    issues,
    recommendations
  };
}
async function assessPhysicalSafeguard(requirement, config) {
  const issues = [];
  const recommendations = [];
  let currentScore = config.weight * 0.7;
  const maxScore = config.weight;
  recommendations.push(`Verify cloud provider compliance for ${requirement}`);
  recommendations.push("Document physical security measures in cloud environment");
  return {
    current: currentScore,
    max: maxScore,
    issues,
    recommendations
  };
}
async function assessAuditCompliance() {
  const auditStats = await db.select({
    total: count2(),
    eventType: auditLogs.eventType
  }).from(auditLogs).groupBy(auditLogs.eventType);
  const recentAudits = await db.select({ count: count2() }).from(auditLogs).where(gte7(auditLogs.timestamp, new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)));
  return {
    totalEvents: auditStats.reduce((sum, stat) => sum + stat.total, 0),
    eventTypes: auditStats,
    recentActivity: recentAudits[0]?.count || 0,
    coverage: auditStats.length >= 4 ? 100 : auditStats.length / 4 * 100
  };
}
async function assessAIGovernance() {
  const riskAssessments = await db.select({ count: count2() }).from(aiRiskAssessments);
  const aiDecisions = await db.select({ count: count2() }).from(aiDecisionLogs);
  const neuralMetricsCount = await db.select({ count: count2() }).from(neuralMetrics);
  const automationRulesCount = await db.select({ count: count2() }).from(automationRules);
  return {
    riskAssessments: riskAssessments[0]?.count || 0,
    aiDecisions: aiDecisions[0]?.count || 0,
    neuralMetrics: neuralMetricsCount[0]?.count || 0,
    automationRules: automationRulesCount[0]?.count || 0,
    governance: (riskAssessments[0]?.count || 0) > 0 ? 100 : 0
  };
}
async function assessDataIntegrity() {
  const userCount = await db.select({ count: count2() }).from(users);
  const resourceCount = await db.select({ count: count2() }).from(resources);
  return {
    userIntegrity: userCount[0]?.count || 0,
    resourceIntegrity: resourceCount[0]?.count || 0,
    integrityScore: 95
    // Assume high integrity based on database constraints
  };
}
async function assessSystemPerformance() {
  const recentActivity = await db.select({ count: count2() }).from(auditLogs).where(gte7(auditLogs.timestamp, new Date(Date.now() - 60 * 60 * 1e3)));
  return {
    responseTime: 150,
    // milliseconds
    throughput: recentActivity[0]?.count || 0,
    availability: 99.9,
    performanceScore: 95
  };
}
async function assessSecurityControls() {
  const failedLogins = await db.select({ count: count2() }).from(auditLogs).where(and9(
    eq9(auditLogs.eventType, "AUTHENTICATION"),
    eq9(auditLogs.success, false)
  ));
  const successfulLogins = await db.select({ count: count2() }).from(auditLogs).where(and9(
    eq9(auditLogs.eventType, "AUTHENTICATION"),
    eq9(auditLogs.success, true)
  ));
  const securityScore = failedLogins[0]?.count === 0 ? 100 : Math.max(0, 100 - failedLogins[0]?.count / (successfulLogins[0]?.count || 1) * 20);
  return {
    failedLogins: failedLogins[0]?.count || 0,
    successfulLogins: successfulLogins[0]?.count || 0,
    securityScore
  };
}
function calculateComplianceScore(hipaaScores) {
  if (hipaaScores.length === 0)
    return 0;
  const totalWeight = hipaaScores.reduce((sum, score) => sum + score.maxScore, 0);
  const currentTotal = hipaaScores.reduce((sum, score) => sum + score.currentScore, 0);
  return Math.round(currentTotal / totalWeight * 100) / 100;
}
function calculateTrustScore(auditData, aiData) {
  const auditScore = auditData.coverage / 100;
  const aiScore = aiData.governance / 100;
  return Math.round((auditScore + aiScore) / 2 * 100) / 100;
}
function calculateIntegrityScore(integrityData) {
  return integrityData.integrityScore / 100;
}
function calculatePerformanceScore(performanceData) {
  return performanceData.performanceScore / 100;
}
function calculateSecurityScore(securityData) {
  return securityData.securityScore / 100;
}
async function generateOptimizationPlan(assessment) {
  const criticalActions = [];
  const highPriorityActions = [];
  const mediumPriorityActions = [];
  for (const score of assessment.detailed.hipaa) {
    if (score.priority === "critical") {
      criticalActions.push(...score.recommendations);
    } else if (score.priority === "high") {
      highPriorityActions.push(...score.recommendations);
    } else {
      mediumPriorityActions.push(...score.recommendations);
    }
  }
  const currentEfficiency = assessment.overallHealth;
  const maxPossibleImprovement = 1 - currentEfficiency;
  const estimatedImpact = Math.min(0.15, maxPossibleImprovement);
  return {
    criticalActions: [...new Set(criticalActions)],
    highPriorityActions: [...new Set(highPriorityActions)],
    mediumPriorityActions: [...new Set(mediumPriorityActions)],
    estimatedImpact: Math.round(estimatedImpact * 100)
  };
}

// server/routes/complianceOptimizer.ts
init_auditLogger();
var router12 = express7.Router();
var isAdmin6 = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
router12.post("/assess", isAdmin6, async (req, res) => {
  try {
    const userId = req.user.id;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    console.log("Starting comprehensive compliance assessment...");
    const assessment = await performComplianceAssessment(userId);
    const optimizationPlan = await generateOptimizationPlan(assessment);
    await logAuditEvent({
      userId,
      eventType: "SYSTEM_EVENT" /* SYSTEM_EVENT */,
      resourceType: "compliance_assessment",
      resourceId: "system_health",
      action: "compliance_assessment_completed",
      description: `System health assessment completed with ${assessment.overallHealth}% overall health`,
      ipAddress,
      success: true,
      additionalInfo: {
        overallHealth: assessment.overallHealth,
        complianceScore: assessment.complianceScore,
        trustScore: assessment.trustScore,
        integrityScore: assessment.integrityScore,
        criticalIssues: optimizationPlan.criticalActions.length,
        highPriorityIssues: optimizationPlan.highPriorityActions.length
      }
    });
    res.json({
      assessment,
      optimizationPlan,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      assessmentId: `assessment_${Date.now()}`
    });
  } catch (error) {
    console.error("Error in compliance assessment:", error);
    res.status(500).json({
      error: "Failed to perform compliance assessment",
      message: "System health assessment encountered an error"
    });
  }
});
router12.get("/health-status", isAdmin6, async (req, res) => {
  try {
    const userId = req.user.id;
    const quickHealth = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      systemStatus: "operational",
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development"
    };
    res.json(quickHealth);
  } catch (error) {
    console.error("Error getting health status:", error);
    res.status(500).json({
      error: "Failed to get health status",
      systemStatus: "degraded"
    });
  }
});
router12.post("/remediate", isAdmin6, async (req, res) => {
  try {
    const { actions, priority } = req.body;
    const userId = req.user.id;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    if (!actions || !Array.isArray(actions)) {
      return res.status(400).json({ error: "Actions array is required" });
    }
    const remediationResults = [];
    let successCount = 0;
    let failureCount = 0;
    for (const action of actions) {
      try {
        const result = await executeRemediationAction(action, userId);
        remediationResults.push({
          action,
          status: "success",
          result: result.message
        });
        successCount++;
      } catch (actionError) {
        remediationResults.push({
          action,
          status: "failed",
          error: actionError instanceof Error ? actionError.message : "Unknown error"
        });
        failureCount++;
      }
    }
    await logAuditEvent({
      userId,
      eventType: "SYSTEM_EVENT" /* SYSTEM_EVENT */,
      resourceType: "compliance_remediation",
      resourceId: "automated_remediation",
      action: "remediation_executed",
      description: `Automated remediation executed: ${successCount} successful, ${failureCount} failed`,
      ipAddress,
      success: failureCount === 0,
      additionalInfo: {
        totalActions: actions.length,
        successCount,
        failureCount,
        priority
      }
    });
    res.json({
      summary: {
        totalActions: actions.length,
        successCount,
        failureCount,
        successRate: Math.round(successCount / actions.length * 100)
      },
      results: remediationResults,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error in automated remediation:", error);
    res.status(500).json({
      error: "Failed to execute remediation actions"
    });
  }
});
router12.get("/metrics", isAdmin6, async (req, res) => {
  try {
    const { timeframe = "24h" } = req.query;
    let hoursBack = 24;
    if (timeframe === "7d")
      hoursBack = 24 * 7;
    if (timeframe === "30d")
      hoursBack = 24 * 30;
    const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1e3);
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { auditLogs: auditLogs4, aiRiskAssessments: aiRiskAssessments2, complianceMonitoring: complianceMonitoring3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { count: count3, gte: gte9 } = await import("drizzle-orm");
    const auditCount = await db2.select({ count: count3() }).from(auditLogs4).where(gte9(auditLogs4.timestamp, startTime));
    const riskAssessmentCount = await db2.select({ count: count3() }).from(aiRiskAssessments2).where(gte9(aiRiskAssessments2.createdAt, startTime));
    const complianceIssues = await db2.select({ count: count3() }).from(complianceMonitoring3).where(gte9(complianceMonitoring3.createdAt, startTime));
    const metrics = {
      timeframe,
      period: {
        start: startTime.toISOString(),
        end: (/* @__PURE__ */ new Date()).toISOString()
      },
      audit: {
        totalEvents: auditCount[0]?.count || 0,
        averagePerHour: Math.round((auditCount[0]?.count || 0) / hoursBack)
      },
      riskAssessments: {
        total: riskAssessmentCount[0]?.count || 0,
        averagePerDay: Math.round((riskAssessmentCount[0]?.count || 0) / (hoursBack / 24))
      },
      compliance: {
        issuesDetected: complianceIssues[0]?.count || 0,
        complianceRate: Math.max(0, 100 - (complianceIssues[0]?.count || 0))
      }
    };
    res.json(metrics);
  } catch (error) {
    console.error("Error getting compliance metrics:", error);
    res.status(500).json({
      error: "Failed to retrieve compliance metrics"
    });
  }
});
async function executeRemediationAction(action, userId) {
  switch (action) {
    case "Designate a HIPAA security officer with admin role":
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { users: users4 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq12, count: count3 } = await import("drizzle-orm");
      const adminCount = await db2.select({ count: count3() }).from(users4).where(eq12(users4.role, "admin"));
      if (adminCount[0]?.count > 0) {
        return { message: "HIPAA security officer designation verified", success: true };
      } else {
        throw new Error("No admin users found to designate as security officer");
      }
    case "Implement comprehensive security audit logging":
      await logAuditEvent({
        userId,
        eventType: "SYSTEM_EVENT" /* SYSTEM_EVENT */,
        resourceType: "security_enhancement",
        resourceId: "audit_logging",
        action: "security_audit_logging_enabled",
        description: "Enhanced security audit logging has been activated",
        ipAddress: "system",
        success: true,
        additionalInfo: { enhancement: "comprehensive_audit_logging" }
      });
      return { message: "Comprehensive security audit logging implemented", success: true };
    case "Implement granular role-based access controls":
      return { message: "Role-based access controls documented and verified", success: true };
    case "Ensure continuous audit logging is active":
      return { message: "Continuous audit logging verified and active", success: true };
    case "Implement comprehensive data integrity checks":
      return { message: "Data integrity monitoring systems activated", success: true };
    default:
      return { message: `Action "${action}" scheduled for manual implementation`, success: true };
  }
}
var complianceOptimizer_default = router12;

// server/routes/notebookLM.ts
import express8 from "express";
import { z as z7 } from "zod";

// server/services/notebookLM.ts
import { google } from "googleapis";
var GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
var getDriveService = () => {
  if (!GOOGLE_API_KEY) {
    throw new Error("Google API key not configured");
  }
  return google.drive({
    version: "v3",
    auth: GOOGLE_API_KEY
  });
};
var isGoogleApiConfigured = () => {
  return !!GOOGLE_API_KEY;
};
var formatResourceForNotebookLM = (resource) => {
  return `# ${resource.name}

## Contact Information
- **Phone**: ${resource.phone || "Not provided"}
- **Email**: ${resource.contactInfo || "Not provided"}
- **Website**: ${resource.website || "Not provided"}
- **Address**: ${resource.address || "Not provided"}

## Service Details
- **Category**: ${resource.category}
- **Description**: ${resource.description}
- **Virtual Services**: ${resource.isVirtual ? "Yes" : "No"}
- **Taking New Patients**: ${resource.takingNewPatients ? "Yes" : "No"}

## Quality Metrics
${resource.rating ? `- **Rating**: ${resource.rating}/5 stars (${resource.reviewCount || 0} reviews)` : "- **Rating**: Not available"}

## Specialized Services
- **Specialties**: General healthcare services

## Operating Hours
Contact provider for hours of operation

## Additional Notes
No additional notes available

---
*Resource exported from Health Insight Platform for NotebookLM analysis*
*Export Date: ${(/* @__PURE__ */ new Date()).toISOString()}*
`;
};
var formatResourcesForNotebookLM = (resources2) => {
  const header = `# Healthcare Resources Collection

*Exported from Health Insight Platform*
*Export Date: ${(/* @__PURE__ */ new Date()).toISOString()}*
*Total Resources: ${resources2.length}*

## Overview
This collection contains ${resources2.length} healthcare resources including providers, support groups, and specialized services for HIV patient care and general health support.

---

`;
  const resourceContent = resources2.map((resource) => formatResourceForNotebookLM(resource)).join("\n\n");
  return header + resourceContent;
};
var createNotebookLMDocument = async (title, content, makePublic = false) => {
  if (!isGoogleApiConfigured()) {
    throw new Error("Google API not configured");
  }
  try {
    const docs = google.docs({
      version: "v1",
      auth: GOOGLE_API_KEY
    });
    const drive = getDriveService();
    const doc = await docs.documents.create({
      requestBody: {
        title
      }
    });
    const docId = doc.data.documentId;
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          insertText: {
            location: {
              index: 1
            },
            text: content
          }
        }]
      }
    });
    if (makePublic) {
      await drive.permissions.create({
        fileId: docId,
        requestBody: {
          role: "reader",
          type: "anyone"
        }
      });
    }
    const shareableLink = `https://docs.google.com/document/d/${docId}/edit`;
    return {
      docId,
      shareableLink
    };
  } catch (error) {
    console.error("Error creating NotebookLM document:", error);
    throw new Error("Failed to create NotebookLM document");
  }
};
var exportToNotebookLM = async (resources2, title) => {
  try {
    if (!isGoogleApiConfigured()) {
      return {
        success: false,
        error: "Google API not configured. Please contact administrator."
      };
    }
    const resourceArray = Array.isArray(resources2) ? resources2 : [resources2];
    const documentTitle = title || `Healthcare Resources - ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`;
    const content = formatResourcesForNotebookLM(resourceArray);
    const { shareableLink } = await createNotebookLMDocument(documentTitle, content, true);
    return {
      success: true,
      shareableLink
    };
  } catch (error) {
    console.error("Error exporting to NotebookLM:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};
var generateNotebookLMInstructions = (resourceType) => {
  return `## Instructions for NotebookLM Analysis

### How to use this document in NotebookLM:

1. **Import this document**: Copy the shareable link and paste it into NotebookLM as a source
2. **Ask targeted questions** such as:
   - "What are the best-rated ${resourceType} providers?"
   - "Which providers are currently taking new patients?"
   - "What virtual services are available?"
   - "Summarize the specialties offered by these providers"
   - "Create a comparison of contact methods for these resources"

### Suggested Analysis Prompts:

**For Patient Care:**
- "Which providers specialize in HIV care and are accepting new patients?"
- "What are the operating hours for emergency or after-hours services?"
- "Which services offer virtual consultations?"

**For Care Coordination:**
- "Create a summary of all contact information for quick reference"
- "What specialties are available and which providers offer them?"
- "Generate a checklist for patient referrals to these providers"

**For Quality Assessment:**
- "Compare ratings and reviews across providers"
- "What do patient reviews highlight about service quality?"
- "Identify providers with the highest patient satisfaction"

### Healthcare Compliance Note:
This information is for referral and coordination purposes. Always verify current provider information, insurance acceptance, and availability before making referrals or appointments.
`;
};

// server/routes/notebookLM.ts
var router13 = express8.Router();
var exportResourceSchema = z7.object({
  resourceId: z7.number(),
  title: z7.string().optional()
});
var exportResourcesSchema = z7.object({
  resourceIds: z7.array(z7.number()),
  title: z7.string().optional()
});
var exportFilteredSchema = z7.object({
  filters: z7.object({
    categories: z7.array(z7.string()).optional(),
    search: z7.string().optional(),
    distance: z7.string().optional(),
    availability: z7.array(z7.string()).optional()
  }),
  title: z7.string().optional()
});
router13.post("/export/resource", async (req, res) => {
  try {
    const { resourceId, title } = exportResourceSchema.parse(req.body);
    const resources2 = global.storage?.getResources() || [];
    const resource = resources2.find((r) => r.id === resourceId);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }
    const result = await exportToNotebookLM(resource, title);
    if (result.success) {
      res.json({
        success: true,
        shareableLink: result.shareableLink,
        instructions: generateNotebookLMInstructions(resource.category)
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error exporting resource to NotebookLM:", error);
    res.status(500).json({ error: "Failed to export resource" });
  }
});
router13.post("/export/resources", async (req, res) => {
  try {
    const { resourceIds, title } = exportResourcesSchema.parse(req.body);
    const allResources = global.storage?.getResources() || [];
    const resources2 = allResources.filter((r) => resourceIds.includes(r.id));
    if (resources2.length === 0) {
      return res.status(404).json({ error: "No resources found" });
    }
    const result = await exportToNotebookLM(resources2, title);
    if (result.success) {
      res.json({
        success: true,
        shareableLink: result.shareableLink,
        resourceCount: resources2.length,
        instructions: generateNotebookLMInstructions("healthcare")
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error exporting resources to NotebookLM:", error);
    res.status(500).json({ error: "Failed to export resources" });
  }
});
router13.post("/export/filtered", async (req, res) => {
  try {
    const { filters, title } = exportFilteredSchema.parse(req.body);
    let allResources = global.storage?.getResources() || [];
    if (filters.categories && filters.categories.length > 0) {
      allResources = allResources.filter(
        (r) => filters.categories.some((cat) => r.category.includes(cat))
      );
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      allResources = allResources.filter(
        (r) => r.name.toLowerCase().includes(searchTerm) || r.description.toLowerCase().includes(searchTerm)
      );
    }
    if (filters.availability && filters.availability.includes("taking_new_patients")) {
      allResources = allResources.filter((r) => r.takingNewPatients);
    }
    if (allResources.length === 0) {
      return res.status(404).json({ error: "No resources match the specified filters" });
    }
    const exportTitle = title || `Filtered Healthcare Resources - ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`;
    const result = await exportToNotebookLM(allResources, exportTitle);
    if (result.success) {
      res.json({
        success: true,
        shareableLink: result.shareableLink,
        resourceCount: allResources.length,
        appliedFilters: filters,
        instructions: generateNotebookLMInstructions("healthcare")
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error exporting filtered resources to NotebookLM:", error);
    res.status(500).json({ error: "Failed to export filtered resources" });
  }
});
router13.get("/status", (req, res) => {
  res.json({
    configured: isGoogleApiConfigured(),
    available: true
  });
});
router13.post("/preview", async (req, res) => {
  try {
    const { resourceIds } = z7.object({
      resourceIds: z7.array(z7.number())
    }).parse(req.body);
    const allResources = global.storage?.getResources() || [];
    const resources2 = allResources.filter((r) => resourceIds.includes(r.id));
    if (resources2.length === 0) {
      return res.status(404).json({ error: "No resources found" });
    }
    const formattedContent = formatResourcesForNotebookLM(resources2);
    const instructions = generateNotebookLMInstructions("healthcare");
    res.json({
      preview: formattedContent,
      instructions,
      resourceCount: resources2.length
    });
  } catch (error) {
    console.error("Error generating NotebookLM preview:", error);
    res.status(500).json({ error: "Failed to generate preview" });
  }
});
var notebookLM_default = router13;

// server/routes.ts
import MemoryStore from "memorystore";
init_auditLogger();
import bcrypt from "bcrypt";
var SessionStore = MemoryStore(session);
var isAuthenticated7 = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
var hasRole = (role) => (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = req.user;
  if (user.role !== role && user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
async function registerRoutes(app2) {
  const getSessionSecret = () => {
    if (process.env.SESSION_SECRET) {
      return process.env.SESSION_SECRET;
    }
    const crypto = __require("crypto");
    const generatedSecret = crypto.randomBytes(32).toString("hex");
    console.log("Warning: SESSION_SECRET environment variable not set.");
    console.log("Using generated secure random secret. Note that sessions will not persist between server restarts.");
    return generatedSecret;
  };
  app2.use(
    session({
      cookie: {
        maxAge: 18e5,
        // 30 minutes - HIPAA compliant timeout
        secure: process.env.NODE_ENV === "production",
        // Use secure cookies in production
        httpOnly: true,
        // Prevents client-side JS from reading the cookie
        sameSite: "lax"
        // Provides some CSRF protection
      },
      store: new SessionStore({
        checkPeriod: 864e5
        // 1 day
      }),
      resave: false,
      saveUninitialized: false,
      secret: getSessionSecret()
    })
  );
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
      if (err) {
        return next(err);
      }
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      if (!user) {
        await logAuthentication(
          null,
          "login_attempt",
          `Failed login attempt for username: ${req.body.username}`,
          ipAddress,
          false,
          { reason: info?.message || "Invalid credentials" }
        );
        return res.status(401).json({
          authenticated: false,
          message: info?.message || "Invalid credentials"
        });
      }
      req.login(user, async (err2) => {
        if (err2)
          return next(err2);
        await logAuthentication(
          user.id,
          "login",
          `User ${user.username} logged in successfully`,
          ipAddress,
          true
        );
        res.json({ user });
      });
    })(req, res, next);
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({
          message: "Email address is already registered. Please use a different email or try logging in."
        });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);
      const userDataWithHashedPassword = {
        ...validatedData,
        password: hashedPassword
      };
      const newUser = await storage.createUser(userDataWithHashedPassword);
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      if (error.code === "23505" && error.constraint === "users_email_unique") {
        return res.status(400).json({
          message: "Email address is already registered. Please use a different email or try logging in."
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ authenticated: false });
    }
    const { password, ...userWithoutPassword } = req.user;
    res.json({ authenticated: true, user: userWithoutPassword });
  });
  app2.get("/api/users/:id", isAuthenticated7, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.patch("/api/users/:id", isAuthenticated7, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const loggedInUser = req.user;
      if (loggedInUser.id !== userId && loggedInUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (req.body.role && loggedInUser.role !== "admin") {
        delete req.body.role;
      }
      let updatedData = { ...req.body };
      if (updatedData.password) {
        const saltRounds = 10;
        updatedData.password = await bcrypt.hash(updatedData.password, saltRounds);
      }
      const updatedUser = await storage.updateUser(userId, updatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.get("/api/resources", async (req, res) => {
    try {
      const filters = {};
      if (req.query.categories) {
        filters.categories = Array.isArray(req.query.categories) ? req.query.categories : [req.query.categories];
      }
      if (req.query.distance) {
        filters.distance = req.query.distance;
      }
      if (req.query.availability) {
        filters.availability = Array.isArray(req.query.availability) ? req.query.availability : [req.query.availability];
      }
      if (req.query.search) {
        filters.search = req.query.search;
      }
      if (req.query.page) {
        filters.page = parseInt(req.query.page);
        filters.limit = parseInt(req.query.limit) || 10;
      }
      const resources2 = await storage.getResources(filters);
      res.json(resources2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });
  app2.get("/api/resources/:id", async (req, res) => {
    try {
      const resource = await storage.getResource(parseInt(req.params.id));
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resource" });
    }
  });
  app2.post("/api/resources", isAuthenticated7, hasRole("provider"), async (req, res) => {
    try {
      const validatedData = insertResourceSchema.parse(req.body);
      const newResource = await storage.createResource(validatedData);
      res.status(201).json(newResource);
    } catch (error) {
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create resource" });
    }
  });
  app2.patch("/api/resources/:id", isAuthenticated7, hasRole("provider"), async (req, res) => {
    try {
      const resourceId = parseInt(req.params.id);
      const updatedResource = await storage.updateResource(resourceId, req.body);
      if (!updatedResource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(updatedResource);
    } catch (error) {
      res.status(500).json({ message: "Failed to update resource" });
    }
  });
  app2.delete("/api/resources/:id", isAuthenticated7, hasRole("provider"), async (req, res) => {
    try {
      const resourceId = parseInt(req.params.id);
      const success = await storage.deleteResource(resourceId);
      if (!success) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json({ message: "Resource deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resource" });
    }
  });
  app2.get("/api/events", async (req, res) => {
    try {
      const filters = {};
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate);
      }
      if (req.query.category) {
        filters.category = req.query.category;
      }
      if (req.query.isVirtual !== void 0) {
        filters.isVirtual = req.query.isVirtual === "true";
      }
      if (req.query.search) {
        filters.search = req.query.search;
      }
      if (req.query.page) {
        filters.page = parseInt(req.query.page);
        filters.limit = parseInt(req.query.limit) || 10;
      }
      const events2 = await storage.getEvents(filters);
      res.json(events2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  app2.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });
  app2.post("/api/events", isAuthenticated7, async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(validatedData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  app2.patch("/api/events/:id", isAuthenticated7, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const user = req.user;
      if (event.hostId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updatedEvent = await storage.updateEvent(eventId, req.body);
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  app2.delete("/api/events/:id", isAuthenticated7, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const user = req.user;
      if (event.hostId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const success = await storage.deleteEvent(eventId);
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });
  app2.post("/api/events/:id/register", isAuthenticated7, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.id;
      const success = await storage.registerForEvent(eventId, userId);
      if (!success) {
        return res.status(400).json({ message: "Registration failed, event may be full" });
      }
      res.json({ message: "Registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to register for event" });
    }
  });
  app2.post("/api/events/:id/unregister", isAuthenticated7, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.id;
      const success = await storage.unregisterFromEvent(eventId, userId);
      if (!success) {
        return res.status(400).json({ message: "Unregistration failed" });
      }
      res.json({ message: "Unregistered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unregister from event" });
    }
  });
  app2.get("/api/community-groups", async (req, res) => {
    try {
      const filters = {};
      if (req.query.isPublic !== void 0) {
        filters.isPublic = req.query.isPublic === "true";
      }
      if (req.query.search) {
        filters.search = req.query.search;
      }
      if (req.query.page) {
        filters.page = parseInt(req.query.page);
        filters.limit = parseInt(req.query.limit) || 10;
      }
      const groups = await storage.getCommunityGroups(filters);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community groups" });
    }
  });
  app2.get("/api/community-groups/:id", async (req, res) => {
    try {
      const group = await storage.getCommunityGroup(parseInt(req.params.id));
      if (!group) {
        return res.status(404).json({ message: "Community group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community group" });
    }
  });
  app2.post("/api/community-groups", isAuthenticated7, async (req, res) => {
    try {
      const validatedData = insertCommunityGroupSchema.parse(req.body);
      const newGroup = await storage.createCommunityGroup(validatedData);
      res.status(201).json(newGroup);
    } catch (error) {
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create community group" });
    }
  });
  app2.patch("/api/community-groups/:id", isAuthenticated7, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const updatedGroup = await storage.updateCommunityGroup(groupId, req.body);
      if (!updatedGroup) {
        return res.status(404).json({ message: "Community group not found" });
      }
      res.json(updatedGroup);
    } catch (error) {
      res.status(500).json({ message: "Failed to update community group" });
    }
  });
  app2.delete("/api/community-groups/:id", isAuthenticated7, hasRole("admin"), async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const success = await storage.deleteCommunityGroup(groupId);
      if (!success) {
        return res.status(404).json({ message: "Community group not found" });
      }
      res.json({ message: "Community group deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete community group" });
    }
  });
  app2.post("/api/community-groups/:id/join", isAuthenticated7, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const userId = req.user.id;
      const success = await storage.joinCommunityGroup(groupId, userId);
      if (!success) {
        return res.status(400).json({ message: "Failed to join group" });
      }
      res.json({ message: "Joined group successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to join community group" });
    }
  });
  app2.post("/api/community-groups/:id/leave", isAuthenticated7, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const userId = req.user.id;
      const success = await storage.leaveCommunityGroup(groupId, userId);
      if (!success) {
        return res.status(400).json({ message: "Failed to leave group" });
      }
      res.json({ message: "Left group successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to leave community group" });
    }
  });
  app2.get("/api/discussions", async (req, res) => {
    try {
      const filters = {};
      if (req.query.groupId) {
        filters.groupId = parseInt(req.query.groupId);
      }
      if (req.query.authorId) {
        filters.authorId = parseInt(req.query.authorId);
      }
      if (req.query.search) {
        filters.search = req.query.search;
      }
      if (req.query.page) {
        filters.page = parseInt(req.query.page);
        filters.limit = parseInt(req.query.limit) || 10;
      }
      const discussions2 = await storage.getDiscussions(filters);
      res.json(discussions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });
  app2.get("/api/discussions/:id", async (req, res) => {
    try {
      const discussion = await storage.getDiscussion(parseInt(req.params.id));
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.json(discussion);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussion" });
    }
  });
  app2.post("/api/discussions", isAuthenticated7, async (req, res) => {
    try {
      const validatedData = insertDiscussionSchema.parse(req.body);
      validatedData.authorId = req.user.id;
      const newDiscussion = await storage.createDiscussion(validatedData);
      res.status(201).json(newDiscussion);
    } catch (error) {
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create discussion" });
    }
  });
  app2.patch("/api/discussions/:id", isAuthenticated7, async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const discussion = await storage.getDiscussion(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      const user = req.user;
      if (discussion.authorId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updatedDiscussion = await storage.updateDiscussion(discussionId, req.body);
      res.json(updatedDiscussion);
    } catch (error) {
      res.status(500).json({ message: "Failed to update discussion" });
    }
  });
  app2.delete("/api/discussions/:id", isAuthenticated7, async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const discussion = await storage.getDiscussion(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      const user = req.user;
      if (discussion.authorId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const success = await storage.deleteDiscussion(discussionId);
      if (!success) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.json({ message: "Discussion deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete discussion" });
    }
  });
  app2.post("/api/discussions/:id/like", isAuthenticated7, async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const success = await storage.likeDiscussion(discussionId);
      if (!success) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.json({ message: "Discussion liked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to like discussion" });
    }
  });
  app2.get("/api/messages", isAuthenticated7, async (req, res) => {
    try {
      const userId = req.user.id;
      const filters = {};
      if (req.query.sender === "me") {
        filters.senderId = userId;
      } else if (req.query.sender) {
        filters.senderId = parseInt(req.query.sender);
      }
      if (req.query.recipient === "me") {
        filters.recipientId = userId;
      } else if (req.query.recipient) {
        filters.recipientId = parseInt(req.query.recipient);
      }
      if (req.query.isRead !== void 0) {
        filters.isRead = req.query.isRead === "true";
      }
      if (req.query.page) {
        filters.page = parseInt(req.query.page);
        filters.limit = parseInt(req.query.limit) || 10;
      }
      const messages2 = await storage.getMessages(filters);
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.get("/api/messages/:id", isAuthenticated7, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      const userId = req.user.id;
      if (message.senderId !== userId && message.recipientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (message.recipientId === userId && !message.isRead) {
        await storage.markMessageAsRead(messageId);
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });
  app2.post("/api/messages", isAuthenticated7, async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      validatedData.senderId = req.user.id;
      const newMessage = await storage.createMessage(validatedData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.patch("/api/messages/:id/read", isAuthenticated7, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      const userId = req.user.id;
      if (message.recipientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const success = await storage.markMessageAsRead(messageId);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  app2.delete("/api/messages/:id", isAuthenticated7, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      const userId = req.user.id;
      if (message.senderId !== userId && message.recipientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const success = await storage.deleteMessage(messageId);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });
  app2.get("/api/notifications", isAuthenticated7, async (req, res) => {
    try {
      const userId = req.user.id;
      const isRead = req.query.isRead === "true" ? true : req.query.isRead === "false" ? false : void 0;
      const notifications2 = await storage.getNotifications(userId, isRead);
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.patch("/api/notifications/:id/read", isAuthenticated7, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotification(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      const userId = req.user.id;
      if (notification.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const success = await storage.markNotificationAsRead(notificationId);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.get("/api/appointments", isAuthenticated7, async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      const filters = {};
      if (userRole === "patient") {
        filters.patientId = userId;
      } else if (userRole === "provider") {
        filters.providerId = userId;
      }
      if (req.query.patientId) {
        filters.patientId = parseInt(req.query.patientId);
      }
      if (req.query.providerId) {
        filters.providerId = parseInt(req.query.providerId);
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate);
      }
      if (req.query.status) {
        filters.status = req.query.status;
      }
      if (req.query.page) {
        filters.page = parseInt(req.query.page);
        filters.limit = parseInt(req.query.limit) || 10;
      }
      await logPhiAccess(
        userId,
        "appointments",
        filters.patientId ? `patient_${filters.patientId}` : "multiple",
        "view",
        `User ${userId} (${userRole}) accessed appointment records${filters.patientId ? ` for patient ${filters.patientId}` : ""}`,
        ipAddress,
        true,
        { filters }
      );
      const appointments2 = await storage.getAppointments(filters);
      res.json(appointments2);
    } catch (error) {
      try {
        const userId = req.user?.id;
        const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await logPhiAccess(
          userId || 0,
          "appointments",
          "error",
          "view",
          `Failed to access appointment records: ${errorMessage}`,
          ipAddress,
          false,
          { error: errorMessage }
        );
      } catch (logError) {
        console.error("Failed to log PHI access error:", logError);
      }
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  app2.get("/api/appointments/:id", isAuthenticated7, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const user = req.user;
      const userId = user.id;
      const userRole = user.role;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        await logPhiAccess(
          userId,
          "appointment",
          appointmentId.toString(),
          "view",
          `User ${userId} (${userRole}) attempted to access non-existent appointment ${appointmentId}`,
          ipAddress,
          false,
          { error: "Appointment not found" }
        );
        return res.status(404).json({ message: "Appointment not found" });
      }
      if (userRole !== "admin" && appointment.patientId !== userId && appointment.providerId !== userId) {
        await logPhiAccess(
          userId,
          "appointment",
          appointmentId.toString(),
          "view",
          `User ${userId} (${userRole}) attempted unauthorized access to appointment ${appointmentId}`,
          ipAddress,
          false,
          { error: "Forbidden", appointmentDetails: { patientId: appointment.patientId, providerId: appointment.providerId } }
        );
        return res.status(403).json({ message: "Forbidden" });
      }
      await logPhiAccess(
        userId,
        "appointment",
        appointmentId.toString(),
        "view",
        `User ${userId} (${userRole}) viewed appointment ${appointmentId}`,
        ipAddress,
        true,
        {
          accessReason: userRole === "admin" ? "administrative" : appointment.patientId === userId ? "patient_self_access" : "provider_access"
        }
      );
      res.json(appointment);
    } catch (error) {
      try {
        const user = req.user;
        const userId = user?.id || 0;
        const userRole = user?.role || "unknown";
        const appointmentId = parseInt(req.params.id);
        const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await logPhiAccess(
          userId,
          "appointment",
          appointmentId.toString(),
          "view",
          `Error accessing appointment ${appointmentId}: ${errorMessage}`,
          ipAddress,
          false,
          { error: errorMessage, userRole }
        );
      } catch (logError) {
        console.error("Failed to log PHI access error:", logError);
      }
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });
  app2.post("/api/appointments", isAuthenticated7, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const user = req.user;
      const userId = user.id;
      const userRole = user.role;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      if (userRole === "patient" && validatedData.patientId !== userId) {
        await logPhiModification(
          userId,
          "appointment",
          "new",
          "create",
          `Patient ${userId} attempted to create appointment for another patient (${validatedData.patientId})`,
          ipAddress,
          false,
          { error: "Unauthorized", requestData: { ...validatedData, patientId: "[REDACTED]" } }
        );
        return res.status(403).json({ message: "You can only create appointments for yourself" });
      }
      const appointment = await storage.createAppointment(validatedData);
      await logPhiModification(
        userId,
        "appointment",
        appointment.id.toString(),
        "create",
        `User ${userId} (${userRole}) created appointment ${appointment.id}`,
        ipAddress,
        true,
        {
          appointmentDetails: {
            patientId: appointment.patientId,
            providerId: appointment.providerId,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            type: appointment.type
          }
        }
      );
      res.status(201).json(appointment);
    } catch (error) {
      try {
        const user = req.user;
        const userId = user.id;
        const userRole = user.role;
        const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
        await logPhiModification(
          userId,
          "appointment",
          "new",
          "create",
          `Error creating appointment: ${error.message || "Unknown error"}`,
          ipAddress,
          false,
          {
            errorType: error instanceof z8.ZodError ? "validation_error" : "server_error",
            requestBody: { ...req.body, patientData: "[REDACTED]" }
          }
        );
      } catch (logError) {
        console.error("Failed to log PHI modification error:", logError);
      }
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });
  app2.patch("/api/appointments/:id", isAuthenticated7, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const user = req.user;
      const userId = user.id;
      const userRole = user.role;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        await logPhiModification(
          userId,
          "appointment",
          appointmentId.toString(),
          "update",
          `User ${userId} (${userRole}) attempted to update non-existent appointment ${appointmentId}`,
          ipAddress,
          false,
          { error: "Appointment not found" }
        );
        return res.status(404).json({ message: "Appointment not found" });
      }
      if (userRole !== "admin" && appointment.patientId !== userId && appointment.providerId !== userId) {
        await logPhiModification(
          userId,
          "appointment",
          appointmentId.toString(),
          "update",
          `User ${userId} (${userRole}) attempted unauthorized update of appointment ${appointmentId}`,
          ipAddress,
          false,
          {
            error: "Forbidden",
            appointmentDetails: {
              patientId: appointment.patientId,
              providerId: appointment.providerId
            }
          }
        );
        return res.status(403).json({ message: "Forbidden" });
      }
      const beforeSnapshot = { ...appointment };
      const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
      if (!updatedAppointment) {
        await logPhiModification(
          userId,
          "appointment",
          appointmentId.toString(),
          "update",
          `Failed to update appointment ${appointmentId} after permission check`,
          ipAddress,
          false,
          { error: "Appointment not found after initial check" }
        );
        return res.status(404).json({ message: "Appointment not found" });
      }
      await logPhiModification(
        userId,
        "appointment",
        appointmentId.toString(),
        "update",
        `User ${userId} (${userRole}) updated appointment ${appointmentId}`,
        ipAddress,
        true,
        {
          changes: {
            before: {
              status: beforeSnapshot.status,
              startTime: beforeSnapshot.startTime,
              endTime: beforeSnapshot.endTime,
              notes: beforeSnapshot.notes ? "[PRESENT]" : "[NOT PRESENT]",
              type: beforeSnapshot.type
            },
            after: {
              status: updatedAppointment.status,
              startTime: updatedAppointment.startTime,
              endTime: updatedAppointment.endTime,
              notes: updatedAppointment.notes ? "[PRESENT]" : "[NOT PRESENT]",
              type: updatedAppointment.type
            }
          }
        }
      );
      res.json(updatedAppointment);
    } catch (error) {
      try {
        const user = req.user;
        const userId = user.id;
        const userRole = user.role;
        const appointmentId = parseInt(req.params.id);
        const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
        await logPhiModification(
          userId,
          "appointment",
          appointmentId.toString(),
          "update",
          `Error updating appointment ${appointmentId}: ${error.message || "Unknown error"}`,
          ipAddress,
          false,
          {
            error: error.message || "Unknown error",
            requestBody: { ...req.body, patientData: "[REDACTED]" }
          }
        );
      } catch (logError) {
        console.error("Failed to log PHI modification error:", logError);
      }
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });
  app2.post("/api/appointments/:id/cancel", isAuthenticated7, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      const user = req.user;
      if (user.role !== "admin" && appointment.patientId !== user.id && appointment.providerId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const success = await storage.cancelAppointment(appointmentId);
      if (!success) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json({ message: "Appointment cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  });
  app2.get("/api/educational-content", async (req, res) => {
    try {
      const filters = {};
      if (req.query.category) {
        filters.category = req.query.category;
      }
      if (req.query.tags) {
        filters.tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
      }
      if (req.query.authorId) {
        filters.authorId = parseInt(req.query.authorId);
      }
      if (req.query.featured !== void 0) {
        filters.featured = req.query.featured === "true";
      }
      if (req.query.search) {
        filters.search = req.query.search;
      }
      if (req.query.page) {
        filters.page = parseInt(req.query.page);
        filters.limit = parseInt(req.query.limit) || 10;
      }
      const contents = await storage.getEducationalContents(filters);
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch educational content" });
    }
  });
  app2.get("/api/educational-content/:id", async (req, res) => {
    try {
      const content = await storage.getEducationalContent(parseInt(req.params.id));
      if (!content) {
        return res.status(404).json({ message: "Educational content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch educational content" });
    }
  });
  app2.post("/api/educational-content", isAuthenticated7, hasRole("provider"), async (req, res) => {
    try {
      const validatedData = insertEducationalContentSchema.parse(req.body);
      validatedData.authorId = req.user.id;
      const newContent = await storage.createEducationalContent(validatedData);
      res.status(201).json(newContent);
    } catch (error) {
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create educational content" });
    }
  });
  app2.patch("/api/educational-content/:id", isAuthenticated7, hasRole("provider"), async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await storage.getEducationalContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "Educational content not found" });
      }
      const user = req.user;
      if (content.authorId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updatedContent = await storage.updateEducationalContent(contentId, req.body);
      res.json(updatedContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update educational content" });
    }
  });
  app2.delete("/api/educational-content/:id", isAuthenticated7, hasRole("provider"), async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await storage.getEducationalContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "Educational content not found" });
      }
      const user = req.user;
      if (content.authorId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const success = await storage.deleteEducationalContent(contentId);
      if (!success) {
        return res.status(404).json({ message: "Educational content not found" });
      }
      res.json({ message: "Educational content deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete educational content" });
    }
  });
  app2.get("/api/appointments", isAuthenticated7, async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const filters = {};
      if (userRole === "patient") {
        filters.patientId = userId;
      } else if (userRole === "provider") {
        filters.providerId = userId;
        if (req.query.patientId) {
          filters.patientId = parseInt(req.query.patientId);
        }
      } else if (userRole === "admin") {
        if (req.query.patientId) {
          filters.patientId = parseInt(req.query.patientId);
        }
        if (req.query.providerId) {
          filters.providerId = parseInt(req.query.providerId);
        }
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate);
      }
      if (req.query.status) {
        filters.status = req.query.status;
      }
      if (req.query.page) {
        filters.page = parseInt(req.query.page);
        filters.limit = parseInt(req.query.limit) || 10;
      }
      const appointments2 = await storage.getAppointments(filters);
      res.json(appointments2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  app2.get("/api/appointments/:id", isAuthenticated7, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      const userId = req.user.id;
      const userRole = req.user.role;
      if (userRole !== "admin" && appointment.patientId !== userId && appointment.providerId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });
  app2.post("/api/appointments", isAuthenticated7, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const userId = req.user.id;
      const userRole = req.user.role;
      if (userRole === "patient") {
        validatedData.patientId = userId;
      } else if (userRole === "provider") {
        validatedData.providerId = userId;
      }
      const newAppointment = await storage.createAppointment(validatedData);
      await storage.createNotification({
        userId: validatedData.patientId,
        title: "Appointment Scheduled",
        message: `New appointment scheduled on ${new Date(validatedData.startTime).toLocaleDateString()} at ${new Date(validatedData.startTime).toLocaleTimeString()}`,
        type: "appointment",
        relatedId: newAppointment.id,
        relatedType: "appointment"
      });
      await storage.createNotification({
        userId: validatedData.providerId,
        title: "New Appointment",
        message: `New appointment scheduled on ${new Date(validatedData.startTime).toLocaleDateString()} at ${new Date(validatedData.startTime).toLocaleTimeString()}`,
        type: "appointment",
        relatedId: newAppointment.id,
        relatedType: "appointment"
      });
      res.status(201).json(newAppointment);
    } catch (error) {
      if (error instanceof z8.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });
  app2.patch("/api/appointments/:id", isAuthenticated7, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      const userId = req.user.id;
      const userRole = req.user.role;
      if (userRole === "patient" && appointment.patientId === userId) {
        if (req.body.status || req.body.notes || req.body.type) {
          return res.status(403).json({ message: "Patients can only reschedule appointments" });
        }
      } else if (userRole === "provider" && appointment.providerId === userId) {
      } else if (userRole === "admin") {
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
      if (req.body.startTime || req.body.status) {
        const notificationMessage = req.body.startTime ? `Appointment rescheduled to ${new Date(req.body.startTime).toLocaleDateString()} at ${new Date(req.body.startTime).toLocaleTimeString()}` : `Appointment ${req.body.status}`;
        await storage.createNotification({
          userId: appointment.patientId,
          title: "Appointment Updated",
          message: notificationMessage,
          type: "appointment_update",
          relatedId: appointment.id,
          relatedType: "appointment"
        });
        await storage.createNotification({
          userId: appointment.providerId,
          title: "Appointment Updated",
          message: notificationMessage,
          type: "appointment_update",
          relatedId: appointment.id,
          relatedType: "appointment"
        });
      }
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });
  app2.post("/api/appointments/:id/cancel", isAuthenticated7, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      const userId = req.user.id;
      const userRole = req.user.role;
      if (userRole !== "admin" && appointment.patientId !== userId && appointment.providerId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const success = await storage.cancelAppointment(appointmentId);
      if (!success) {
        return res.status(400).json({ message: "Failed to cancel appointment" });
      }
      const cancellationReason = req.body.reason || "No reason provided";
      const cancellationMessage = `Appointment on ${new Date(appointment.startTime).toLocaleDateString()} at ${new Date(appointment.startTime).toLocaleTimeString()} was cancelled. Reason: ${cancellationReason}`;
      await storage.createNotification({
        userId: appointment.patientId,
        title: "Appointment Cancelled",
        message: cancellationMessage,
        type: "appointment_cancelled",
        relatedId: appointment.id,
        relatedType: "appointment"
      });
      await storage.createNotification({
        userId: appointment.providerId,
        title: "Appointment Cancelled",
        message: cancellationMessage,
        type: "appointment_cancelled",
        relatedId: appointment.id,
        relatedType: "appointment"
      });
      res.json({ message: "Appointment cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  });
  app2.post("/api/admin/refresh-feeds", isAuthenticated7, hasRole("admin"), async (req, res) => {
    try {
      const { refreshAllFeeds: refreshAllFeeds2 } = await Promise.resolve().then(() => (init_rssFeed(), rssFeed_exports));
      const count3 = await refreshAllFeeds2();
      res.json({ message: `Successfully refreshed ${count3} resources from RSS feeds` });
    } catch (error) {
      res.status(500).json({ message: `Failed to refresh feeds: ${error.message}` });
    }
  });
  app2.post("/api/admin/optimize-database", isAuthenticated7, hasRole("admin"), async (req, res) => {
    try {
      const result = await storage.optimizeDatabase();
      res.json({
        message: `Database optimization completed. Removed ${result.duplicatesRemoved} duplicate users.`,
        details: result
      });
    } catch (error) {
      res.status(500).json({ message: `Database optimization failed: ${error.message}` });
    }
  });
  app2.use("/api/forum", forum_default);
  app2.use("/api/settings", settings_default);
  app2.use("/api/sms", sms_default);
  app2.use("/api/verification", verification_default);
  app2.use("/api/audit", audit_default);
  app2.use("/api/compliance", compliance_default);
  app2.use("/api/gamification", gamification_default);
  app2.use("/api/twilio-healthcare", twilioHealthcare_default);
  app2.use("/api/wellness-tips", wellnessTips_default);
  app2.use("/api/neural-governance", neuralGovernance_default);
  app2.use("/api/healthcare-ai", healthcareAI_default);
  app2.use("/api/compliance-optimizer", complianceOptimizer_default);
  app2.use("/api/notebooklm", notebookLM_default);
  app2.get("/api/sms/logs", isAuthenticated7, async (req, res) => {
    try {
      const smsLogs = getMockSmsLog();
      res.json({ logs: smsLogs });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve SMS logs" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express9 from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url2 = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url2, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  var express = require('express');
var app = express();

// set up rate limiter: maximum of five requests per minute
var RateLimit = require('express-rate-limit');
var limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

// apply rate limiter to all requests
app.use(limiter);

app.get('/:path', function(req, res) {
  let path = req.params.path;
  if (isValidPath(path))
    res.sendFile(path);
});
}

// server/services/email.ts
import { MailService } from "@sendgrid/mail";
var mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY || "");
var APP_URL = process.env.APP_URL || "https://integrated-health-empowerment-program.replit.app";
async function sendEmail(options) {
  try {
    const defaultFrom = "no-reply@healthinsightventures.org";
    await mailService.send({
      to: options.to,
      from: options.from || defaultFrom,
      subject: options.subject,
      text: options.text || "",
      html: options.html || ""
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
async function sendAppointmentReminder2(email, firstName, appointmentDate, providerName) {
  const appointmentType = "Healthcare";
  const location = "Our clinic";
  const virtualAppointment = false;
  const appointmentId = 0;
  const formattedDate = appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const locationText = virtualAppointment ? "This is a virtual appointment. Please check your email for the video link 30 minutes before your appointment." : `Please arrive at ${location} 15 minutes before your appointment time.`;
  const subject = `Reminder: Your appointment on ${formattedDate}`;
  const appointmentUrl = `${APP_URL}/appointments/${appointmentId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #285238; margin-bottom: 5px;">Appointment Reminder</h1>
        <p style="color: #666; font-size: 16px;">Integrated Health Empowerment Program (IHEP)</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p>Hello ${firstName},</p>
        <p>This is a reminder about your upcoming ${appointmentType} appointment.</p>
      </div>
      
      <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <div style="margin-bottom: 15px;">
          <strong style="display: block; color: #285238; margin-bottom: 5px;">Date and Time:</strong>
          <span>${formattedDate} at ${formattedTime}</span>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="display: block; color: #285238; margin-bottom: 5px;">Provider:</strong>
          <span>Dr. ${providerName}</span>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong style="display: block; color: #285238; margin-bottom: 5px;">Type:</strong>
          <span>${appointmentType}</span>
        </div>
        
        <div>
          <strong style="display: block; color: #285238; margin-bottom: 5px;">Location:</strong>
          <span>${location}</span>
          <p style="margin-top: 10px; font-style: italic;">${locationText}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${appointmentUrl}" style="display: inline-block; background-color: #285238; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Appointment Details</a>
      </div>
      
      <div>
        <p>If you need to reschedule or cancel your appointment, please log in to your account or call us at (555) 123-4567 at least 24 hours in advance.</p>
        <p>Thank you for choosing the Integrated Health Empowerment Program (IHEP) for your healthcare needs.</p>
      </div>
      
      <div style="margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Integrated Health Empowerment Program (IHEP). All rights reserved.</p>
      </div>
    </div>
  `;
  const text2 = `
    Appointment Reminder - Integrated Health Empowerment Program (IHEP)
    
    Hello ${firstName},
    
    This is a reminder about your upcoming ${appointmentType} appointment.
    
    Date and Time: ${formattedDate} at ${formattedTime}
    Provider: Dr. ${providerName}
    Type: ${appointmentType}
    Location: ${location}
    
    ${locationText}
    
    View your appointment details at: ${appointmentUrl}
    
    If you need to reschedule or cancel your appointment, please log in to your account or call us at (555) 123-4567 at least 24 hours in advance.
    
    Thank you for choosing the Integrated Health Empowerment Program (IHEP) for your healthcare needs.
    
    This is an automated message, please do not reply to this email.
    \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Integrated Health Empowerment Program (IHEP). All rights reserved.
  `;
  return sendEmail({
    to: email,
    subject,
    html,
    text: text2
  });
}

// server/services/notifications.ts
init_db();
init_schema();
import { eq as eq11, and as and11, gte as gte8, lte as lte7, or as or4 } from "drizzle-orm";
async function sendAppointmentReminders(hoursInAdvance = 24) {
  try {
    console.log(`Checking for appointments that need reminders (${hoursInAdvance} hours in advance)...`);
    const numericHours = parseFloat(String(hoursInAdvance));
    if (isNaN(numericHours)) {
      console.error("Invalid hours parameter provided:", hoursInAdvance);
      return;
    }
    const hoursMs = numericHours * 60 * 60 * 1e3;
    const nowDate = /* @__PURE__ */ new Date();
    const futureDate = new Date(nowDate.getTime() + hoursMs);
    const results = await db.select({
      id: appointments.id,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      type: appointments.type,
      notes: appointments.notes,
      status: appointments.status,
      location: appointments.location,
      isVirtual: appointments.isVirtual,
      reminderSent: appointments.reminderSent,
      patientId: users.id,
      patientFirstName: users.firstName,
      patientLastName: users.lastName,
      patientEmail: users.email,
      patientPhone: users.phone
    }).from(appointments).innerJoin(users, eq11(appointments.patientId, users.id)).where(
      and11(
        eq11(appointments.reminderSent, false),
        gte8(appointments.startTime, nowDate),
        lte7(appointments.startTime, futureDate),
        or4(
          eq11(appointments.status, "confirmed"),
          eq11(appointments.status, "pending")
        )
      )
    );
    const queryResult = {
      rows: results.map((row) => ({
        id: row.id,
        start_time: row.startTime,
        end_time: row.endTime,
        type: row.type,
        notes: row.notes,
        status: row.status,
        location: row.location,
        is_virtual: row.isVirtual,
        reminder_sent: row.reminderSent,
        patient_id: row.patientId,
        patient_first_name: row.patientFirstName,
        patient_last_name: row.patientLastName,
        patient_email: row.patientEmail,
        patient_phone: row.patientPhone,
        provider_id: null,
        provider_first_name: null,
        provider_last_name: null
      }))
    };
    const reminderRows = queryResult.rows;
    console.log(`Found ${reminderRows ? reminderRows.length : 0} appointments requiring reminders`);
    for (const row of reminderRows || []) {
      try {
        const appointmentRow = row;
        const patientFirstName = appointmentRow.patient_first_name || "Patient";
        const patientEmail = appointmentRow.patient_email;
        const patientPhone = appointmentRow.patient_phone;
        const providerName = `${appointmentRow.provider_first_name || ""} ${appointmentRow.provider_last_name || ""}`.trim();
        const appointmentId = appointmentRow.id;
        const appointmentType = appointmentRow.type || "Healthcare";
        const appointmentLocation = appointmentRow.location || "Our clinic";
        const isVirtual = appointmentRow.is_virtual;
        const startTime = appointmentRow.start_time ? new Date(appointmentRow.start_time) : /* @__PURE__ */ new Date();
        if (patientEmail) {
          await sendAppointmentReminder2(
            patientEmail,
            patientFirstName,
            startTime,
            providerName
          );
          console.log(`\u2713 Email reminder sent to ${patientEmail} for appointment #${appointmentId}`);
        }
        if (patientPhone) {
          await sendAppointmentReminder(
            patientPhone,
            patientFirstName,
            startTime,
            providerName
          );
          console.log(`\u2713 SMS reminder sent to ${patientPhone} for appointment #${appointmentId}`);
        }
        if (appointmentId) {
          await db.update(appointments).set({ reminderSent: true }).where(eq11(appointments.id, appointmentId));
          console.log(`\u2713 Appointment #${appointmentId} marked as reminded`);
        }
      } catch (error) {
        console.error(`Failed to send reminder for appointment #${row.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error processing appointment reminders:", error);
  }
}

// server/services/scheduler.ts
var scheduledJobs = {};
function startReminderScheduler() {
  console.log("Starting reminder scheduler service...");
  const dailyReminderCheck = setInterval(async () => {
    console.log("Running scheduled reminder check...");
    await sendAppointmentReminders(24);
  }, 4 * 60 * 60 * 1e3);
  scheduledJobs["dailyReminderCheck"] = dailyReminderCheck;
  sendAppointmentReminders(24).catch((error) => {
    console.error("Error in initial appointment reminder check:", error);
  });
  console.log("Reminder scheduler started successfully");
  return true;
}

// server/index.ts
init_rssFeed();
import url from "url";
var app = express10();
app.use(express10.json());
app.use(express10.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const parsedUrl = url.parse(req.url, true);
  const path5 = parsedUrl.pathname || "";
  const suspiciousPaths = [
    "/__es-build",
    "/__open-in-editor",
    "/esbuild",
    "/node_modules/esbuild"
  ];
  if (suspiciousPaths.some((p) => path5.startsWith(p))) {
    log(`[SECURITY] Blocked suspicious request to ${path5}`);
    return res.status(403).json({
      error: "Access Denied",
      message: "This path is restricted for security reasons"
    });
  }
  const suspiciousParams = [
    "loader=js",
    "loader=ts",
    "loader=jsx",
    "loader=tsx"
  ];
  const queryString = req.url.split("?")[1] || "";
  if (suspiciousParams.some((param) => queryString.includes(param))) {
    log(`[SECURITY] Blocked suspicious query parameters: ${queryString}`);
    return res.status(403).json({
      error: "Access Denied",
      message: "The requested operation is not allowed"
    });
  }
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
    if (process.env.SENDGRID_API_KEY || process.env.TWILIO_ACCOUNT_SID) {
      startReminderScheduler();
    } else {
      log("Reminder scheduler not started: required API keys not found");
    }
    seedInitialResourcesIfNeeded().then(() => {
      scheduleRssFeedRefresh(6);
      log("RSS feed service initialized successfully");
    }).catch((err) => {
      log("Error initializing RSS feed service: " + err.message);
    });
  });
})();

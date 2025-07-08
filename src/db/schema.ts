import { pgTable, serial, text, varchar, integer, timestamp, boolean, jsonb, uuid, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  bio: text('bio'),
  avatar: text('avatar'),
  location: varchar('location', { length: 100 }),
  website: text('website'),
  github: varchar('github', { length: 100 }),
  twitter: varchar('twitter', { length: 100 }),
  linkedin: varchar('linkedin', { length: 100 }),
  discord: varchar('discord', { length: 100 }),
  totalPoints: integer('total_points').default(0),
  monthlyPoints: integer('monthly_points').default(0),
  projectCount: integer('project_count').default(0),
  role: varchar('role', { length: 50 }).default('user'),
  isActive: boolean('is_active').default(true),
  lastActiveAt: timestamp('last_active_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'saas', 'tool', 'game', 'website', 'mobile'
  status: varchar('status', { length: 50 }).default('development'), // 'development', 'live', 'archived'
  
  // Links
  githubUrl: text('github_url'),
  liveUrl: text('live_url'),
  appStoreUrl: text('app_store_url'),
  playStoreUrl: text('play_store_url'),
  discordUrl: text('discord_url'),
  documentationUrl: text('documentation_url'),
  
  // Images
  screenshots: jsonb('screenshots').$type<string[]>().default([]),
  
  // Technologies & Tags
  technologies: jsonb('technologies').$type<string[]>().default([]),
  tags: jsonb('tags').$type<string[]>().default([]),
  
  // Metrics
  totalPoints: integer('total_points').default(0),
  githubStars: integer('github_stars').default(0),
  uniqueVisitors: integer('unique_visitors').default(0),
  uptime: integer('uptime').default(100), // percentage
  upvotes: integer('upvotes').default(0),
  downvotes: integer('downvotes').default(0),
  viewCount: integer('view_count').default(0),
  isFeatured: boolean('is_featured').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Project collaborators
export const projectCollaborators = pgTable('project_collaborators', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  role: varchar('role', { length: 50 }).default('contributor'),
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Sessions for auth
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  projectId: uuid('project_id').references(() => projects.id),
  commentId: uuid('comment_id').references(() => comments.id),
  voteType: varchar('vote_type', { length: 10 }).notNull(), // 'upvote' or 'downvote'
  createdAt: timestamp('created_at').defaultNow(),
});

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  parentId: uuid('parent_id').references(() => comments.id), // for replies
  content: text('content').notNull(),
  upvotes: integer('upvotes').default(0),
  isEdited: boolean('is_edited').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 10 }).notNull(), // emoji icon
  category: varchar('category', { length: 50 }).notNull(), // 'projects', 'collaboration', 'events', 'daily', 'special'
  rarity: varchar('rarity', { length: 20 }).default('common'), // 'common', 'rare', 'epic', 'legendary'
  pointsRequired: integer('points_required').notNull(),
  criteria: jsonb('criteria').$type<Record<string, any>>(), // criteria for earning badge
  createdAt: timestamp('created_at').defaultNow(),
});

export const userBadges = pgTable('user_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  badgeId: uuid('badge_id').notNull().references(() => badges.id),
  earnedAt: timestamp('earned_at').defaultNow(),
});

export const pointsHistory = pgTable('points_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  projectId: uuid('project_id').references(() => projects.id),
  points: integer('points').notNull(),
  reason: varchar('reason', { length: 100 }).notNull(), // 'project_live', 'visitor', 'vote', 'github_star'
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  votes: many(votes),
  comments: many(comments),
  badges: many(userBadges),
  pointsHistory: many(pointsHistory),
  sessions: many(sessions),
  collaborations: many(projectCollaborators),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  votes: many(votes),
  comments: many(comments),
  pointsHistory: many(pointsHistory),
  collaborators: many(projectCollaborators),
}));

export const projectCollaboratorsRelations = relations(projectCollaborators, ({ one }) => ({
  project: one(projects, {
    fields: [projectCollaborators.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectCollaborators.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [votes.projectId],
    references: [projects.id],
  }),
  comment: one(comments, {
    fields: [votes.commentId],
    references: [comments.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [comments.projectId],
    references: [projects.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
  votes: many(votes),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  users: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const pointsHistoryRelations = relations(pointsHistory, ({ one }) => ({
  user: one(users, {
    fields: [pointsHistory.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [pointsHistory.projectId],
    references: [projects.id],
  }),
}));
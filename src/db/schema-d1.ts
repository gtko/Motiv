import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Helper to generate IDs
export const generateId = () => createId();

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  email: text('email').unique().notNull(),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  name: text('name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  coverUrl: text('cover_url'),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  points: integer('points').default(0),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Projects table
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  category: text('category'),
  difficulty: text('difficulty'),
  techStack: text('tech_stack'), // JSON array stored as text
  demoUrl: text('demo_url'),
  githubUrl: text('github_url'),
  imageUrl: text('image_url'),
  status: text('status').default('active'),
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Badges table
export const badges = sqliteTable('badges', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  name: text('name').unique().notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
  category: text('category'),
  pointsRequired: integer('points_required').default(0),
  criteria: text('criteria'), // JSON stored as text
  createdAt: text('created_at').default(new Date().toISOString()),
});

// User badges table
export const userBadges = sqliteTable('user_badges', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeId: text('badge_id').notNull().references(() => badges.id, { onDelete: 'cascade' }),
  earnedAt: text('earned_at').default(new Date().toISOString()),
});

// Comments table
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Votes table
export const votes = sqliteTable('votes', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  voteType: text('vote_type').notNull(), // 'up' or 'down'
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Project collaborators table
export const projectCollaborators = sqliteTable('project_collaborators', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').default('member'),
  joinedAt: text('joined_at').default(new Date().toISOString()),
});

// Points history table
export const pointsHistory = sqliteTable('points_history', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  points: integer('points').notNull(),
  reason: text('reason'),
  referenceId: text('reference_id'),
  referenceType: text('reference_type'),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  comments: many(comments),
  votes: many(votes),
  badges: many(userBadges),
  collaborations: many(projectCollaborators),
  pointsHistory: many(pointsHistory),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  comments: many(comments),
  votes: many(votes),
  collaborators: many(projectCollaborators),
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

export const commentsRelations = relations(comments, ({ one }) => ({
  project: one(projects, {
    fields: [comments.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  project: one(projects, {
    fields: [votes.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
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

export const pointsHistoryRelations = relations(pointsHistory, ({ one }) => ({
  user: one(users, {
    fields: [pointsHistory.userId],
    references: [users.id],
  }),
}));
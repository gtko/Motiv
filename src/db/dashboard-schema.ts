import { pgTable, uuid, varchar, text, integer, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, projects } from './schema';

// Tasks management
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('todo'), // 'todo', 'in_progress', 'done', 'archived'
  priority: varchar('priority', { length: 20 }).default('medium'), // 'low', 'medium', 'high', 'urgent'
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  position: integer('position').default(0), // For ordering in kanban
  labels: jsonb('labels').$type<string[]>().default([]),
  assignedTo: uuid('assigned_to').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectIdx: index('task_project_idx').on(table.projectId),
    statusIdx: index('task_status_idx').on(table.status),
  };
});

// Roadmap items
export const roadmapItems = pgTable('roadmap_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: varchar('status', { length: 50 }).default('planned'), // 'planned', 'in_progress', 'completed', 'delayed'
  progress: integer('progress').default(0), // 0-100
  color: varchar('color', { length: 7 }).default('#22c55e'), // Hex color
  order: integer('order').default(0),
  milestones: jsonb('milestones').$type<Array<{title: string, date: Date, completed: boolean}>>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Forum categories
export const forumCategories = pgTable('forum_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // Lucide icon name
  color: varchar('color', { length: 7 }).default('#22c55e'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Forum discussions
export const forumDiscussions = pgTable('forum_discussions', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => forumCategories.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  isPinned: boolean('is_pinned').default(false),
  isLocked: boolean('is_locked').default(false),
  viewCount: integer('view_count').default(0),
  replyCount: integer('reply_count').default(0),
  lastReplyAt: timestamp('last_reply_at'),
  lastReplyUserId: uuid('last_reply_user_id').references(() => users.id),
  tags: jsonb('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    categoryIdx: index('discussion_category_idx').on(table.categoryId),
    userIdx: index('discussion_user_idx').on(table.userId),
    pinnedIdx: index('discussion_pinned_idx').on(table.isPinned),
  };
});

// Forum replies
export const forumReplies = pgTable('forum_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  discussionId: uuid('discussion_id').notNull().references(() => forumDiscussions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  isAccepted: boolean('is_accepted').default(false), // For marking best answer
  upvotes: integer('upvotes').default(0),
  isEdited: boolean('is_edited').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    discussionIdx: index('reply_discussion_idx').on(table.discussionId),
  };
});

// Pomodoro sessions
export const pomodoroSessions = pgTable('pomodoro_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  projectId: uuid('project_id').references(() => projects.id),
  taskId: uuid('task_id').references(() => tasks.id),
  duration: integer('duration').notNull(), // in seconds
  type: varchar('type', { length: 20 }).notNull(), // 'focus', 'short_break', 'long_break'
  completedAt: timestamp('completed_at').defaultNow(),
  notes: text('notes'),
}, (table) => {
  return {
    userIdx: index('pomodoro_user_idx').on(table.userId),
    projectIdx: index('pomodoro_project_idx').on(table.projectId),
  };
});

// User levels and experience
export const userLevels = pgTable('user_levels', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  level: integer('level').default(1),
  experience: integer('experience').default(0),
  nextLevelExp: integer('next_level_exp').default(100),
  streakDays: integer('streak_days').default(0),
  lastActivityDate: timestamp('last_activity_date').defaultNow(),
  totalFocusTime: integer('total_focus_time').default(0), // in seconds
  achievements: jsonb('achievements').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
}));

export const roadmapItemsRelations = relations(roadmapItems, ({ one }) => ({
  project: one(projects, {
    fields: [roadmapItems.projectId],
    references: [projects.id],
  }),
}));

export const forumCategoriesRelations = relations(forumCategories, ({ many }) => ({
  discussions: many(forumDiscussions),
}));

export const forumDiscussionsRelations = relations(forumDiscussions, ({ one, many }) => ({
  category: one(forumCategories, {
    fields: [forumDiscussions.categoryId],
    references: [forumCategories.id],
  }),
  user: one(users, {
    fields: [forumDiscussions.userId],
    references: [users.id],
  }),
  lastReplyUser: one(users, {
    fields: [forumDiscussions.lastReplyUserId],
    references: [users.id],
  }),
  replies: many(forumReplies),
}));

export const forumRepliesRelations = relations(forumReplies, ({ one }) => ({
  discussion: one(forumDiscussions, {
    fields: [forumReplies.discussionId],
    references: [forumDiscussions.id],
  }),
  user: one(users, {
    fields: [forumReplies.userId],
    references: [users.id],
  }),
}));

export const pomodoroSessionsRelations = relations(pomodoroSessions, ({ one }) => ({
  user: one(users, {
    fields: [pomodoroSessions.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [pomodoroSessions.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [pomodoroSessions.taskId],
    references: [tasks.id],
  }),
}));

export const userLevelsRelations = relations(userLevels, ({ one }) => ({
  user: one(users, {
    fields: [userLevels.userId],
    references: [users.id],
  }),
}));
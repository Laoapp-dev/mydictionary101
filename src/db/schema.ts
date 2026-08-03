import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  word: text('word').notNull(),
  masteryScore: integer('mastery_score').default(20),
  masteryLevel: text('mastery_level').default('Learning'),
  reviewCount: integer('review_count').default(1),
  correctCount: integer('correct_count').default(0),
  incorrectCount: integer('incorrect_count').default(0),
  lastReviewed: timestamp('last_reviewed').defaultNow(),
  nextReviewDate: timestamp('next_review_date').defaultNow(),
  tags: jsonb('tags').$type<string[]>().default([]),
  isBookmarked: boolean('is_bookmarked').default(true),
  addedAt: timestamp('added_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userStats = pgTable('user_stats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  totalSearched: integer('total_searched').default(0),
  totalSaved: integer('total_saved').default(0),
  masteredCount: integer('mastered_count').default(0),
  learningCount: integer('learning_count').default(0),
  reviewingCount: integer('reviewing_count').default(0),
  streakDays: integer('streak_days').default(1),
  lastActiveDate: timestamp('last_active_date').defaultNow(),
  practiceAccuracy: integer('practice_accuracy').default(100),
  totalExercisesCompleted: integer('total_exercises_completed').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  progressItems: many(userProgress),
  stats: one(userStats, {
    fields: [users.id],
    references: [userStats.userId],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

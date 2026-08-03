import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string) {
  if (!db) return null;
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (err) {
    console.error('Error in getOrCreateUser:', err);
    throw new Error('Database operation failed', { cause: err });
  }
}

import { db } from "@workspace/db";
import { usersTable, userVisitsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

type User = typeof usersTable.$inferSelect;

export const storage = {
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  },

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.googleId, googleId));
    return user;
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    return user;
  },

  async createUserWithGoogle({
    username,
    googleId,
    email,
    displayName,
  }: {
    username: string;
    googleId: string;
    email: string | null;
    displayName: string | null;
  }): Promise<User> {
    const [user] = await db
      .insert(usersTable)
      .values({ username, googleId, email, displayName })
      .returning();
    return user;
  },

  async updateUserGoogle(
    id: number,
    { googleId, displayName }: { googleId?: string; displayName?: string | null }
  ): Promise<User> {
    const [user] = await db
      .update(usersTable)
      .set({ ...(googleId ? { googleId } : {}), displayName })
      .where(eq(usersTable.id, id))
      .returning();
    return user;
  },

  async recordVisit(userId: number, email: string | null): Promise<void> {
    await db.insert(userVisitsTable).values({ userId, email });
  },

  async getVisits(
    limit: number
  ): Promise<Array<{ id: number; email: string | null; visitedAt: Date }>> {
    const rows = await db
      .select()
      .from(userVisitsTable)
      .orderBy(desc(userVisitsTable.visitedAt))
      .limit(limit);
    return rows.map((v) => ({
      id: v.id,
      email: v.email,
      visitedAt: v.visitedAt as Date,
    }));
  },

  async getVisitTimestampsSince(_since: Date | null): Promise<string[]> {
    const rows = await db
      .select({ visitedAt: userVisitsTable.visitedAt })
      .from(userVisitsTable);
    return rows.map((v) => (v.visitedAt as Date).toISOString());
  },
};

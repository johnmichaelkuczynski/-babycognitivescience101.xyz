import { db } from "@workspace/db";
import { usersTable, userVisitsTable, uniqueVisitorsTable } from "@workspace/db";
import { eq, desc, sql, gte, count } from "drizzle-orm";

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

  // Upsert an anonymous unique visitor keyed by browser cookie.
  async recordUniqueVisit(visitorId: string): Promise<void> {
    await db
      .insert(uniqueVisitorsTable)
      .values({ visitorId })
      .onConflictDoUpdate({
        target: uniqueVisitorsTable.visitorId,
        set: {
          visitCount: sql`${uniqueVisitorsTable.visitCount} + 1`,
          lastSeenAt: sql`now()`,
        },
      });
  },

  async getAnonAiTokens(visitorId: string): Promise<number> {
    const [row] = await db
      .select({ used: uniqueVisitorsTable.aiTokensUsed })
      .from(uniqueVisitorsTable)
      .where(eq(uniqueVisitorsTable.visitorId, visitorId));
    return row?.used ?? 0;
  },

  async addAnonAiTokens(visitorId: string, tokens: number): Promise<void> {
    await db
      .insert(uniqueVisitorsTable)
      .values({ visitorId, aiTokensUsed: tokens })
      .onConflictDoUpdate({
        target: uniqueVisitorsTable.visitorId,
        set: {
          aiTokensUsed: sql`${uniqueVisitorsTable.aiTokensUsed} + ${tokens}`,
          lastSeenAt: sql`now()`,
        },
      });
  },

  async getUniqueVisitorStats(): Promise<{
    allTime: number;
    last24Hours: number;
    lastMonth: number;
    lastYear: number;
    totalPageLoads: number;
  }> {
    const now = Date.now();
    const cutoff = (ms: number) => new Date(now - ms);
    const DAY = 24 * 60 * 60 * 1000;

    const [[all], [day], [month], [year], [loads]] = await Promise.all([
      db.select({ n: count() }).from(uniqueVisitorsTable),
      db
        .select({ n: count() })
        .from(uniqueVisitorsTable)
        .where(gte(uniqueVisitorsTable.lastSeenAt, cutoff(DAY))),
      db
        .select({ n: count() })
        .from(uniqueVisitorsTable)
        .where(gte(uniqueVisitorsTable.lastSeenAt, cutoff(30 * DAY))),
      db
        .select({ n: count() })
        .from(uniqueVisitorsTable)
        .where(gte(uniqueVisitorsTable.lastSeenAt, cutoff(365 * DAY))),
      db
        .select({ n: sql<number>`coalesce(sum(${uniqueVisitorsTable.visitCount}), 0)::int` })
        .from(uniqueVisitorsTable),
    ]);

    return {
      allTime: all.n,
      last24Hours: day.n,
      lastMonth: month.n,
      lastYear: year.n,
      totalPageLoads: loads.n,
    };
  },
};

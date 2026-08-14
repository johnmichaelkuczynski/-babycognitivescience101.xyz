import React from "react";
import { useGetCourseOverview, useGetRecentActivity } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ReasoningCallout } from "@/components/ReasoningCallout";

export default function Dashboard() {
  const { data: overview, isLoading: isLoadingOverview } = useGetCourseOverview();
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity();

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto w-full flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            {overview ? overview.title : <Skeleton className="h-9 w-64" />}
          </h1>
          <p className="text-muted-foreground">Welcome to your Cognitive Science 101 course workspace.</p>
        </div>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4 flex-wrap">
            <CardTitle className="text-xl font-serif">Topics Covered in This Course</CardTitle>
            <div className="flex items-center gap-2">
              <a
                href={`${import.meta.env.BASE_URL}api/course/download.pdf`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                data-testid="link-download-course-pdf"
                title="Download the full course as a PDF: short lectures, practice homework, and a practice exam"
              >
                Download the Course (PDF)
              </a>
              <a
                href={`${import.meta.env.BASE_URL}api/course/download.txt`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-secondary transition-colors"
                data-testid="link-download-course-txt"
                title="Download the full course as plain text"
              >
                TXT
              </a>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingOverview ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 list-none">
                {(overview?.weeks.flatMap(w => w.lectures) ?? []).map((lec, i) => (
                  <li key={lec.id} className="flex gap-2 text-sm">
                    <span className="font-serif font-bold text-primary w-5 shrink-0 text-right">{i + 1}.</span>
                    <span>{lec.title}</span>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              The PDF includes the short version of every lecture, practice homework for each section, and a practice exam with an answer guide.
            </p>
          </CardContent>
        </Card>

        <ReasoningCallout phase="before" />
        <ReasoningCallout phase="after" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOverview ? <Skeleton className="h-10 w-24" /> : (
                <>
                  <div className="text-3xl font-serif font-bold mb-2">
                    {overview?.totals.assignmentsCompleted} / {overview?.totals.assignmentsTotal}
                  </div>
                  <Progress value={(overview?.totals.assignmentsCompleted || 0) / Math.max(overview?.totals.assignmentsTotal || 1, 1) * 100} className="h-2" />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Practice Problems</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOverview ? <Skeleton className="h-10 w-24" /> : (
                <div className="text-3xl font-serif font-bold">{overview?.totals.practiceCount}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-4">
            <h2 className="text-xl font-serif font-semibold">Course Schedule</h2>
            {isLoadingOverview ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
            ) : (
              overview?.weeks.map(week => (
                <Link key={week.weekNumber} href={`/weeks/${week.weekNumber}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer cursor-pointer hover:shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Unit {week.weekNumber}: {week.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{week.summary}</p>
                      <div className="flex gap-4 text-sm font-medium">
                        <span className="text-primary">{week.lectures.length} Lectures</span>
                        <span className="text-primary">{week.assignments.length} Assignments</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-serif font-semibold">Recent Activity</h2>
            <Card>
              <CardContent className="p-0 divide-y">
                {isLoadingActivity ? (
                  Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-12 w-full" /></div>)
                ) : activity?.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">No recent activity.</div>
                ) : (
                  activity?.slice(0, 5).map(item => (
                    <div key={item.id} className="p-4 flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{item.title}</span>
                        {item.score !== undefined && item.score !== null && (
                          <span className="text-xs font-bold px-2 py-0.5 bg-secondary rounded-full">{item.score}%</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.kind === 'practice' ? 'Practice' : 'Assignment'} • {new Date(item.at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

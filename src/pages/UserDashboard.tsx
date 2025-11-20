import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Upload, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Reel, Course } from "@/types";

export default function UserDashboard() {
  // TODO: Replace with actual API calls
  const { data: recentReels, isLoading: reelsLoading } = useQuery({
    queryKey: ["recent-reels"],
    queryFn: () => api.get<Reel[]>("/reels/recent"),
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.get<Course[]>("/courses"),
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with your training.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload Reel</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Share your knowledge with a quick training reel
            </p>
            <Button asChild size="sm" className="w-full">
              <Link to="/dashboard/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Now
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Browse Library</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Discover training reels in your library
            </p>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link to="/dashboard/library">
                <Play className="mr-2 h-4 w-4" />
                Browse
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Continue your learning journey
            </p>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link to="/dashboard/courses">
                <BookOpen className="mr-2 h-4 w-4" />
                View Courses
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Reels */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reels</CardTitle>
            <CardDescription>Recently viewed training reels</CardDescription>
          </CardHeader>
          <CardContent>
            {reelsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-20 w-32" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentReels && recentReels.length > 0 ? (
              <div className="space-y-4">
                {recentReels.slice(0, 5).map((reel) => (
                  <Link
                    key={reel.id}
                    to={`/dashboard/reel/${reel.id}`}
                    className="flex gap-4 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div className="h-20 w-32 rounded bg-muted flex items-center justify-center">
                      {reel.thumbnail_url ? (
                        <img
                          src={reel.thumbnail_url}
                          alt={reel.title}
                          className="h-full w-full object-cover rounded"
                        />
                      ) : (
                        <Play className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{reel.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {reel.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.floor(reel.duration / 60)}:{(reel.duration % 60).toString().padStart(2, "0")}
                        </Badge>
                        {reel.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No recent reels</p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/dashboard/library">Browse Library</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
            <CardDescription>Your active courses</CardDescription>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses.slice(0, 5).map((course) => (
                  <Link
                    key={course.id}
                    to={`/dashboard/courses/${course.id}`}
                    className="block rounded-lg p-4 border transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{course.title}</h4>
                      <Badge variant={course.status === "published" ? "success" : "outline"}>
                        {course.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      <span>{course.modules.length} modules</span>
                      <span>•</span>
                      <span>{course.estimated_time} min</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No active courses</p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/dashboard/courses">Browse Courses</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

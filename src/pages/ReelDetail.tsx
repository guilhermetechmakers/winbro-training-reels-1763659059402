import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Download, Share2, Heart, BookOpen, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Reel } from "@/types";

export default function ReelDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: reel, isLoading } = useQuery({
    queryKey: ["reel", id],
    queryFn: () => api.get<Reel>(`/reels/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-[500px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!reel) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Reel not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dashboard/library">Back to Library</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Video Player */}
      <Card>
        <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
          {reel.thumbnail_url ? (
            <img
              src={reel.thumbnail_url}
              alt={reel.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Play className="h-16 w-16 text-white" />
            </div>
          )}
          {/* Video player controls would go here */}
        </div>
      </Card>

      {/* Metadata */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{reel.title}</h1>
              <Badge variant={reel.status === "published" ? "success" : "archived"}>
                {reel.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground">{reel.description}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Add to Course
            </Button>
            <Button variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Favorite
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {reel.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reel.machine_model && (
              <div>
                <p className="text-sm text-muted-foreground">Machine Model</p>
                <p className="font-medium">{reel.machine_model}</p>
              </div>
            )}
            {reel.tooling && (
              <div>
                <p className="text-sm text-muted-foreground">Tooling</p>
                <p className="font-medium">{reel.tooling}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {Math.floor(reel.duration / 60)}:{(reel.duration % 60).toString().padStart(2, "0")}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Skill Level</p>
              <Badge variant="outline">{reel.skill_level}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Language</p>
              <p className="font-medium">{reel.language}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transcript Section */}
      {reel.transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>Time-synced transcript with click-to-seek</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reel.transcript.segments.map((segment) => (
                <div
                  key={segment.id}
                  className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                >
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(segment.start_time / 60)}:{(segment.start_time % 60).toString().padStart(2, "0")}
                  </span>
                  <p className="mt-1">{segment.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

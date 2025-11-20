import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History,
  RotateCcw,
  Save,
  ArrowLeft,
  Settings,
  FileVideo,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { TranscriptEditor } from "@/components/TranscriptEditor";
import { VersionHistoryModal } from "@/components/VersionHistoryModal";
import { PermissionDialog } from "@/components/PermissionDialog";
import {
  useReel,
  useUpdateReel,
  useReelVersions,
  useRollbackVersion,
  useReprocessReel,
  useReprocessStatus,
  useUpdateTranscript,
  useReelPermissions,
  useUpdateReelPermissions,
} from "@/hooks/useReel";
import type { Transcript, ReelPermission } from "@/types";

const metadataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  machine_model: z.string().optional(),
  tooling: z.string().optional(),
  process_step: z.string().optional(),
  tags: z.string().optional(),
  skill_level: z.enum(["beginner", "intermediate", "advanced"]),
  language: z.string().min(1, "Language is required"),
  status: z.enum(["draft", "pending", "published", "archived"]),
});

type MetadataFormData = z.infer<typeof metadataSchema>;

export default function EditReel() {
  const { id } = useParams<{ id: string }>();
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const { data: reel, isLoading: reelLoading } = useReel(id);
  const { data: versions } = useReelVersions(id);
  const { data: reprocessStatus } = useReprocessStatus(id);
  const { data: permissions } = useReelPermissions(id);

  const updateReel = useUpdateReel();
  const rollbackVersion = useRollbackVersion();
  const reprocessReel = useReprocessReel();
  const updateTranscript = useUpdateTranscript();
  const updatePermissions = useUpdateReelPermissions();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<MetadataFormData>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      title: "",
      description: "",
      machine_model: "",
      tooling: "",
      process_step: "",
      tags: "",
      skill_level: "beginner",
      language: "en",
      status: "draft",
    },
  });

  // Reset form when reel data loads
  useEffect(() => {
    if (reel) {
      reset({
        title: reel.title,
        description: reel.description,
        machine_model: reel.machine_model || "",
        tooling: reel.tooling || "",
        process_step: reel.process_step || "",
        tags: reel.tags.join(", "),
        skill_level: reel.skill_level,
        language: reel.language,
        status: reel.status,
      });
    }
  }, [reel, reset]);

  const onSubmit = async (data: MetadataFormData) => {
    if (!id) return;

    const tagsArray = data.tags
      ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

    updateReel.mutate({
      id,
      data: {
        ...data,
        tags: tagsArray,
      },
    });
  };

  const handleRollback = (versionId: string) => {
    if (!id) return;
    rollbackVersion.mutate(
      { reelId: id, versionId },
      {
        onSuccess: () => {
          setVersionModalOpen(false);
        },
      }
    );
  };

  const handleReprocess = () => {
    if (!id) return;
    reprocessReel.mutate(id);
  };

  const handleTranscriptSave = (transcript: Transcript) => {
    if (!id) return;
    updateTranscript.mutate({
      reelId: id,
      transcript: {
        segments: transcript.segments,
      },
    });
  };

  const handlePermissionSave = (permissionData: Partial<ReelPermission>) => {
    if (!id) return;
    updatePermissions.mutate(
      {
        reelId: id,
        permissions: permissionData,
      },
      {
        onSuccess: () => {
          setPermissionDialogOpen(false);
        },
      }
    );
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    // In a real implementation, this would seek the video player
  };

  if (reelLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!reel) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Reel not found</p>
        <Button asChild variant="outline">
          <Link to="/dashboard/library">Back to Library</Link>
        </Button>
      </div>
    );
  }

  const currentVersion = versions?.[0]?.version_number || 1;
  const reprocessInProgress =
    reprocessStatus?.status === "processing" || reprocessStatus?.status === "pending";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/reel/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Reel</h1>
            <p className="text-muted-foreground mt-1">
              Manage metadata, transcript, and permissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={reel.status === "published" ? "success" : "archived"}>
            {reel.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => setVersionModalOpen(true)}
        >
          <History className="h-4 w-4 mr-2" />
          Version History
        </Button>
        <Button
          variant="outline"
          onClick={handleReprocess}
          disabled={reprocessInProgress || reprocessReel.isPending}
        >
          {reprocessInProgress ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Reprocessing...
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reprocess Video
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => setPermissionDialogOpen(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Permissions
        </Button>
      </div>

      {/* Reprocess Status */}
      {reprocessStatus && reprocessInProgress && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <div className="flex-1">
                <p className="font-medium">Video reprocessing in progress</p>
                <p className="text-sm text-muted-foreground">
                  {reprocessStatus.progress !== undefined
                    ? `${reprocessStatus.progress}% complete`
                    : "Processing..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reprocessStatus?.status === "completed" && (
        <Card className="border-[#22C55E]/50 bg-[#22C55E]/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
              <p className="font-medium">Reprocessing completed successfully</p>
            </div>
          </CardContent>
        </Card>
      )}

      {reprocessStatus?.status === "failed" && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Reprocessing failed</p>
                <p className="text-sm text-muted-foreground">
                  {reprocessStatus.error_message || "An error occurred during processing"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="metadata" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metadata">
            <FileVideo className="h-4 w-4 mr-2" />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="transcript" disabled={!reel.transcript}>
            <FileText className="h-4 w-4 mr-2" />
            Transcript
          </TabsTrigger>
        </TabsList>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reel Metadata</CardTitle>
              <CardDescription>
                Edit the title, description, and other metadata for this reel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter reel title"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter reel description"
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="machine_model">Machine Model</Label>
                    <Input
                      id="machine_model"
                      {...register("machine_model")}
                      placeholder="e.g., CNC-5000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tooling">Tooling</Label>
                    <Input
                      id="tooling"
                      {...register("tooling")}
                      placeholder="e.g., Carbide End Mill"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="process_step">Process Step</Label>
                  <Input
                    id="process_step"
                    {...register("process_step")}
                    placeholder="e.g., Setup, Maintenance, Troubleshooting"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    {...register("tags")}
                    placeholder="Comma-separated tags (e.g., setup, maintenance, safety)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple tags with commas
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="skill_level">Skill Level</Label>
                    <select
                      id="skill_level"
                      {...register("skill_level")}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">
                      Language <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="language"
                      {...register("language")}
                      placeholder="e.g., en, es, fr"
                    />
                    {errors.language && (
                      <p className="text-sm text-destructive">{errors.language.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    {...register("status")}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    disabled={!isDirty}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isDirty || updateReel.isPending}
                  >
                    {updateReel.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transcript Tab */}
        <TabsContent value="transcript" className="space-y-6">
          {reel.transcript ? (
            <TranscriptEditor
              transcript={reel.transcript}
              currentTime={currentTime}
              onSeek={handleSeek}
              onSave={handleTranscriptSave}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transcript available</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <VersionHistoryModal
        open={versionModalOpen}
        onOpenChange={setVersionModalOpen}
        versions={versions || []}
        currentVersion={currentVersion}
        onRollback={handleRollback}
        isLoading={rollbackVersion.isPending}
      />

      <PermissionDialog
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        permission={permissions?.[0] || null}
        onSave={handlePermissionSave}
        isLoading={updatePermissions.isPending}
      />
    </div>
  );
}

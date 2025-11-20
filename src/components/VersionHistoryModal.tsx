import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, ChevronRight } from "lucide-react";
import type { ReelVersion } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface VersionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: ReelVersion[];
  currentVersion: number;
  onRollback: (versionId: string) => void;
  isLoading?: boolean;
}

export function VersionHistoryModal({
  open,
  onOpenChange,
  versions,
  currentVersion,
  onRollback,
  isLoading = false,
}: VersionHistoryModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  const toggleExpand = (versionId: string) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(versionId)) {
        next.delete(versionId);
      } else {
        next.add(versionId);
      }
      return next;
    });
  };

  const handleRollback = () => {
    if (selectedVersion) {
      onRollback(selectedVersion);
      setSelectedVersion(null);
    }
  };

  const formatChange = (key: string, change: { from: unknown; to: unknown }) => {
    const formatValue = (val: unknown) => {
      if (val === null || val === undefined) return "—";
      if (Array.isArray(val)) return val.join(", ");
      if (typeof val === "object") return JSON.stringify(val);
      return String(val);
    };

    return {
      field: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      from: formatValue(change.from),
      to: formatValue(change.to),
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View and restore previous versions of this reel
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-4">
            {versions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No version history available
              </p>
            ) : (
              versions.map((version) => {
                const isCurrent = version.version_number === currentVersion;
                const isExpanded = expandedVersions.has(version.id);
                const changes = Object.entries(version.changes || {});

                return (
                  <div
                    key={version.id}
                    className={cn(
                      "border rounded-lg p-4 transition-all",
                      isCurrent
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      selectedVersion === version.id && "ring-2 ring-primary"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">
                            Version {version.version_number}
                          </h4>
                          {isCurrent && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {changes.length} change{changes.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {!isCurrent && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedVersion(version.id)}
                          disabled={isLoading}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Rollback
                        </Button>
                      )}
                    </div>

                    {changes.length > 0 && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => toggleExpand(version.id)}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                          {isExpanded ? "Hide" : "Show"} changes
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-2 pl-6">
                            {changes.map(([key, change]) => {
                              const formatted = formatChange(key, change);
                              return (
                                <div
                                  key={key}
                                  className="text-sm border-l-2 border-muted pl-3 py-1"
                                >
                                  <p className="font-medium">{formatted.field}</p>
                                  <div className="mt-1 space-y-1">
                                    <p className="text-muted-foreground">
                                      <span className="text-destructive line-through">
                                        {formatted.from}
                                      </span>
                                    </p>
                                    <p className="text-primary">
                                      → {formatted.to}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {selectedVersion && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVersion(null)}>
              Cancel
            </Button>
            <Button onClick={handleRollback} disabled={isLoading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Confirm Rollback
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

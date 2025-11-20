import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Save, Undo2 } from "lucide-react";
import type { Transcript, TranscriptSegment } from "@/types";
import { cn } from "@/lib/utils";

interface TranscriptEditorProps {
  transcript: Transcript;
  currentTime?: number;
  onSeek?: (time: number) => void;
  onSave?: (transcript: Transcript) => void;
}

export function TranscriptEditor({
  transcript,
  currentTime = 0,
  onSeek,
  onSave,
}: TranscriptEditorProps) {
  const [editedSegments, setEditedSegments] = useState<TranscriptSegment[]>(transcript.segments);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setEditedSegments(transcript.segments);
    setHasChanges(false);
  }, [transcript]);

  // Auto-scroll to active segment
  useEffect(() => {
    const activeSegment = editedSegments.find(
      (seg) => currentTime >= seg.start_time && currentTime <= seg.end_time
    );
    if (activeSegment && segmentRefs.current[activeSegment.id]) {
      segmentRefs.current[activeSegment.id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentTime, editedSegments]);

  const handleSegmentClick = (segment: TranscriptSegment) => {
    if (onSeek) {
      onSeek(segment.start_time);
    }
  };

  const handleEditStart = (segment: TranscriptSegment) => {
    setEditingSegmentId(segment.id);
    setEditedText(segment.text);
  };

  const handleEditSave = (segmentId: string) => {
    setEditedSegments((prev) =>
      prev.map((seg) =>
        seg.id === segmentId ? { ...seg, text: editedText } : seg
      )
    );
    setEditingSegmentId(null);
    setHasChanges(true);
  };

  const handleEditCancel = () => {
    setEditingSegmentId(null);
    setEditedText("");
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...transcript,
        segments: editedSegments,
        version: transcript.version + 1,
      });
      setHasChanges(false);
    }
  };

  const handleUndo = () => {
    setEditedSegments(transcript.segments);
    setHasChanges(false);
    setEditingSegmentId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isSegmentActive = (segment: TranscriptSegment) => {
    return currentTime >= segment.start_time && currentTime <= segment.end_time;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transcript Editor</CardTitle>
            <CardDescription>
              Click timestamps to seek, click text to edit
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" size="sm" onClick={handleUndo}>
                <Undo2 className="h-4 w-4 mr-2" />
                Undo
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {editedSegments.map((segment) => {
            const isActive = isSegmentActive(segment);
            const isEditing = editingSegmentId === segment.id;

            return (
              <div
                key={segment.id}
                ref={(el) => (segmentRefs.current[segment.id] = el)}
                className={cn(
                  "p-3 rounded-lg border transition-all cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-muted border-border",
                  isEditing && "ring-2 ring-ring"
                )}
                onClick={() => !isEditing && handleSegmentClick(segment)}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={cn(
                      "text-xs font-mono mt-0.5 min-w-[60px] text-left",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSegmentClick(segment);
                    }}
                  >
                    {formatTime(segment.start_time)}
                  </button>
                  {isEditing ? (
                    <div className="flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <Textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="min-h-[60px]"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditSave(segment.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex-1"
                      onDoubleClick={() => handleEditStart(segment)}
                    >
                      <p className="text-sm leading-relaxed">{segment.text}</p>
                      {segment.confidence !== undefined && (
                        <Badge
                          variant="outline"
                          className="mt-2 text-xs"
                        >
                          Confidence: {Math.round(segment.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {transcript.confidence !== undefined && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Overall confidence: {Math.round(transcript.confidence * 100)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

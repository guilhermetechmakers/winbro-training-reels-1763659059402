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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ReelPermission } from "@/types";

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: ReelPermission | null;
  onSave: (permission: Partial<ReelPermission>) => void;
  isLoading?: boolean;
}

export function PermissionDialog({
  open,
  onOpenChange,
  permission,
  onSave,
  isLoading = false,
}: PermissionDialogProps) {
  const [accessLevel, setAccessLevel] = useState<ReelPermission["access_level"]>(
    permission?.access_level || "view"
  );
  const [visibility, setVisibility] = useState<ReelPermission["visibility"]>(
    permission?.visibility || "tenant"
  );

  const handleSave = () => {
    onSave({
      access_level: accessLevel,
      visibility: visibility,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>
            Control who can view and edit this reel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="access-level">Access Level</Label>
            <Select
              value={accessLevel}
              onValueChange={(value) => setAccessLevel(value as ReelPermission["access_level"])}
            >
              <SelectTrigger id="access-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">
                  <div className="flex flex-col">
                    <span>View</span>
                    <span className="text-xs text-muted-foreground">
                      Can watch and view metadata
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="edit">
                  <div className="flex flex-col">
                    <span>Edit</span>
                    <span className="text-xs text-muted-foreground">
                      Can modify metadata and transcript
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col">
                    <span>Admin</span>
                    <span className="text-xs text-muted-foreground">
                      Full control including permissions
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value as ReelPermission["visibility"])}
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant">
                  <div className="flex flex-col">
                    <span>Tenant</span>
                    <span className="text-xs text-muted-foreground">
                      Only visible to your organization
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex flex-col">
                    <span>Public</span>
                    <span className="text-xs text-muted-foreground">
                      Visible to all users
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="internal">
                  <div className="flex flex-col">
                    <span>Internal</span>
                    <span className="text-xs text-muted-foreground">
                      Winbro internal use only
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
            <p className="text-sm font-medium">Current Settings</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{accessLevel}</Badge>
              <Badge variant="outline">{visibility}</Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

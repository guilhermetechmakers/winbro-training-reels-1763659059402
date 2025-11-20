import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function UploadReel() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Upload Reel</h1>
        <p className="text-muted-foreground mt-2">
          Upload a new training reel with metadata
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload Video</CardTitle>
          <CardDescription>Drag and drop or click to select a video file</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Drag and drop your video here, or click to browse
            </p>
            <Button>Select File</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

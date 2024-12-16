import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UploadButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="hover:bg-white hover:text-black">
          Upload Slide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>Upload your slides</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <form action="">
            <Label htmlFor="file" className="text-right font-medium">
              Slide PDF
            </Label>
            <Input id="file" className="col-span-3" accept="application/pdf" />
            <Button type="submit">Save changes</Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

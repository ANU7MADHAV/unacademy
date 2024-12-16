"use client";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import useSlidesShowStore from "../store/useSliderStore";
import useTokenStore from "../store/useTokenStore";
import axios from "axios";
import { useForm } from "react-hook-form";

export function UploadButton() {
  const { register, handleSubmit } = useForm();
  const { token } = useTokenStore();
  const { setShowSlides } = useSlidesShowStore();

  const submitForm = async (data: any) => {
    const formData = new FormData();
    formData.append("file", data.file[0]);
    formData.append("metadata", data.metadata);
    const res = await axios.post(
      "http://localhost:8080/v1/file-upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const resData = await res.data;
    if (resData) {
      setShowSlides(true);
    }
    console.log("data", resData);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-red-500 text-white hover:bg-white hover:text-black"
        >
          Upload Slide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>Upload your slides</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <form onSubmit={handleSubmit(submitForm)} className="space-y-2">
            <Label htmlFor="file" className="text-right font-medium">
              Slide PDF
            </Label>
            <Input
              id="file"
              type="file"
              className="col-span-3"
              accept="application/pdf"
              {...register("file")}
            />
            <Label htmlFor="metadata" className="text-right font-medium">
              Metadata for the File
            </Label>
            <Input
              id="metadata"
              placeholder="metadata"
              type="text"
              className="col-span-3"
              {...register("metadata")}
            />
            <div className="flex justify-end">
              <Button type="submit">Upload file</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import DrawboarderButton from "@/components/Drawboarder";
import FileUpload from "@/components/FileUpload";
import Home from "@/components/Home";

export default function Page() {
  return (
    <div>
      <section>
        <Home />
      </section>
      <section className="absolute bottom-4 left-32">
        <FileUpload />
      </section>
      <section>
        <DrawboarderButton />
      </section>
    </div>
  );
}

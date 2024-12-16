import { Excalidraw } from "@excalidraw/excalidraw";

const WhiteBoard = () => {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>Excalidraw Example</h1>
      <div style={{ height: "500px" }}>
        <Excalidraw />
      </div>
    </>
  );
};

export default WhiteBoard;

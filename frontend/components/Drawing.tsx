// import { useCallback, useState } from "react";
// import { TLEventInfo, Tldraw } from "tldraw";
// import "tldraw/tldraw.css";
//
// // There's a guide at the bottom of this file!
//
// export default function DrawingComponent() {
//   const [events, setEvents] = useState<any[]>([]);
//
//   const handleEvent = useCallback((data: TLEventInfo) => {
//     setEvents((events) => {
//       const newEvents = events.slice(0, 100);
//       if (
//         newEvents[newEvents.length - 1] &&
//         newEvents[newEvents.length - 1].type === "pointer" &&
//         data.type === "pointer" &&
//         data.target === "canvas"
//       ) {
//         newEvents[newEvents.length - 1] = data;
//       } else {
//         newEvents.unshift(data);
//       }
//       return newEvents;
//     });
//   }, []);
//
//   console.log(JSON.stringify(events, undefined, 2));
//
//   return (
//     <div style={{ display: "flex" }}>
//       <div style={{ width: "50%", height: "100vh" }}>
//         <Tldraw
//           onMount={(editor) => {
//             editor.on("event", (event) => handleEvent(event));
//           }}
//         />
//       </div>
//       <div
//         style={{
//           width: "50%",
//           height: "100vh",
//           padding: 8,
//           background: "#eee",
//           border: "none",
//           fontFamily: "monospace",
//           fontSize: 12,
//           borderLeft: "solid 2px #333",
//           display: "flex",
//           flexDirection: "column-reverse",
//           overflow: "auto",
//           whiteSpace: "pre-wrap",
//         }}
//         onCopy={(event) => event.stopPropagation()}
//       >
//         <div>{JSON.stringify(events, undefined, 2)}</div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";

const Drawing = () => {
  const [socket, setSocket] = useState<WebSocket | null>();
  useEffect(() => {
    const webSocket = new WebSocket("ws://127.0.0.1:8899/api/wsFull");
    webSocket.onopen = () => {
      console.log("hello");
      webSocket.send("hello server");
    };
  }, []);
  return <div>Drawing</div>;
};

export default Drawing;

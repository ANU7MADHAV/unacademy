// "use client";
//
// import {
//   Room,
//   LocalParticipant,
//   createLocalVideoTrack,
//   createLocalAudioTrack,
//   VideoTrack,
//   AudioTrack,
// } from "livekit-client";
// import { useEffect, useState, useRef } from "react";
//
// const Page = () => {
//   const [livekitToken, setLivekitToken] = useState<string | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [room, setRoom] = useState<Room | null>(null);
//
//   // Local media tracks
//   const [localVideoTrack, setLocalVideoTrack] = useState<VideoTrack | null>(
//     null
//   );
//   const [localAudioTrack, setLocalAudioTrack] = useState<AudioTrack | null>(
//     null
//   );
//
//   // Media controls
//   const [isVideoEnabled, setIsVideoEnabled] = useState(true);
//   const [isAudioEnabled, setIsAudioEnabled] = useState(true);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const wsURL = process.env.NEXT_PUBLIC_LIVEKIT_URL;
//
//   // Fetch token on component mount
//   useEffect(() => {
//     const token = localStorage.getItem("livekit-token");
//     setLivekitToken(token);
//   }, []);
//
//   // Connect to room when token is available
//   useEffect(() => {
//     if (!wsURL || !livekitToken) return;
//
//     const newRoom = new Room({
//       adaptiveStream: true,
//       dynacast: true,
//     });
//
//     const connectRoom = async () => {
//       try {
//         await newRoom.connect(wsURL, livekitToken);
//         console.log("Connected to room", newRoom.name);
//         setRoom(newRoom);
//         setIsConnected(true);
//
//         // Publish local tracks
//         await publishLocalTracks(newRoom.localParticipant);
//         newRoom.localParticipant.isCameraEnabled;
//       } catch (error) {
//         console.error("Failed to connect to room", error);
//         setIsConnected(false);
//       }
//     };
//
//     connectRoom();
//
//     // Cleanup function
//     return () => {
//       if (newRoom) {
//         newRoom.disconnect();
//       }
//     };
//   }, [wsURL, livekitToken]);
//
//   // Publish local media tracks
//   const publishLocalTracks = async (localParticipant: LocalParticipant) => {
//     try {
//       // Create and publish camera track
//       const videoTrack = await createLocalVideoTrack();
//       await localParticipant.publishTrack(videoTrack);
//       setLocalVideoTrack(videoTrack);
//
//       // Attach video track to video element
//       if (localVideoRef.current) {
//         videoTrack.attach(localVideoRef.current);
//       }
//
//       // Create and publish audio track
//       const audioTrack = await createLocalAudioTrack();
//       await localParticipant.publishTrack(audioTrack);
//       setLocalAudioTrack(audioTrack);
//     } catch (error) {
//       console.error("Failed to publish local tracks", error);
//     }
//   };
//
//   // Toggle local video
//   const toggleVideo = () => {
//     if (!room || !room.localParticipant) return;
//
//     if (isVideoEnabled) {
//       // Unpublish video track
//       room.localParticipant.unpublishTrack(localTrack!);
//       localVideoTrack?.stop();
//     } else {
//       // Republish video track
//       publishLocalTracks(room.localParticipant);
//     }
//     setIsVideoEnabled(!isVideoEnabled);
//   };
//
//   // Toggle local audio
//   const toggleAudio = () => {
//     if (!room || !room.localParticipant) return;
//
//     if (isAudioEnabled) {
//       // Unpublish audio track
//       room.localParticipant.unpublishTrack(localAudioTrack!);
//       localAudioTrack?.stop();
//     } else {
//       // Republish audio track
//       publishLocalTracks(room.localParticipant);
//     }
//     setIsAudioEnabled(!isAudioEnabled);
//   };
//
//   // Screen sharing method
//   const startScreenShare = async () => {
//     if (!room || !room.localParticipant) return;
//
//     try {
//       // If already screen sharing, stop it
//       if (isScreenSharing) {
//         // Stop screen share logic
//         room.localParticipant.unpublishTracks(
//           (track) => track.source === "screen_share"
//         );
//         setIsScreenSharing(false);
//
//         // Republish original video track
//         await publishLocalTracks(room.localParticipant);
//         return;
//       }
//
//       // Start screen share
//       const screenShareTracks =
//         await room.localParticipant.createScreenTracks();
//
//       if (screenShareTracks.length > 0) {
//         // Unpublish existing video track
//         if (localVideoTrack) {
//           room.localParticipant.unpublishTrack(localVideoTrack);
//           localVideoTrack.stop();
//         }
//
//         // Publish screen share track
//         const screenVideoTrack = screenShareTracks[0];
//         await room.localParticipant.publishTrack(screenVideoTrack);
//
//         setIsScreenSharing(true);
//
//         // Attach to video ref if needed
//         if (localVideoRef.current) {
//           screenVideoTrack.attach(localVideoRef.current);
//         }
//       }
//     } catch (error) {
//       console.error("Failed to start screen share", error);
//     }
//   };
//
//   if (!wsURL) {
//     return <div>Missing LiveKit URL</div>;
//   }
//
//   if (!livekitToken) {
//     return <div>Loading..</div>;
//   }
//
//   return (
//     <div>
//       <h1>Local Video Conferencing</h1>
//
//       {/* Local Video */}
//       <div>
//         <h2>Your Video</h2>
//         <video ref={localVideoRef} autoPlay playsInline muted />
//       </div>
//
//       {/* Control Buttons */}
//       <div>
//         <button onClick={toggleVideo}>
//           {isVideoEnabled ? "Disable Video" : "Enable Video"}
//         </button>
//         <button onClick={toggleAudio}>
//           {isAudioEnabled ? "Mute Audio" : "Unmute Audio"}
//         </button>
//         <button onClick={startScreenShare}>
//           {isScreenSharing ? "Stop Screen Share" : "Start Screen Share"}
//         </button>
//       </div>
//     </div>
//   );
// };
//
// export default Page;

//
// "use client";
//
// import { Room, LocalParticipant } from "livekit-client";
//
// import React, { useEffect, useState } from "react";
//
// const page = () => {
//   const [livekitToken, setLivekitToken] = useState<string | null>(null);
//   const [room, setRoom] = useState<Room | null>(null);
//
//   const wURL = process.env.NEXT_PUBLIC_LIVEKIT_URL;
//
//   useEffect(() => {
//     const livekitT = localStorage.getItem("livekit-token");
//     setLivekitToken(livekitT);
//   }, []);
//
//   useEffect(() => {
//     if (!wURL) {
//       return;
//     }
//
//     if (!livekitToken) {
//       return;
//     }
//     const connectRoom = async () => {
//       try {
//         const room = new Room();
//         room.connect(wURL, livekitToken);
//         setRoom(room);
//         const localParticipant = room.localParticipant;
//         const camera = await localParticipant.setCameraEnabled(true);
//         console.log("camera", camera);
//         const micro = await localParticipant.setMicrophoneEnabled(true);
//         console.log(micro);
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     connectRoom();
//
//     if (room) {
//       room.disconnect();
//     }
//   }, [wURL, livekitToken]);
//
//   return <div>connected</div>;
// };
//
// export default page;

import React from "react";

const page = () => {
  return <div>page</div>;
};

export default page;

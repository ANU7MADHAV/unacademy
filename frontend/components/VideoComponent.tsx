import React, { useEffect, useRef, useState } from "react";

const VideoComponent = () => {
  const [stream, setStream] = useState<MediaStream | undefined>();
  const [camerBool, setCameraBool] = useState(true);
  const [audiBool, setAudioBool] = useState(true);
  const myVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: camerBool, audio: audiBool })
      .then((stream: MediaStream) => {
        setStream(stream);
        if (myVideo.current) {
          (myVideo.current as HTMLVideoElement).srcObject = stream;
        }
      });
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [camerBool, audiBool]);

  return (
    <div className="space-y-3">
      <section>
        {camerBool || (
          <div className="w-[300px] h-[200px] rounded-full bg-black"></div>
        )}
        {camerBool && (
          <video
            className="rounded-full w-[300px]"
            playsInline
            muted
            ref={myVideo}
            autoPlay
          />
        )}
      </section>
      <div className="flex justify-center space-x-3">
        <button
          onClick={() => {
            console.log(camerBool);
            setCameraBool(!camerBool);
          }}
          className={`bg-blue-400 px-4 py-2 rounded-lg text-white  ${
            camerBool ? "no-underline" : "line-through"
          }`}
        >
          Camera
        </button>
      </div>
    </div>
  );
};

export default VideoComponent;

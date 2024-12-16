"use client";
import useUserVideo from "../hooks/useUserVideo";

const UserVideoComponent = () => {
  const { audioRef, screenRef, videoRef, loading, isScreenSharing } =
    useUserVideo();

  if (loading) return <div>Loading..</div>;

  return (
    <div className="h-screen overflow-hidden w-screen">
      <video
        ref={screenRef}
        muted
        autoPlay
        playsInline
        className={`${isScreenSharing ? "h-full w-full absolute" : "hidden"}`}
      />

      <audio ref={audioRef} muted />

      <div
        className={`${
          isScreenSharing ? "absolute z-10 top-5 right-5" : "relative"
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`${
            isScreenSharing
              ? "w-[300px] h-[300px] rounded-md"
              : "h-full w-full bg-black"
          }`}
        />
      </div>
    </div>
  );
};

export default UserVideoComponent;

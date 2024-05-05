import videojs from "video.js";
import "./App.css";
import VideoPlayer from "./components/videoPlayer";
import { useRef } from "react";

function App() {
  const playerRef = useRef(null);
  const videoLink =
    "http://localhost:8080/uploads/hlsready/5b408d6c-6ae4-4396-955a-d06d18581580/index.m3u8";
  const videoPlayerOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoLink,
        type: "application/x-mpegURL",
      },
    ],
  };
  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };
  return (
    <>
      <div>
        <h1>Video player</h1>
      </div>

      <VideoPlayer
        options={videoPlayerOptions}
        onReady={handlePlayerReady}
      />
    </>
  );
}

export default App;
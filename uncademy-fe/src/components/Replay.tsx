import { useEffect } from "react";
import axios from "axios";

const Replay = () => {
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/v1/event/replay/room123"
        );
        const data = await response.data;
        console.log("data", JSON.stringify(data));
      } catch (err) {
        console.log("error", err);
      }
    };

    fetchEvents();
  }, []);

  return <h1>Hello world</h1>;
};

export default Replay;

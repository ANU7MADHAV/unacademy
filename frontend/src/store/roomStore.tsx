import { create } from "zustand";

interface RoomStore {
  room: string;
  setRoom: (room: string) => void;
}

const useRoomStore = create<RoomStore>((set) => ({
  room: "",
  setRoom: (newRoom: string) => set({ room: newRoom }),
}));

export default useRoomStore;

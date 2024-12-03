import { create } from "zustand";

interface UserStore {
  username: string;
  setUsername: (newUsername: string) => void;
}

const userUserStore = create<UserStore>((set) => ({
  username: "",
  setUsername: (newUsername: string) => set({ username: newUsername }),
}));

export default userUserStore;

import { create } from "zustand";

interface UserStore {
  username: string;
  setUsername: (newUsername: string) => void;
}

const userAuthStore = create<UserStore>((set) => ({
  username: "",
  setUsername: (newUsername: string) => set({ username: newUsername }),
}));

export default userAuthStore;

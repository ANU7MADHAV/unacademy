import { create } from "zustand";

interface TokenStore {
  token: string;
  setToken: (token: string) => void;
}

const useTokenStore = create<TokenStore>((set) => ({
  token: "",
  setToken: (newToken: string) => set({ token: newToken }),
}));

export default useTokenStore;

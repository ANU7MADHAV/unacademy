import { create } from "zustand";

interface SlidesShow {
  isShowSlides: boolean;
  setShowSlides: (isShowSlides: boolean) => void;
}

const useSlidesShowStore = create<SlidesShow>((set) => ({
  isShowSlides: false,
  setShowSlides: (newIsShowSlides: boolean) =>
    set({ isShowSlides: newIsShowSlides }),
}));

export default useSlidesShowStore;

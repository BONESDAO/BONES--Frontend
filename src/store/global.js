import {defineStore} from "pinia";

export const useGlobalStore = defineStore("global", {
  persist: {
    enabled: true,
    strategies: {
      key: "global",
      storage: window.localStorage,
    }
  },
  state(){
    return {
      botUsername: "Bones_Gamebot",
      userId: 0,
      username: "",
      uacceptcode: "",
      inviteCode: "",
    }
  }
});

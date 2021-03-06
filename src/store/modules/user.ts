import { defineStore } from "pinia";
import { store } from "@/store";
import { ACCESS_TOKEN, CURRENT_USER } from "../mutation-types";
import { createStorage, storage } from "@/utils/Storage";
import { getUserInfo, login } from "@/api/system/user";
import { ResultEnum } from "@/enums/httpEnum";
const Storage = createStorage({ storage: localStorage });

export interface IUserState {
  token: string;
  username: string;
  welcome: string;
  avatar: string;
  permissions: any[];
  info: any;
}
export const useUserStore = defineStore({
  id: "app-user",
  state: (): IUserState => ({
    token: Storage.get(ACCESS_TOKEN, ""),
    username: "",
    welcome: "",
    avatar: "",
    permissions: [],
    info: Storage.get(CURRENT_USER, {}),
  }),
  getters: {
    getToken(): string {
      return this.token;
    },
    getPermissions(): [any][] {
      return this.permissions;
    },
  },
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setAvatar(avatar: string) {
      this.avatar = avatar;
    },
    setPermissions(permissions: any) {
      this.permissions = permissions;
    },
    setUserInfo(info: any) {
      this.info = info;
    },
    // 登录
    async login(userInfo: any) {
      try {
        const response = await login(userInfo);
        // const { result, code } = response;
        if (response) {
          const ex = 7 * 24 * 60 * 60 * 1000;
          storage.set(ACCESS_TOKEN, response.access_token, ex);
          storage.set(CURRENT_USER, response.tenantIds, ex);
          this.setToken(response.access_token);
          this.setUserInfo(response);
        }
        return Promise.resolve(response);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    GetInfo() {
      const that = this;
      return new Promise((resolve, reject) => {
        getUserInfo()
          .then((res) => {
            const result = res;
            if (result.permissions && result.permissions.length) {
              const permissionsList = result.permissions;
              that.setPermissions(permissionsList);
              that.setUserInfo(result);
            } else {
              reject(
                new Error("getInfo: permissionsList must be a non-null array !")
              );
            }
            that.setAvatar(result.avatar);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 登出
    async logout() {
      this.setPermissions([]);
      this.setUserInfo("");
      storage.remove(ACCESS_TOKEN);
      storage.remove(CURRENT_USER);
      return Promise.resolve("");
    },
  },
});

// Need to be used outside the setup
export function useUserStoreWidthOut() {
  return useUserStore(store);
}

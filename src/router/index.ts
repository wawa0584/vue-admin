import { App } from "vue";
import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from "vue-router";
import { RedirectRoute } from "@/router/base";
import { createRouterGuards } from "./router-guards";
import { PageEnum } from "@/enums/pageEnum";

// @ts-ignore
const modules = import.meta.globEager("./modules/**/*.ts");

const routeModuleList: RouteRecordRaw[] = [];

Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeModuleList.push(...modList);
});
export const RootRoute: RouteRecordRaw = {
  path: "/",
  name: "Root",
  redirect: PageEnum.BASE_HOME_REDIRECT,
  meta: {
    title: "Root",
  },
};

export const LoginRoute: RouteRecordRaw = {
  path: "/login",
  name: "Login",
  component: () => import("@/pages/login/login.vue"),
  meta: {
    title: "登录",
  },
};
//需要验证权限
export const asyncRoutes = [...routeModuleList];

//普通路由 无需验证权限
// export const constantRouter: any[] = [LoginRoute, RootRoute, RedirectRoute];
export const constantRouter: any[] = [LoginRoute, RootRoute, RedirectRoute];

const router = createRouter({
  history: createWebHistory(""),
  routes: constantRouter,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export function setupRouter(app: App) {
  app.use(router);
  // 创建路由守卫
  createRouterGuards(router);
}

export default router;

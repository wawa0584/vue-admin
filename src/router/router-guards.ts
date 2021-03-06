import type { RouteRecordRaw } from "vue-router";
import { Router } from "vue-router";
import { useUserStoreWidthOut } from "@/store/modules/user";
import { useAsyncRouteStoreWidthOut } from "@/store/modules/asyncRoute";
import { ACCESS_TOKEN } from "@/store/mutation-types";
import { storage } from "@/utils/Storage";
import { PageEnum } from "@/enums/pageEnum";
import { ErrorPageRoute } from "@/router/base";
import { Recordable } from "@/global";
//login
const LOGIN_PATH = PageEnum.BASE_LOGIN;
const whitePathList = [LOGIN_PATH]; // no redirect whitelist
export function createRouterGuards(router: Router) {
  //用户信息存储state
  const userStore = useUserStoreWidthOut();
  //路由相关存储
  const asyncRouteStore = useAsyncRouteStoreWidthOut();
  router.beforeEach(async (to, from, next) => {
    //@ts-ignore
    const Loading = window["$loading"] || null;
    console.log(Loading);
    Loading && Loading.start();
    if (from.path === LOGIN_PATH && to.name === "errorPage") {
      next(PageEnum.BASE_HOME_REDIRECT);
      return;
    }
    // Whitelist can be directly entered
    if (whitePathList.includes(to.path as PageEnum)) {
      next();
      return;
    }
    //获取token
    const token = storage.get(ACCESS_TOKEN);
    if (!token) {
      //可以设置不适用权限进行访问
      if (to.meta.ignoreAuth) {
        next();
        return;
      }
      // redirect login page
      const redirectData: {
        path: string;
        replace: boolean;
        query?: Recordable<string>;
      } = {
        path: LOGIN_PATH,
        replace: true,
      };
      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path,
        };
      }
      next(redirectData);
      return;
    }

    if (asyncRouteStore.getIsDynamicAddedRoute) {
      next();
      return;
    }
    const userInfo = await userStore.GetInfo();
    const routes = await asyncRouteStore.generateRoutes(userInfo);

    // 动态添加可访问路由表
    routes.forEach((item) => {
      router.addRoute(item as unknown as RouteRecordRaw);
    });

    //添加404
    const isErrorPage = router
      .getRoutes()
      .findIndex((item) => item.name === ErrorPageRoute.name);
    if (isErrorPage === -1) {
      router.addRoute(ErrorPageRoute as unknown as RouteRecordRaw);
    }
    const redirectPath = (from.query.redirect || to.path) as string;
    const redirect = decodeURIComponent(redirectPath);
    const nextData =
      to.path === redirect ? { ...to, replace: true } : { path: redirect };
    asyncRouteStore.setDynamicAddedRoute(true);
    next(nextData);
    Loading && Loading.finish();
  });
  // router.onError((error) => {
  //   console.log(error, "路由错误");
  // });
}

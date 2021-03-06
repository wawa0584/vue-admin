import { renderIcon } from "@/utils";
import { RouteRecordRaw } from "vue-router";
import { DashboardOutlined } from "@vicons/antd";

const routeName = "群发短信/通知";

/**
 * @param name 路由名称, 必须设置,且不能重名
 * @param meta 路由元信息（路由附带扩展信息）
 * @param redirect 重定向地址, 访问这个路由时,自定进行重定向
 * @param meta.disabled 禁用整个菜单
 * @param meta.title 菜单名称
 * @param meta.icon 菜单图标
 * @param meta.keepAlive 缓存该路由
 * @param meta.sort 排序越小越排前
 * */
const routes: Array<RouteRecordRaw> = [
  {
    path: "/dashboard",
    name: routeName,
    component: () => import("@/layout/index.vue"),
    meta: {
      title: "Dashboard",
      icon: renderIcon(DashboardOutlined),
      permissions: ["dashboard_console", "dashboard_workplace"],
      sort: 0,
    },
    children: [
      {
        path: "console",
        name: `${routeName}`,
        meta: {
          title: "主控台",
          permissions: ["dashboard_console"],
        },
        component: () => import("@/pages/dashboard/console/console.vue"),
      },
      {
        path: "monitor",
        name: `${routeName}monitor`,
        meta: {
          title: "工作台",
          keepAlive: true,
          permissions: ["dashboard_workplace"],
        },
        component: () => import("@/pages/dashboard/monitor/monitor.vue"),
      },
    ],
  },
];

export default routes;

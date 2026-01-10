import { createRouter, createWebHistory } from "vue-router";
import IndexPage from "@/pages/Index/index.vue";
import EditPage from "@/pages/Edit/index.vue";
import AdminPage from "@/pages/Admin/index.vue";
import AccountPage from "@/pages/Account/index.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Index",
      component: IndexPage,
    },
    {
      path: "/mind-master",
      name: "MindMaster",
      component: EditPage,
    },
    {
      path: "/admin",
      name: "Admin",
      component: AdminPage,
    },
    {
      path: "/account",
      name: "Account",
      component: AccountPage,
    },
  ],
});

export default router;

import { createRouter, createWebHistory } from "vue-router";
import Drum from "../views/Drum.vue";
import Invitation from "../views/Invitation.vue";
import Rankings from "../views/Rankings.vue";
import Task from "../views/Task.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "drum",
      component: Drum,
    },
    {
      path: "/invitation",
      name: "invitation",
      component: Invitation,
    },
    {
      path: "/rankings",
      name: "rankings",
      component: Rankings,
    },
    {
      path: "/task",
      name: "task",
      component: Task,
    }
  ],
})

export default router;

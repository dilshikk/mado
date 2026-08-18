/**
 * Central definition of team roles and what each role can access.
 * Keep this in sync with server/src/middleware/auth.js VALID_ROLES and
 * the `authorize([...])` calls in each server/src/routes/*.js file.
 */

export type UserRole = "admin" | "hr" | "marketing" | "content_manager" | "restaurant_manager";

export type NavSectionKey =
  | "dashboard"
  | "pages"
  | "menu"
  | "locations"
  | "catering"
  | "promotions"
  | "media"
  | "requests"
  | "careers"
  | "reviews"
  | "faq"
  | "users"
  | "activity"
  | "settings";

export const ROLES: { value: UserRole; name: string; description: string; color: string }[] = [
  {
    value: "admin",
    name: "Главный админ",
    description: "Полный доступ ко всем разделам, включая пользователей и настройки",
    color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
  {
    value: "hr",
    name: "HR",
    description: "Вакансии и заявки соискателей",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  },
  {
    value: "marketing",
    name: "Маркетинг",
    description: "Акции, отзывы, заявки клиентов и медиатека",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
  },
  {
    value: "content_manager",
    name: "Контент-менеджер",
    description: "Страницы сайта, меню, FAQ и медиатека",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    value: "restaurant_manager",
    name: "Менеджер ресторана",
    description: "Филиалы и заявки на кейтеринг",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
];

export const ROLE_META = Object.fromEntries(ROLES.map((r) => [r.value, r])) as Record<
  UserRole,
  (typeof ROLES)[number]
>;

/** Which roles can see/use each sidebar section. Admin always has access to everything. */
const SECTION_ACCESS: Record<NavSectionKey, UserRole[]> = {
  dashboard: ["admin", "hr", "marketing", "content_manager", "restaurant_manager"],
  pages: ["admin", "content_manager"],
  menu: ["admin", "content_manager"],
  locations: ["admin", "restaurant_manager"],
  catering: ["admin", "restaurant_manager"],
  promotions: ["admin", "marketing"],
  media: ["admin", "marketing", "content_manager"],
  requests: ["admin", "marketing"],
  careers: ["admin", "hr"],
  reviews: ["admin", "marketing"],
  faq: ["admin", "content_manager"],
  users: ["admin"],
  activity: ["admin"],
  settings: ["admin"],
};

export function canAccessSection(role: string | undefined | null, section: NavSectionKey): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  return SECTION_ACCESS[section].includes(role as UserRole);
}

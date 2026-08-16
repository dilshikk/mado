// ─── Types
export type TabId = "food" | "beverage" | "dessert" | "takeaway";

export type Dish = {
  name: string;
  description: string;
  price: string;
  image: string;
  isNew?: boolean;
  isSignature?: boolean;
  isVeg?: boolean;
};

export type Category = {
  id: string;
  label: string;
  tab: TabId;
  image: string;
  dishes: Dish[];
};

export const TABS: { id: TabId; label: string }[] = [
  { id: "food", label: "\u0415\u0434\u0430" },
  { id: "beverage", label: "\u041d\u0430\u043f\u0438\u0442\u043a\u0438" },
  { id: "dessert", label: "\u0414\u0435\u0441\u0435\u0440\u0442\u044b" },
  { id: "takeaway", label: "\u0421 \u0441\u043e\u0431\u043e\u0439" },
];

export const MENU_CATEGORIES: Category[] = [
  {
    id: "breakfast",
    label: "\u0417\u0430\u0432\u0442\u0440\u0430\u043a",
    tab: "food",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: "MADO \u0444\u0438\u0440\u043c\u0435\u043d\u043d\u044b\u0439 \u0437\u0430\u0432\u0442\u0440\u0430\u043a",
        description: "\u0422\u0440\u0430\u0434\u0438\u0446\u0438\u043e\u043d\u043d\u044b\u0439 \u0442\u0443\u0440\u0435\u0446\u043a\u0438\u0439 \u0437\u0430\u0432\u0442\u0440\u0430\u043a: \u0431\u044b\u043d\u043d\u043e\u0435 \u043c\u0430\u0441\u043b\u043e, \u0441\u044b\u0440, \u043e\u043b\u0438\u0432\u043a\u0438, \u0442\u043e\u043c\u0430\u0442\u044b, \u043e\u0433\u0443\u0440\u0446\u044b, \u0432\u0430\u0440\u0435\u043d\u044c\u0435 \u0438 \u0441\u0432\u0435\u0436\u0438\u0439 \u0445\u043b\u0435\u0431.",
        price: "69\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: "\u041c\u0435\u043d\u0435\u043c\u0435\u043d",
        description: "\u042f\u0438\u0447\u043d\u0438\u0446\u0430-\u0431\u043e\u043b\u0442\u0443\u043d\u044c\u044f \u0441 \u043f\u0435\u0440\u0446\u0435\u043c, \u043f\u043e\u043c\u0438\u0434\u043e\u0440\u0430\u043c\u0438, \u043b\u0443\u043a\u043e\u043c \u0438 \u0441\u043f\u0435\u0446\u0438\u044f\u043c\u0438 \u0432 \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u043e\u043d\u043d\u043e\u043c \u0441\u0442\u0438\u043b\u0435.",
        price: "45\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80",
        isNew: true,
      },
      {
        name: "\u0422\u043e\u0441\u0442 \u0441 \u0430\u0432\u043e\u043a\u0430\u0434\u043e",
        description: "\u041c\u043d\u043e\u0433\u043e\u0437\u0435\u0440\u043d\u043e\u0432\u044b\u0439 \u0445\u043b\u0435\u0431, \u043a\u0440\u0435\u043c\u043e\u0432\u043e\u0435 \u0430\u0432\u043e\u043a\u0430\u0434\u043e, \u043f\u043e\u043c\u0438\u0434\u043e\u0440\u044b \u0447\u0435\u0440\u0440\u0438, \u043c\u0438\u043a\u0440\u043e\u0437\u0435\u043b\u0435\u043d\u044c.",
        price: "38\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c820?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
      {
        name: "\u0421\u0443\u0434\u0436\u0443\u043a-\u043e\u043c\u043b\u0435\u0442 \u0441 \u0441\u044b\u0440\u043e\u043c",
        description: "\u041d\u0435\u0436\u043d\u044b\u0439 \u043e\u043c\u043b\u0435\u0442 \u0441 \u0442\u0443\u0440\u0435\u0446\u043a\u043e\u0439 \u043a\u043e\u043b\u0431\u0430\u0441\u043e\u0439 \u0441\u0443\u0434\u0436\u0443\u043a, \u0441\u044b\u0440\u043e\u043c \u0444\u0435\u0442\u0430 \u0438 \u0441\u0432\u0435\u0436\u0438\u043c\u0438 \u0442\u043e\u043c\u0430\u0442\u0430\u043c\u0438.",
        price: "42\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "soup",
    label: "\u0421\u0443\u043f\u044b",
    tab: "food",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: "\u0422\u043e\u043c\u0430\u0442\u043d\u044b\u0439 \u0441\u0443\u043f \u0441 \u0442\u0438\u043c\u044c\u044f\u043d\u043e\u043c",
        description: "\u0422\u0440\u0430\u0434\u0438\u0446\u0438\u043e\u043d\u043d\u044b\u0439 \u0442\u0443\u0440\u0435\u0446\u043a\u0438\u0439 \u0441\u0443\u043f \u043d\u0430 \u043e\u0441\u043d\u043e\u0432\u0435 \u0441\u0432\u0435\u0436\u0438\u0445 \u0442\u043e\u043c\u0430\u0442\u043e\u0432 \u0441 \u043f\u0440\u044f\u043d\u044b\u043c\u0438 \u0442\u0440\u0430\u0432\u0430\u043c\u0438.",
        price: "28\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1588566565463-180a5d5a7a69?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
      {
        name: "\u041c\u0435\u0440\u0434\u0436\u0438\u043c\u0435\u043a",
        description: "\u0413\u0443\u0441\u0442\u043e\u0439 \u0447\u0435\u0447\u0435\u0432\u0438\u0446\u043d\u044b\u0439 \u0441\u0443\u043f \u0441\u043e \u0441\u043f\u0435\u0446\u0438\u044f\u043c\u0438, \u043b\u0438\u043c\u043e\u043d\u043d\u044b\u043c \u0441\u043e\u043a\u043e\u043c \u0438 \u0433\u0440\u0435\u043d\u043a\u0430\u043c\u0438.",
        price: "26\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
        isVeg: true,
      },
      {
        name: "\u041a\u0443\u0440\u0438\u043d\u044b\u0439 \u0441\u0443\u043f \u0441 \u043b\u0430\u043f\u0448\u043e\u0439",
        description: "\u041d\u0430\u0441\u044b\u0449\u0435\u043d\u043d\u044b\u0439 \u043d\u0430\u0432\u0430\u0440\u043d\u043e\u0439 \u0441\u0443\u043f \u0441 \u043b\u0430\u043f\u0448\u043e\u0439, \u043c\u043e\u0440\u043a\u043e\u0432\u044c\u044e, \u0437\u0435\u043b\u0435\u043d\u044c\u044e \u0438 \u043b\u0438\u043c\u043e\u043d\u043e\u043c.",
        price: "32\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "cold-mezza",
    label: "\u0425\u043e\u043b\u043e\u0434\u043d\u044b\u0435 \u0437\u0430\u043a\u0443\u0441\u043a\u0438",
    tab: "food",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: "\u0425\u0443\u043c\u0443\u0441 \u043a\u043b\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043a\u0438\u0439",
        description: "\u0422\u0440\u0430\u0434\u0438\u0446\u0438\u043e\u043d\u043d\u044b\u0439 \u043d\u0443\u0442 \u0445\u0443\u043c\u0443\u0441 \u0441 \u043e\u043b\u0438\u0432\u043a\u043e\u0432\u044b\u043c \u043c\u0430\u0441\u043b\u043e\u043c, \u043f\u0430\u043f\u0440\u0438\u043a\u043e\u0439 \u0438 \u043f\u0435\u0442\u0440\u0443\u0448\u043a\u043e\u0439.",
        price: "35\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1554998171-89445e31c52b?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        isSignature: true,
      },
      {
        name: "\u0422\u0430\u0431\u0431\u0443\u043b\u0435",
        description: "\u0421\u0432\u0435\u0436\u0430\u044f \u043f\u0435\u0442\u0440\u0443\u0448\u043a\u0430, \u043c\u0435\u043b\u043a\u0430\u044f \u043f\u0448\u0435\u043d\u0438\u0447\u043d\u0430\u044f \u043a\u0440\u0443\u043f\u0430, \u043f\u043e\u043c\u0438\u0434\u043e\u0440\u044b, \u043b\u0438\u043c\u043e\u043d\u043d\u0430\u044f \u0437\u0430\u043f\u0440\u0430\u0432\u043a\u0430, \u043e\u043b\u0438\u0432\u043a\u043e\u0432\u043e\u0435 \u043c\u0430\u0441\u043b\u043e.",
        price: "33\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
  {
    id: "grill",
    label: "\u041d\u0430 \u0433\u0440\u0438\u043b\u0435",
    tab: "food",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: "\u0410\u0434\u0430\u043d\u0430-\u043a\u0435\u0431\u0430\u0431",
        description: "\u0421\u043e\u0447\u043d\u044b\u0439 \u043a\u0435\u0431\u0430\u0431 \u0438\u0437 \u0440\u0443\u0447\u043d\u043e\u0433\u043e \u0444\u0430\u0440\u0448\u0430 \u0441 \u043e\u0441\u0442\u0440\u044b\u043c \u043f\u0435\u0440\u0446\u0435\u043c, \u0436\u0430\u0440\u0435\u043d\u044b\u0439 \u043d\u0430 \u043e\u0442\u043a\u0440\u044b\u0442\u043e\u043c \u0443\u0433\u043b\u0435.",
        price: "79\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: "\u0424\u0438\u0441\u0442\u0430\u0448\u043e\u0432\u044b\u0439 \u043a\u0435\u0431\u0430\u0431",
        description: "\u0424\u0438\u0440\u043c\u0435\u043d\u043d\u044b\u0439 \u043a\u0435\u0431\u0430\u0431 \u0441 \u043c\u043e\u043b\u043e\u0442\u044b\u043c \u0444\u0438\u0441\u0442\u0430\u0448\u043a\u043e\u043c, \u043f\u043e\u0434\u0430\u0451\u0442\u0441\u044f \u043d\u0430 \u0431\u0430\u043a\u043b\u0430\u0436\u0430\u043d\u043d\u043e\u043c \u0441\u0430\u043b\u0430\u0442\u0435.",
        price: "95\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1558030137-a56c1b002c72?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
        isNew: true,
      },
      {
        name: "\u0423\u0440\u0444\u0430-\u043a\u0435\u0431\u0430\u0431",
        description: "\u041c\u044f\u0433\u043a\u0438\u0439 \u043a\u0435\u0431\u0430\u0431 \u0438\u0437 \u0444\u0430\u0440\u0448\u0430 \u0441 \u0436\u0430\u0440\u0435\u043d\u044b\u043c \u043f\u0435\u0440\u0446\u0435\u043c. \u041f\u043e\u0434\u0430\u0451\u0442\u0441\u044f \u0441 \u043b\u0430\u0432\u0430\u0448\u043e\u043c.",
        price: "75\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "specialties",
    label: "\u0424\u0438\u0440\u043c\u0435\u043d\u043d\u044b\u0435",
    tab: "food",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: "\u0418\u0441\u043a\u0435\u043d\u0434\u0435\u0440-\u043a\u0435\u0431\u0430\u0431",
        description: "\u0421\u043b\u0430\u0434\u043a\u0438\u0439 \u044f\u0433\u043d\u0451\u043d\u043e\u043a \u0441 \u043a\u0435\u0444\u0438\u0440\u043e\u043c, \u0442\u043e\u043c\u0430\u0442\u043d\u044b\u043c \u0441\u043e\u0443\u0441\u043e\u043c \u0438 \u0436\u0430\u0440\u0435\u043d\u044b\u043c \u043f\u0435\u0440\u0446\u0435\u043c.",
        price: "89\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1585325701165-f9e5b78a0e43?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: "MADO \u0431\u0443\u0440\u0433\u0435\u0440",
        description: "\u0421\u043e\u0447\u043d\u0430\u044f \u0433\u043e\u0432\u044f\u0436\u044c\u044f \u043a\u043e\u0442\u043b\u0435\u0442\u0430, \u043f\u043e\u043c\u0438\u0434\u043e\u0440\u044b, \u043b\u0443\u043a, \u043f\u0435\u0440\u0435\u0446, \u0441\u043e\u0443\u0441 MADO. \u041f\u043e\u0434\u0430\u0451\u0442\u0441\u044f \u0441 \u0436\u0430\u0440\u0435\u043d\u044b\u043c \u043a\u0430\u0440\u0442\u043e\u0444\u0435\u043b\u0435\u043c.",
        price: "58\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        isNew: true,
      },
    ],
  },
  {
    id: "hot-drinks",
    label: "\u0413\u043e\u0440\u044f\u0447\u0438\u0435 \u043d\u0430\u043f\u0438\u0442\u043a\u0438",
    tab: "beverage",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: "\u0422\u0443\u0440\u0435\u0446\u043a\u0438\u0439 \u0447\u0430\u0439",
        description: "\u0422\u0440\u0430\u0434\u0438\u0446\u0438\u043e\u043d\u043d\u044b\u0439 \u0447\u0430\u0439, \u043f\u043e\u0434\u0430\u0451\u0442\u0441\u044f \u0432 \u0442\u0443\u0440\u0435\u0446\u043a\u043e\u043c \u0447\u0430\u0439\u043d\u0438\u043a\u0435 \u0441 \u0441\u0430\u0445\u0430\u0440\u043e\u043c.",
        price: "18\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: "\u0422\u0443\u0440\u0435\u0446\u043a\u0438\u0439 \u043a\u043e\u0444\u0435",
        description: "\u0422\u0440\u0430\u0434\u0438\u0446\u0438\u043e\u043d\u043d\u044b\u0439 \u0442\u0443\u0440\u0435\u0446\u043a\u0438\u0439 \u043a\u043e\u0444\u0435 \u043d\u0430 \u043f\u0435\u0441\u043a\u0435. \u0413\u0443\u0441\u0442\u043e\u0439, \u0430\u0440\u043e\u043c\u0430\u0442\u043d\u044b\u0439, \u043d\u0435\u0437\u0430\u0431\u044b\u0432\u0430\u0435\u043c\u044b\u0439.",
        price: "22\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: "\u041a\u0430\u043f\u0443\u0447\u0447\u0438\u043d\u043e",
        description: "\u0418\u0441\u043f\u0440\u0435\u0441\u0441\u043e \u0441 \u043f\u0430\u0440\u043d\u044b\u043c \u043c\u043e\u043b\u043e\u043a\u043e\u043c, \u043f\u043e\u0441\u044b\u043f\u0430\u043d\u043d\u044b\u0439 \u043a\u043e\u0440\u0438\u0446\u0435\u0439.",
        price: "24\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
  {
    id: "cold-drinks",
    label: "\u0425\u043e\u043b\u043e\u0434\u043d\u044b\u0435 \u043d\u0430\u043f\u0438\u0442\u043a\u0438",
    tab: "beverage",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: "\u0410\u0439\u0440\u0430\u043d",
        description: "\u041e\u0445\u043b\u0430\u0436\u0434\u0430\u044e\u0449\u0438\u0439 \u0442\u0443\u0440\u0435\u0446\u043a\u0438\u0439 \u043d\u0430\u043f\u0438\u0442\u043e\u043a \u043d\u0430 \u043e\u0441\u043d\u043e\u0432\u0435 \u043a\u0435\u0444\u0438\u0440\u0430 \u0441 \u0441\u043e\u043b\u044c\u044e.",
        price: "22\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: "\u0421\u0432\u0435\u0436\u0438\u0439 \u0430\u043f\u0435\u043b\u044c\u0441\u0438\u043d\u043e\u0432\u044b\u0439 \u0441\u043e\u043a",
        description: "\u0421\u0432\u0435\u0436\u0435\u0432\u044b\u0436\u0430\u0442\u044b\u0439 \u0430\u043f\u0435\u043b\u044c\u0441\u0438\u043d \u0431\u0435\u0437 \u0434\u043e\u0431\u0430\u0432\u043e\u043a.",
        price: "24\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
      {
        name: "\u041c\u0430\u043d\u0433\u043e\u0432\u044b\u0439 \u0441\u043c\u0443\u0437\u0438",
        description: "\u0421\u043f\u0435\u043b\u044b\u0439 \u043c\u0430\u043d\u0433\u043e, \u043a\u043e\u043a\u043e\u0441\u043e\u0432\u043e\u0435 \u043c\u043e\u043b\u043e\u043a\u043e \u0438 \u043c\u0451\u0434. \u0422\u0440\u043e\u043f\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0432\u043a\u0443\u0441.",
        price: "26\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1561043433-aaf687c4cf04?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
  {
    id: "ice-cream",
    label: "\u041c\u043e\u0440\u043e\u0436\u0435\u043d\u043e\u0435",
    tab: "dessert",
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: "\u0414\u043e\u043d\u0434\u0443\u0440\u043c\u0430",
        description: "\u0424\u0438\u0440\u043c\u0435\u043d\u043d\u043e\u0435 \u0442\u0443\u0440\u0435\u0446\u043a\u043e\u0435 \u043c\u043e\u0440\u043e\u0436\u0435\u043d\u043e\u0435, \u0440\u0430\u0441\u0442\u044f\u0433\u0438\u0432\u0430\u044e\u0449\u0435\u0435\u0441\u044f, \u0441 \u0444\u0438\u0441\u0442\u0430\u0448\u043a\u0430\u043c\u0438 \u0438 \u0444\u0438\u043d\u0438\u043a\u0430\u043c\u0438.",
        price: "28\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: "\u0414\u043e\u043d\u0434\u0443\u0440\u043c\u0430 \u0441 \u0431\u0430\u043a\u043b\u0430\u0432\u043e\u0439",
        description: "\u0424\u0438\u0440\u043c\u0435\u043d\u043d\u043e\u0435 \u043c\u043e\u0440\u043e\u0436\u0435\u043d\u043e\u0435 MADO \u0441 \u043a\u0443\u0441\u043e\u0447\u043a\u043e\u043c \u043f\u0438\u0441\u0442\u0430\u0448\u043e\u0432\u043e\u0439 \u0431\u0430\u043a\u043b\u0430\u0432\u044b.",
        price: "35\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
        isNew: true,
      },
    ],
  },
  {
    id: "turkish-dessert",
    label: "\u0422\u0443\u0440\u0435\u0446\u043a\u0438\u0435 \u0434\u0435\u0441\u0435\u0440\u0442\u044b",
    tab: "dessert",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: "\u0411\u0430\u043a\u043b\u0430\u0432\u0430 \u043f\u0438\u0441\u0442\u0430\u0448\u043e\u0432\u0430\u044f",
        description: "\u0422\u043e\u043d\u0447\u0430\u0439\u0448\u0438\u0435 \u043b\u0438\u0441\u0442\u044b \u0444\u0438\u043b\u043e \u0441 \u043c\u043e\u043b\u043e\u0442\u044b\u043c \u0444\u0438\u0441\u0442\u0430\u0448\u043a\u043e\u043c \u0438 \u0448\u0435\u0440\u0431\u0435\u0442\u043e\u043c.",
        price: "35\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: "\u041a\u0430\u0434\u0430\u0438\u0444",
        description: "\u041e\u0440\u0435\u0445\u043e\u0432\u043e\u0435 \u0442\u0435\u0441\u0442\u043e \u0441 \u0442\u0432\u043e\u0440\u043e\u0433\u043e\u043c, \u043f\u043e\u043b\u0438\u0442\u043e\u0435 \u0433\u0443\u0441\u0442\u044b\u043c \u0448\u0435\u0440\u0431\u0435\u0442\u043e\u043c \u0438 \u0443\u043a\u0440\u0430\u0448\u0435\u043d\u043d\u043e\u0435 \u043c\u043e\u043b\u043e\u0442\u044b\u043c \u0444\u0438\u0441\u0442\u0430\u0448\u043a\u043e\u043c.",
        price: "40\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
        isNew: true,
      },
      {
        name: "\u0421\u0443\u0442\u043b\u0430\u0447",
        description: "\u041d\u0435\u0436\u043d\u044b\u0439 \u043c\u043e\u043b\u043e\u0447\u043d\u044b\u0439 \u043f\u0443\u0434\u0438\u043d\u0433 \u0441 \u043a\u0443\u0440\u0438\u0446\u0435\u0439, \u043f\u043e\u0441\u044b\u043f\u0430\u043d\u043d\u044b\u0439 \u043a\u043e\u0440\u0438\u0446\u0435\u0439.",
        price: "32\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1580984969071-a8da8e0a4cce?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
  {
    id: "combos",
    label: "\u041a\u043e\u043c\u0431\u043e-\u043d\u0430\u0431\u043e\u0440\u044b",
    tab: "takeaway",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: "\u041a\u043e\u043c\u0431\u043e \u00ab\u0417\u0430\u0432\u0442\u0440\u0430\u043a\u00bb",
        description: "\u0422\u0443\u0440\u0435\u0446\u043a\u0438\u0439 \u0437\u0430\u0432\u0442\u0440\u0430\u043a + \u043d\u0430\u043f\u0438\u0442\u043e\u043a \u043d\u0430 \u0432\u044b\u0431\u043e\u0440 + \u0434\u043e\u043d\u0434\u0443\u0440\u043c\u0430 MADO.",
        price: "88\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: "\u041a\u043e\u043c\u0431\u043e \u00ab\u041c\u0435\u0437\u0437\u0435\u00bb",
        description: "\u0412\u044b\u0431\u043e\u0440 \u0438\u0437 3 \u0445\u043e\u043b\u043e\u0434\u043d\u044b\u0445 \u0437\u0430\u043a\u0443\u0441\u043e\u043a + \u0440\u0435\u0437\u043d\u043e\u0439 \u0445\u043b\u0435\u0431 + \u0447\u0430\u0439.",
        price: "75\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
      {
        name: "\u041a\u043e\u043c\u0431\u043e \u00ab\u0413\u0440\u0438\u043b\u044c\u00bb",
        description: "\u0410\u0434\u0430\u043d\u0430-\u043a\u0435\u0431\u0430\u0431 + \u0441\u0430\u043b\u0430\u0442 \u0422\u0430\u0431\u0431\u0443\u043b\u0435 + \u043d\u0430\u043f\u0438\u0442\u043e\u043a \u043d\u0430 \u0432\u044b\u0431\u043e\u0440.",
        price: "110\u00a0000 \u0441\u045e\u043c",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

/**
 * Mock API for development/testing without database
 * Replace this with real API calls by removing the mock layer
 */

import api from './api';

// Store mock data in localStorage
const MOCK_STORAGE_KEY = 'mado_mock_data';

export const mockData = {
  categories: [
    { id: 1, label: 'Салаты', tab: 'food', dish_count: 5 },
    { id: 2, label: 'Закуски', tab: 'food', dish_count: 8 },
    { id: 3, label: 'Кебабы', tab: 'food', dish_count: 12 },
    { id: 4, label: 'Напитки', tab: 'beverage', dish_count: 6 },
    { id: 5, label: 'Десерты', tab: 'dessert', dish_count: 9 },
  ],
  dishes: [
    { id: 1, category_id: 1, name_ru: 'Зелёный салат', name_uz: 'Yashil salat', name_en: 'Green salad', name_tr: 'Yeşil salata', description_ru: 'Свежий салат с овощами', description_uz: 'Taza sabzavotli salat', description_en: 'Fresh vegetable salad', description_tr: 'Taze sebzeli salata', price: 25000, status: 'published', is_new: false, is_signature: false, is_vegetarian: true, is_spicy: false, image_url: '' },
    { id: 2, category_id: 2, name_ru: 'Хумус', name_uz: 'Xummus', name_en: 'Hummus', name_tr: 'Humus', description_ru: 'Нутовое пюре с кунжутом', description_uz: 'Noxat pyuresi', description_en: 'Chickpea puree with sesame', description_tr: 'Nohut püresi', price: 30000, status: 'published', is_new: false, is_signature: false, is_vegetarian: true, is_spicy: false, image_url: '' },
    { id: 3, category_id: 3, name_ru: 'Люля-кебаб', name_uz: 'Lyula kebab', name_en: 'Lula kebab', name_tr: 'Lula kebap', description_ru: 'Фарш на гриле со специями', description_uz: 'Qovurilgan go\'shtli', description_en: 'Spiced ground meat kebab', description_tr: 'Baharat ile ızgara köfte', price: 45000, status: 'published', is_new: true, is_signature: true, is_vegetarian: false, is_spicy: true, image_url: '' },
  ],
};

function getMockData() {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(MOCK_STORAGE_KEY) : null;
  return stored ? JSON.parse(stored) : mockData;
}

function saveMockData(data: typeof mockData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
  }
}

export const mockApiClient = {
  // Categories
  async getCategories() {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    const data = getMockData();
    return Array.isArray(data.categories) ? data.categories : [];
  },

  async createCategory(label: string, tab: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getMockData();
    const newId = Math.max(...data.categories.map((c: any) => typeof c.id === 'number' ? c.id : 0), 0) + 1;
    data.categories.push({ id: newId, label, tab, dish_count: 0 });
    saveMockData(data);
    return { id: newId, label, tab, dish_count: 0 };
  },

  async updateCategory(id: string | number, label: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getMockData();
    const cat = data.categories.find((c: any) => c.id === id);
    if (!cat) throw new Error('Category not found');
    cat.label = label;
    saveMockData(data);
    return cat;
  },

  async deleteCategory(id: string | number) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getMockData();
    const index = data.categories.findIndex((c: any) => c.id === id);
    if (index === -1) throw new Error('Category not found');
    data.categories.splice(index, 1);
    saveMockData(data);
    return { id };
  },

  // Dishes
  async getDishes(params?: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getMockData();
    let dishes = Array.isArray(data.dishes) ? data.dishes : [];
    if (params?.category_id) {
      dishes = dishes.filter((d: any) => d.category_id === params.category_id);
    }
    if (params?.status) {
      dishes = dishes.filter((d: any) => d.status === params.status);
    }
    return dishes;
  },

  async createDish(dish: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getMockData();
    data.dishes = Array.isArray(data.dishes) ? data.dishes : [];
    const candidates = ['name_ru', 'name_uz', 'name_en', 'name_tr'];
    const firstName = candidates
      .map((key) => typeof dish?.[key] === 'string' ? dish[key].trim() : '')
      .find((value) => value.length > 0) || '';

    const newId = Math.max(...data.dishes.map((d: any) => typeof d.id === 'number' ? d.id : 0), 0) + 1;
    const newDish = {
      id: newId,
      ...dish,
      name_ru: dish?.name_ru?.trim() ? dish.name_ru.trim() : firstName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    data.dishes.push(newDish);
    saveMockData(data);
    return newDish;
  },

  async updateDish(id: string | number, dish: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getMockData();
    data.dishes = Array.isArray(data.dishes) ? data.dishes : [];
    const index = data.dishes.findIndex((d: any) => d.id === id);
    if (index === -1) throw new Error('Dish not found');
    const candidates = ['name_ru', 'name_uz', 'name_en', 'name_tr'];
    const firstName = candidates
      .map((key) => typeof dish?.[key] === 'string' ? dish[key].trim() : '')
      .find((value) => value.length > 0) || data.dishes[index].name_ru || '';
    data.dishes[index] = {
      ...data.dishes[index],
      ...dish,
      name_ru: dish?.name_ru?.trim() ? dish.name_ru.trim() : firstName,
      updated_at: new Date().toISOString(),
    };
    saveMockData(data);
    return data.dishes[index];
  },

  async deleteDish(id: string | number) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getMockData();
    data.dishes = Array.isArray(data.dishes) ? data.dishes : [];
    const index = data.dishes.findIndex((d: any) => d.id === id);
    if (index === -1) throw new Error('Dish not found');
    data.dishes.splice(index, 1);
    saveMockData(data);
    return { id };
  },

  async bulkUpdateDishStatus(ids: (string | number)[], status: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getMockData();
    data.dishes = Array.isArray(data.dishes) ? data.dishes : [];
    data.dishes = data.dishes.map((d: any) => 
      ids.includes(d.id) ? { ...d, status, updated_at: new Date().toISOString() } : d
    );
    saveMockData(data);
    return { updated: ids.length };
  },
  async getSettings() { return api.getSettings(); },
  async updateSettings(settings: any) { return api.updateSettings(settings); },
};

export default mockApiClient;

import { defineStore } from 'pinia';

export const useCategorieStore = defineStore('categories', {
  state: () => ({
    categories: [],
  }),
  getters: {
    getDescriptions: state => state.categories.flatMap(c => c.description),
  },
  actions: {
    set(input) {
      this.categories = input;
    },
  },
});

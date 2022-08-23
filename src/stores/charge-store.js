import { defineStore } from 'pinia';

export const useChargeStore = defineStore('chaarges', {
  state: () => ({
    charges: [],
  }),
  getters: {
  },
  actions: {
    set(input) {
      this.charges = input;
    },
    addOne(input) {
      this.charges.push(input);
    }
  },
});

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
    },
    remove (id) {
      this.charges = this.charges.filter((charge) => charge.chargeID !== id);
    }
  },
});

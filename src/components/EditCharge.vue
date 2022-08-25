<template>
<q-dialog id="agregar-perfil" v-model="state.promptLocal" persistent>
    <q-card class="regular-form">
        <h5 class="text-primary text-bold q-pb-sm">Editar</h5>

        <q-form @submit.prevent="onSubmit" class="q-gutter-y-md">

            <q-input
                filled
                v-model="state.charge.date"
                type="date"
                label="Fecha"
                maxlength="10" />

            <q-select
                filled
                emit-value
                map-options
                v-model="state.charge.categoryID"
                :options="state.categories"
                label="Categoría" />

            <q-field
                filled
                v-model="state.charge.amount"
                label="Monto"
            >
                <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                    <input :id="id" class="q-field__input text-right" :value="modelValue" @change="e => emitValue(e.target.value)" v-money="vmoneyDirective" v-show="floatingLabel">
                </template>
            </q-field>

            <div class="botones">
                <q-btn
                    flat
                    label="Cancelar"
                    color="primary"
                    v-close-popup
                    @click="close" />
                <q-btn label="Actualizar" type="submit" color="primary" />
            </div>

        </q-form>


    </q-card>
</q-dialog>
</template>

<script>
import { db } from 'boot/firebase';
import { useQuasar } from "quasar";
import { reactive } from "@vue/reactivity";
import { onMounted } from "@vue/runtime-core";
import { VMoney } from 'v-money';
import { useChargeStore } from 'stores/charge-store.js';

export default {
    name: "FormsEditCharge",
    props: {
        chargeID: String
    },
    directives: {
        money: VMoney
    },
    setup(props, context) {
        const $q = useQuasar();
        const chargeID = props.chargeID;
        const chargesStore = useChargeStore();

        const state = reactive({
            promptLocal: true,
            charge: {
                chargeID: "",
                amount: null,
                categoryID: "",
                date: ""
            },
            categories: []
        });

        onMounted(async () => {
            getCategories();

            await db.collection('Charges').doc(chargeID).get()
                .then(response => {
                    state.charge = {
                        chargeID: response.id,
                        amount: response.data().Amount * 100,
                        categoryID: response.data().CategoryID,
                        date: formatter(response.data().Date.seconds * 1000),
                    }
                })
        });

        let getCategories = async () => {
            const response = await db.collection('Categories').get();
            response.forEach(doc => {
                state.categories.push({
                    label: doc.data().Description,
                    value: parseInt(doc.id)
                })
            });
        }

        let formatter = date => {
            let d = new Date(date);
            let month = '' + (d.getMonth() + 1);
            let day = '' + d.getDate();
            let year = d.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return [year, month, day].join('-');
        }

        async function onSubmit() {
            let amount = parseFloat(state.charge.amount.replace('€', '').replace(' EUR', '').replace('.', '').replace(',', '.'));

            await db.collection('Charges').doc(chargeID).update({
                Amount: amount,
                CategoryID: state.charge.categoryID,
                Date: new Date(state.charge.date)
            })
                .then(() => {
                    $q.notify({
                        message: 'Actualizado correctamente',
                        color: 'positive',
                        icon: 'check_circle',
                        position: 'top'
                    });
                    chargesStore.update({...state.charge, amount});
                    context.emit("update", false);
                })
                .catch(() => {
                    $q.notify({
                        message: 'Error al actualizar',
                        color: 'negative',
                        icon: 'error',
                        position: 'top'
                    });
                });

            context.emit("close", true);
        }

        function close() {
            context.emit("close", true);
        }

        return {
            state,
            onSubmit,
            close,
            vmoneyDirective :{
                decimal: ',',
                thousands: '.',
                prefix: '€',
                suffix: ' EUR',
                precision: 2,
                masked: false,
                min: 0.00
            }
        };
    },
};
</script>

<style lang="scss" scoped>
.regular-form {
    background-color: white;
    min-width: 90vw;
    padding: 2rem;
}

.botones{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.7rem;
}
</style>

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
                maxlength="40"
            />

            <q-input
                filled
                v-model="state.charge.categoryID"
                label="Categoria"
                maxlength="40"
            />

            <q-input
                filled
                v-model="state.charge.amount"
                label="Monto"
                maxlength="40"
            />

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

export default {
    name: "FormsEditCharge",
    props: {
        chargeID: String
    },
    setup(props, context) {
        const $q = useQuasar();
        const chargeID = props.chargeID;

        const state = reactive({
            promptLocal: true,
            charge: {
                chargeID: "",
                amount: 0,
                categoryID: "",
                date: ""
            }
        });

        onMounted(async () => {
            await db.collection('Charges').doc(chargeID).get()
                .then(response => {
                    state.charge = {
                        chargeID: response.id,
                        amount: response.data().Amount,
                        categoryID: response.data().CategoryID,
                        date: formatter(response.data().Date.seconds * 1000),
                    }
                })
        });

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

        function onSubmit() {
            context.emit("close", true);
        }

        function close() {
            context.emit("close", true);
        }

        return {
            state,
            onSubmit,
            close
        };
    },
};
</script>

<style lang="scss" scoped>
.regular-form {
    background-color: white;
    gap: 0;
    min-width: 90vw;
    padding: 2rem;
}
</style>

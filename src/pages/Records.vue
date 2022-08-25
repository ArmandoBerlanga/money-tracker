<script setup>
import { db } from 'boot/firebase';
import { ref } from '@vue/reactivity';
import { useChargeStore } from 'stores/charge-store.js';
import { useCategorieStore } from 'stores/categorie-store.js';
import { useQuasar } from 'quasar';
import { onBeforeUnmount } from '@vue/runtime-core';
import EditCharge from 'components/EditCharge.vue';

const $q = useQuasar()
const chargesStore = useChargeStore();
const categoriesStore = useCategorieStore();

const noData = ref(true);
const showEditCharge = ref(false);
const editChargeID = ref("");
const charges = ref([]);
const categories = ref([]);

let getCategories = async () => {

    if(categoriesStore.categories.length != 0){
        categories.value = categoriesStore.categories;
        return;
    }

    await db.collection('Categories').get()
        .then(response => {
            response.forEach(doc => {
                categories.value.push({
                    description: doc.data().Description,
                    categoryID: doc.id
                })
            });

            categoriesStore.set(categories.value);
        })
}

let getCharges = async () => {

    if (chargesStore.charges.length == 0)
        await db.collection('Charges').get()
            .then(response => {
                response.forEach(doc => {
                    charges.value.push({
                        chargeID: doc.id,
                        amount: doc.data().Amount,
                        categoryID: doc.data().CategoryID,
                        date: doc.data().Date.seconds * 1000,
                    })
                });

                chargesStore.set(charges.value);
            });
    else
        charges.value = chargesStore.charges;

    noData.value = charges.value.length == 0;

    charges.value = charges.value.sort((a, b) => {
        return b.date - a.date;
    });
}

let toggleTheme = () => document.body.classList.toggle('body--dark');
let formatter = date => {
    let d = new Date(date).toLocaleString('es-MX', { hour12: false });
    return d.substring(0, d.length - 3).replace(',', '');
}

let formatterM = number => '€' + Number(parseFloat(number).toFixed(2)).toLocaleString("es-ES", {
    minimumFractionDigits: 2
});
let findCategory = id => categories.value.find(category => category.categoryID == id).description;

let timer;
let finalize = (reset) => timer = setTimeout(() => { reset() }, 1);

let onLeft = (reset, chargeID) => {

    $q.dialog({
        title: 'Estas por borrar un cargo',
        message: '¿Estas seguro de borrar este cargo?',
        ok: {
          color: 'primary',
          label: 'Eliminar',
        },
        cancel: {
          color: 'primary',
          label: 'Cancelar',
          flat: true
        },
    })
        .onOk(async () => {
            await db.collection('Charges').doc(chargeID).delete()
                .then(() => {
                    chargesStore.remove(chargeID);
                    charges.value = chargesStore.charges;

                    $q.notify({
                        message: 'Cargo eliminado',
                        color: 'negative',
                        position: 'top',
                        timeout: 2000
                    });

                    noData.value = charges.value.length == 0;
                })
                .catch(() => {
                    $q.notify({
                        message: 'Error al eliminar el cargo',
                        color: 'negative',
                        position: 'top',
                        timeout: 2000
                    });
                });
        });

    finalize(reset);
}

let onRight = (reset, chargeID) => {
    showEditCharge.value = true;
    editChargeID.value = chargeID;
    finalize(reset);
}

let updCharges = () => {
    charges.value = chargesStore.charges;
    noData.value = charges.value.length == 0;
}

onBeforeUnmount(() => {
    clearTimeout(timer)
})

getCategories();
getCharges();
</script>

<template>
<q-page class="q-ma-sm q-my-md q-gutter-y-sm">

    <div class="title container">
        <h5 class="text-primary text-bold">Historial de cargos</h5>
    </div>

    <div class="records container" v-if="!noData">
        <div class="titles">
            <div class="text-left">Fecha</div>
            <div class="text-center">Categoría</div>
            <div class="text-right">Monto</div>
        </div>

        <q-scroll-area style="height:80vh;">
            <q-list>
                <q-slide-item class="record"
                    v-for="(charge, index) in charges" :key="index"
                    left-color="negative" right-color="positive"
                    @left="({reset}) => onLeft(reset, charge.chargeID)" @right="({reset}) => onRight(reset, charge.chargeID)"
                >
                    <template v-slot:left>
                        <q-icon name="delete" />
                    </template>
                    <template v-slot:right>
                        <q-icon name="edit" />
                    </template>

                    <q-item class="info">
                        <div class="text-left">{{ formatter(charge.date) }}</div>
                        <div class="text-center">{{ findCategory(charge.categoryID) }}</div>
                        <div class="text-right">{{ formatterM(charge.amount) }}</div>
                    </q-item>
                </q-slide-item>
            </q-list>
        </q-scroll-area>
    </div>

    <div class="no-data container flex flex-center column q-gutter-y-sm prevent-selection" v-if="noData">
        <q-icon name="sentiment_dissatisfied" size="4rem" color="primary"/>
        <h5 class="text-primary q-pb-md">No has registrado ningun gasto</h5>
    </div>

    <EditCharge v-if="showEditCharge" :chargeID="editChargeID" @close="showEditCharge = false" @update="updCharges"/>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-fab color="primary" icon="keyboard_arrow_up" direction="up">
            <q-fab-action color="grey" to="/" icon="home" />
            <q-fab-action color="grey" @click="toggleTheme" icon="dark_mode" />
        </q-fab>
    </q-page-sticky>
</q-page>
</template>

<style lang="scss" scoped>
.q-item{
    padding: 0 1.5rem;
}

.records{
    .titles{
        display: grid;
        grid-template-columns: 1fr 0.9fr 0.8fr;
        font-weight: bold;
        background-color: #4A7C59;
        color: white;
        padding: 0.5rem 1.5rem;
        border-radius: 5px 5px 0 0;
    }
    .record {
        border-bottom: 1px solid #4a7c592b;
        .info{
            display: grid;
            grid-template-columns: 1fr 0.9fr 0.8fr;
            align-items: center;
        }

        &:last-child{
            border-radius: 0 0 5px 5px;
        }
    }
}
</style>

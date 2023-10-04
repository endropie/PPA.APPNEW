<template>
<q-page padding class="form-page row justify-center">
  <q-card v-if="FORM.show" class="main-box self-start" :dark="LAYOUT.isDark">
    <q-card-section>
      <form-header :title="FORM.title()" :subtitle="FORM.subtitle()">
        <template slot="menu-item">
          <list-item :label="$tc('form.remove')" icon="delete" clickable @click="FORM.delete" v-close-popup v-if="ROUTE.params.id"/>
        </template>
      </form-header>
    </q-card-section>
    <q-card-section>
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6">
          <div class="row q-col-gutter-sm">
            <q-input class="col-12"
              name="code"
              :label="$tc('label.code')"
              v-model="rsForm.code" disable
              v-validate="''"
              :dark="LAYOUT.isDark"
              :error="errors.has('code')"
              :error-message="errors.first('code')"
              />

            <q-input class="col-12"
              name="name"
              :label="$tc('label.name')"
              v-model="rsForm.name"
              v-validate="'required'"
              :dark="LAYOUT.isDark"
              :error="errors.has('name')"
              :error-message="errors.first('name')"/>
          </div>

        </div>
        <div class="col-12 col-sm-6">
          <div class="row q-col-gutter-sm">
            <q-input class="col-12 col-sm-6"
              name="salt_white" type="number"
              :label="$tc('items.white_spray')"
              :hint="$tc('label.unit', 1, {v:$tc('label.second', 2)})"
              v-model="rsForm.salt_white"
              v-validate="'required'"
              :dark="LAYOUT.isDark"
              :error="errors.has('salt_white')"
              :error-message="errors.first('salt_white')"/>

            <q-input class="col-12 col-sm-6"
              name="salt_red" type="number"
              :label="$tc('items.red_spray')"
              :hint="$tc('label.unit', 1, {v:$tc('label.second', 2)})"
              v-model="rsForm.salt_red"
              v-validate="'required'"
              :dark="LAYOUT.isDark"
              :error="errors.has('salt_red')"
              :error-message="errors.first('salt_red')"/>

            <q-select class="col-12 "
              name="color_id"
              :label="$tc('label.color')"
              v-model="rsForm.color_id"
              v-validate="'required'" :dark="LAYOUT.isDark"
              :options="ColorOptions"
              map-options emit-value
              :error="errors.has('color_id')"
              :error-message="errors.first('color_id')" />
          </div>
        </div>

        <!-- PLATING DETAIL -->
        <form-detail class="col-12" :list="$q.screen.lt.md"
          :title="$tc('label.detail', 1, {v: $tc('items.specification')})"
          :columns="[
            {name:'thick', label: 'Label Thick'},
            {name:'plate', label: 'Label Plate'},
          ]"
          :data="rsForm.specification_details"
          :label-new="$tc('form.new', {v:$tc('items.specification')})"
          :new-data="{id: null, plate:null, thick:null }"
          :dark="LAYOUT.isDark"
          min-length="-1">

          <template v-slot:field-thick="rs">
            <q-input  class="col-12 col-sm-3"
            :name="`specification_details.${rs.row.__index}.thick`"
            :label="$tc('items.thick',2)"
            type="number"
            v-model="rs.row.thick"
            v-validate="''"
            filled dense hide-bottom-space
            :dark="LAYOUT.isDark"
            :error="errors.has(`specification_details.${rs.row.__index}.thick`)"
            :error-message="errors.first(`specification_details.${rs.row.__index}.thick`)">
            </q-input>

          </template>
          <template v-slot:field-plate="rs" >
            <q-input class="col-12 col-sm-9"
              :name="`specification_details.${rs.row.__index}.plate`"
              :label="$tc('label.name', 3, {v:$tc('items.plate')})"
              v-model="rs.row.plate"
              filled dense hide-bottom-space
              :dark="LAYOUT.isDark"
              :error="errors.has(`specification_details.${rs.row.__index}.plate`)"
              :error-message="errors.first(`specification_details.${rs.row.__index}.plate`)" >


            </q-input>
          </template>


        </form-detail>

        <q-input class="col-12 q-mb-md"
          :label="$tc('label.description')" stack-label
          v-model="rsForm.description"
          type="textarea" rows="3"
          filled dense
          :dark="LAYOUT.isDark"/>


      </div>
    </q-card-section>
    <q-separator :dark="LAYOUT.isDark" />
    <q-card-actions class="group float-right">
      <q-btn :label="$tc('form.cancel')" icon="cancel" color="dark" @click="FORM.toBack()"></q-btn>
      <q-btn :label="$tc('form.reset')" icon="refresh" color="light" @click="FORM.reset()"></q-btn>
      <q-btn :label="$tc('form.save')" icon="save" color="positive" @click="onSave()"></q-btn>
    </q-card-actions>
  </q-card>
  <q-inner-loading :showing="FORM.loading" :dark="LAYOUT.isDark"><q-spinner-dots size="70px" color="primary" /></q-inner-loading>
</q-page>
</template>

<script>
import MixForm from 'src/mixins/mix-form.vue'

export default {
  mixins: [MixForm],
  data () {
    return {
      test: null,
      selected:[],
      SHEET:{
        colors: {data:[], api:'/api/v1/references/colors?mode=all'},
      },
      FORM:{
        resource:{
          uri: '/admin/references/specifications',
          api: '/api/v1/references/specifications',
        },
      },
      rsForm:{},
      setDefault:()=>{
        return {
          name:null,
          description:null,
          color_id:null,
          salt_white:null,
          salt_red:null,


          specification_details:[ {id:null} ],

          thick_1:null, plate_1:null,
          thick_2:null, plate_2:null,
          thick_3:null, plate_3:null,
          thick_4:null, plate_4:null,
        }
      }
    }
  },
  created(){
    // Component Page Mounted!
    this.init()
    // this.$validator.validate()
  },
  computed:{
    ColorOptions() {
      return (this.SHEET.colors.data.map(item => ({label: item.name, value: item.id})) || [])
    }
  },
  watch:{
    '$route' : 'init',
  },
  methods: {
    init() {
      this.FORM.load((data) => {
        this.setForm(data || this.setDefault())
      })
    },
    setForm(data) {
      this.rsForm = JSON.parse(JSON.stringify(data))
    },

    addNewDetail () {
      const newEntri = {id:null};
      this.rsForm.specification_details.push(newEntri)
    },

    removeDetail (index) {
      this.rsForm.specification_details.splice(index, 1)
      // if(this.rsForm.specification_details.length < 1) this.addNewDetail()
    },

    onSave() {

      this.$validator.validate().then(result => {
        if (!result) {
          this.$q.notify({
            color:'negative', icon:'error', position:'top-right', timeout: 3000,
            message:this.$tc('messages.to_complete_form')
          });

          return;
        }
        this.FORM.loading = true
        let {method, mode, apiUrl} = this.FORM.meta();
        this.$axios.set(method, apiUrl, this.rsForm)
        .then((response) => {
          let message = response.data.name + ' - #' + response.data.id
          this.FORM.response.success({message:message})
          this.FORM.toIndex()
        })
        .catch((error) => {

          this.FORM.response.fields(error.response)
          this.FORM.response.error(error.response || error, 'Submit')
        })
        .finally(()=>{
          this.FORM.loading = false
        });

      });
    },
  },
}
</script>

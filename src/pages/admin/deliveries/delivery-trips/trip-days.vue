<template>
  <q-page padding class="page-index">
    <q-pull-to-refresh @refresh="LIST.load">
      <q-card>
        <q-card-section>
          <div class="row q-col-gutter-xs">
            <ux-date
              v-model.lazy="LIST.filter.trip_date"
              dense hide-bottom-space hide-dropdown-icon
              standout="bg-blue-grey-5 text-white"
              :debounce="3000"
            />
            <ux-select
              v-model="LIST.filter.customer_id" clearable
              :label="$tc('general.customer')"
              dense hide-bottom-space hide-dropdown-icon
              standout="bg-blue-grey-5 text-white"
              filter map-options emit-value
              source="/api/v1/incomes/customers?mode=all&--limit=10"
              option-value = 'id'
              option-label = 'name'
            />
            <div class="">
              <q-btn color="primary" icon="search" @click="LIST.load" />
            </div>
            <q-space />
            <q-toggle left-label v-model="isFullTime" label="FULL TIME" />
          </div>
        </q-card-section>
        <q-markup-table dense flat bordered separator="cell"
          class="table-sticky-header table-sticky-column"
          style="height: calc(100vh - 150px)"
        >
          <thead>
            <tr class="head-column">
              <th class="text-left">
                <div class=" q-py-xs">CUST</div>
              </th>
              <template v-for="(cTime, iTime) in time24">
                <th :key="iTime" :row-time-code="cTime" v-show="!HIDE_TIME[iTime]" class="q-py-md">
                  {{cTime}}
                </th>
              </template>
            </tr>
          </thead>
          <tbody v-if="isFullTime">
            <tr v-for="(cust, index) in CUSTOMERS" :key="index">
              <td class="text-left">
                <div class=" q-py-xs">{{cust.code}}</div>
              </td>
              <template v-for="(cTime, iTime) in time24">
                <td :key="iTime" :row-time-value="cTime" v-show="!HIDE_TIME[iTime]"
                  :class="{
                    'bg-grey-4': !isTriped(cust, cTime)
                  }"
                  class="no-padding" align="center"
                >
                  <div v-if="TASKS[cust.id] && TASKS[cust.id][cTime]">
                    <q-icon size="20px"
                      :name="getMiniBoxIcon(TASKS[cust.id], cTime)"
                      :color="getMiniBoxColor(TASKS, cust, cTime)"
                    />
                  </div>
                  <div v-else-if="LOADS[cust.id] && LOADS[cust.id][cTime]">
                    <q-icon size="20px"
                      :name="getLoadMiniBoxIcon(LOADS[cust.id], cTime)"
                      :color="getLoadMiniBoxColor(LOADS, cust, cTime)"
                    />
                  </div>
                </td>
              </template>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-for="(cust, index) in CUSTOMERS" :key="index">
              <td class="text-left q-pa-none">
                <div class=" q-py-xs">{{cust.code}}</div>
              </td>
              <template v-for="(cTime, iTime) in time24">
                <td :key="iTime" :row-time-value="cTime"
                  v-show="!HIDE_TIME[iTime]"
                  class="q-py-sm" style="min-width:180px"
                  :class="{
                    'bg-grey-10 text-white': $q.dark.isActive && !isTriped(cust, cTime),
                    'bg-grey-4 text-white': !$q.dark.isActive && !isTriped(cust, cTime),
                  }"
                >
                  <div class="self-start column q-gutter-xs" v-if="TASKS[cust.id] && TASKS[cust.id][cTime]" >
                    <q-btn v-for="(task, iTask) in TASKS[cust.id][cTime]" :key="iTask" v-show="iTask < 2 || TASKS[cust.id][cTime].length === 3"
                      dense unelevated size="12px"
                      :color="getBoxColor(task)"
                      :text-color="$q.dark.isActive ? 'white' : undefined"
                      :icon="getBoxIcon(task)"
                      :outline="!isTriped(cust, cTime)"
                      :label="task.fullnumber"
                      @click="setBoxlink(task)"
                    />
                    <q-btn dense outline color="blue-grey" size="12px"
                      :label="`${TASKS[cust.id][cTime].length - 2}+`"
                      v-if="TASKS[cust.id][cTime].length > 3"
                    >
                      <q-menu>
                        <q-list dense bordered>
                          <q-item v-for="(task, iTask) in TASKS[cust.id][cTime]" :key="iTask" v-show="iTask > 1"
                            clickable v-ripple
                            @click="setBoxlink(task)"
                          >
                            <q-item-section avatar>
                              <q-icon :name="getBoxIcon(task)" :color="getBoxColor(task)" />
                            </q-item-section>
                            <q-item-section :class="`text-${getBoxColor(task)}`" >{{task.fullnumber}}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                  <div class="self-start column q-gutter-xs" v-else-if="LOADS[cust.id] && LOADS[cust.id][cTime]" >
                    <q-btn v-for="(load, iLoad) in LOADS[cust.id][cTime]" :key="iLoad" v-show="iLoad < 2 || LOADS[cust.id][cTime].length === 3"
                      dense unelevated size="12px"
                      :color="getLoadBoxColor(load)"
                      :text-color="$q.dark.isActive ? 'white' : undefined"
                      :icon="getLoadBoxIcon(load)"
                      :outline="!isTriped(cust, cTime)"
                      :label="load.fullnumber"
                      @click="setLoadBoxlink(load)"
                    />
                    <q-btn dense outline color="blue-grey" size="12px"
                      :label="`${LOADS[cust.id][cTime].length - 2}+`"
                      v-if="LOADS[cust.id][cTime].length > 3"
                    >
                      <q-menu>
                        <q-list dense bordered>
                          <q-item v-for="(load, iLoad) in LOADS[cust.id][cTime]" :key="iLoad" v-show="iLoad > 1"
                            clickable v-ripple
                            @click="setLoadBoxlink(load)"
                          >
                            <q-item-section avatar>
                              <q-icon :name="getLoadBoxIcon(load)" :color="getLoadBoxColor(load)" />
                            </q-item-section>
                            <q-item-section :class="`text-${getLoadBoxColor(load)}`" >{{load.fullnumber}}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                  <div class="self-start column q-gutter-xs" v-else-if="isTriped(cust, cTime)">
                    <q-icon name="warning" color="orange" class="self-center" size="15px">
                      <q-tooltip>PDO undefined</q-tooltip>
                    </q-icon>
                  </div>
                </td>
              </template>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      time24: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
      isFullTime: true,
      SHEET: {
        customers: { data: [], api: '/api/v1/incomes/customers?mode=all' }
      },
      LIST: {
        mode: 'index',
        date: this.$app.moment().format('YYYY-MM-DD'),
        resource: {
          api: '/api/v1/incomes/customers',
          uri: '/admin/deliveries/delivery-trips',
          delivery_task: '/api/v1/incomes/delivery-tasks',
          delivery_load: '/api/v1/incomes/delivery-loads'
        },
        rowdata: [],
        rowtask: [],
        rowload: [],
        filter: {
          customer_id: null,
          trip_date: this.$app.moment().format('YYYY-MM-DD')
        },
        load: this.load
      }
    }
  },
  created () {
    this.load()
  },
  computed: {
    TASKS () {
      const result = { CUSTOMER: {} }
      const exTask = this.LIST.rowtask
      exTask.map((item, i) => {
        const timecode = String(item.trip_time).substring(0, 2)
        if (!result[item.customer_id]) result[item.customer_id] = {}
        if (!result[item.customer_id][timecode]) result[item.customer_id][timecode] = []
        result[item.customer_id][timecode].push(item)
      })
      return result
    },
    LOADS () {
      const result = { CUSTOMER: {} }
      const exLoad = this.LIST.rowload
      exLoad.map((item, i) => {
        const timecode = String(item.trip_time).substring(0, 2)
        if (!result[item.customer_id]) result[item.customer_id] = {}
        if (!result[item.customer_id][timecode]) result[item.customer_id][timecode] = []
        result[item.customer_id][timecode].push(item)
      })

      return result
    },
    CUSTOMERS () {
      let result = []
      this.LIST.rowdata.map(item => {
        if (!result.find(x => x.id === item.id)) result.push(item)
      })
      this.LIST.rowtask.map(item => {
        if (!result.find(x => x.id === item.customer_id)) result.push(item.customer)
      })
      return result
    },
    EXDATA () {
      const result = { CUSTOMER: {}, TASK: {} }
      const ex = this.LIST.rowtask.filter(x => !this.LIST.rowdata.find(cust => cust.id === x.customer_id))
      ex.map((item, i) => {
        if (!result.CUSTOMER[item.customer_id]) result.CUSTOMER[item.customer_id] = item.customer
        if (!result.TASK[item.customer_id]) result.TASK[item.customer_id] = {}
        if (!result.TASK[item.customer_id][String(item.trip_time).substring(0, 2)]) result.TASK[item.customer_id][String(item.trip_time).substring(0, 2)] = []
        result.TASK[item.customer_id][String(item.trip_time).substring(0, 2)].push(item)
      })
      return result
    },
    TASK_TIME () {
      return this.time24.map(time => {
        const tasks = this.LIST.rowtask.filter(task => String(task.trip_time).substring(0, 2) === time)

        if (tasks.length) return tasks
        return this.LIST.rowload.filter(load => String(load.trip_time).substring(0, 2) === time)
      })
    },
    HIDE_TIME () {
      return this.time24.map((time, i) => {
        if (this.isFullTime) return false
        if (this.TASK_TIME && this.TASK_TIME[i].length) return false
        return Boolean(!this.LIST.rowdata.find(cust => {
          return this.getCustomerTrips(cust).find(x => x.intday === this.INTDAY && String(x.time).substring(0, 2) === time)
        }))
      })
    },
    INTDAY () {
      if (this.LIST.date) {
        return this.$app.moment(this.LIST.date).day()
      }
      return undefined
    },
    FUTURED () {
      return !this.$app.moment(this.$app.moment().format('YYYY-MM-DD')).isAfter(this.LIST.date)
    },
    isCanPush () {
      return this.$app.can('items-push')
    },
    isCanUpdate () {
      return this.$app.can('items-update')
    },
    isCanDelete () {
      return this.$app.can('items-delete')
    }
  },
  methods: {
    getCustomerTrips (cust) {
      return cust[this.FUTURED ? 'customer_trips' : 'date_trips'] || []
    },
    getBoxIcon (task) {
      if (task.is_checkout) return 'local_shipping'
      if (task.is_loaded) return 'move_to_inbox'
      return 'bookmark'
    },
    getLoadBoxIcon (load) {
      if (load.is_checkout) return 'local_shipping'
      return 'move_to_inbox'
    },
    getLoadBoxColor (load) {
      if (load.is_checkout) return 'green-10'
      return 'indigo'
    },
    getBoxColor (task) {
      if (task.is_checkout) return 'green-10'
      if (task.is_loaded) return 'indigo'
      return 'blue-grey'
    },
    getLoadMiniBoxIcon (loadtime, time) {
      if (!loadtime[time]) return 'clear'
      const trips = loadtime[time]
      if (trips.find(x => x.is_checkout)) return 'local_shipping'
      return 'move_to_inbox'
    },
    getMiniBoxIcon (tasktime, time) {
      if (!tasktime[time]) return 'clear'
      const trips = tasktime[time]
      if (trips.find(x => x.is_checkout)) return 'local_shipping'
      if (trips.find(x => x.is_loaded)) return 'move_to_inbox'
      if (trips.length) return 'bookmark'
      return 'clear'
    },
    getLoadMiniBoxColor (load, cust, time) {
      if (!load[cust.id] || !load[cust.id][time]) return
      const trips = load[cust.id][time]
      if (trips.find(x => x.is_checkout)) return 'green-10'
      return 'blue-8'
    },
    getMiniBoxColor (task, cust, time) {
      if (!task[cust.id] || !task[cust.id][time]) return
      const trips = task[cust.id][time]
      if (trips.find(x => x.is_checkout)) return 'green-10'
      if (trips.find(x => x.is_loaded)) return 'blue-8'
      return 'blue-grey'
    },
    getMiniBoxClass (task, cust, time) {
      if (!task[cust.id] || !task[cust.id][time]) return ''
      const trips = task[cust.id][time]
      const background = Boolean(this.getCustomerTrips(cust).find(x => String(x.time).substring(0, 2) === time))

      if (trips.find(x => x.is_checkout)) return `${background ? 'bg-green-10 text-white' : 'bg-grey-4 text-green-10'}`
      if (trips.find(x => x.is_loaded)) return `${background ? 'bg-blue-8 text-white' : 'bg-grey-4 text-blue-8'}`
      return `${background ? 'bg-blue-grey text-white' : 'bg-grey-4 text-blue-grey'}`
    },
    isTriped (cust, time) {
      if (!this.getCustomerTrips(cust)) return false
      return this.getCustomerTrips(cust).find(x => String(x.time).substring(0, 2) === time && x.intday === this.INTDAY)
    },
    setLoadBoxlink (load) {
      this.$router.push(`/admin/deliveries/delivery-loads/${load.id}`)
    },
    setBoxlink (task) {
      this.$router.push(`/admin/deliveries/delivery-tasks/${task.id}`)
    },
    getTasks () {
      let customer = this.LIST.filter.customer_id ? `&customer_id=${this.LIST.filter.customer_id}` : ''
      let url = `${this.LIST.resource.delivery_task}?mode=all&sort=created_at&--with=customer&date=${this.LIST.date}${customer}`

      this.$axios.get(url)
        .then((response) => {
          this.LIST.rowtask = response.data
        }).catch((error) => {
          this.$app.response.error(error.response || error)
        }).finally(() => {
          // code..
        })
    },
    getLoads () {
      let customer = this.LIST.filter.customer_id ? `&customer_id=${this.LIST.filter.customer_id}` : ''
      let url = `${this.LIST.resource.delivery_load}?mode=all&sort=created_at&--with=customer&date=${this.LIST.filter.trip_date}${customer}`

      this.$axios.get(url)
        .then((response) => {
          this.LIST.rowload = response.data
        }).catch((error) => {
          this.$app.response.error(error.response || error)
        }).finally(() => {
          // code..
        })
    },
    getTrip (done = null) {
      const parameters = [
        `id=${this.LIST.filter.customer_id || ''}`,
        `trip_date=${this.LIST.filter.trip_date}`,
        `trip_futured=${this.FUTURED ? 1 : ''}`
      ]

      let url = `${this.LIST.resource.api}?mode=all&--with=customer_trips&--appends=date_trips&${parameters.join('&')}`
      this.$q.loading.show()
      this.$axios.get(url)
        .then((response) => {
          this.LIST.rowdata = response.data
        }).catch((error) => {
          this.$app.response.error(error.response || error)
        }).finally(() => {
          if (done && typeof done === 'function') done()
          this.$q.loading.hide()
        })
    },
    load (done = null) {
      if (!this.LIST.filter.trip_date) return this.$q.notify({ message: 'DATE REQUIRED!' })
      this.LIST.date = this.LIST.filter.trip_date
      this.getTasks()
      this.getLoads()
      this.getTrip(done)
    }
  }
}
</script>
<style lang="stylus">
tr.head-column th
  border-top-width: 3px !important;
  border-top-style: double;
  border-bottom-width: 3px !important;
  border-bottom-style: double;
// .table-index
//   tr.top-row, tr.top-header
//     height unset !important

// tr.top-row th
//   padding: 2px 5px
//   border-bottom-width: thin
</style>

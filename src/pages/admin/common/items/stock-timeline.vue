<template>
  <q-timeline color="primary" layout="loose">
    {{TIMELINE}}
    <q-btn label="test" @click="[timeline['2019-09'] = {}, timeline['2019-09']['2019-09-10'] = [6,9,34,7], timeline['2019-09']['2019-09-08'] = [1,2,3,1],]" />
    <!-- {{Object.keys(timeline)}} -->
    <div  v-for="(month, mkey) in Object.keys(timeline)" :key="mkey">
      <q-timeline-entry heading>
        Timeline [{{month}}]
      </q-timeline-entry>
      <q-timeline-entry  v-for="(date, dkey) in Object.keys(timeline[month])" :key="dkey"
        :subtitle="$app.moment(date).format('DD MMM YYYY')" class="q-gutter-y-xs">
         <div class="column q-gutter-sm">
          {{timeline[month][date]}}
        </div>
      </q-timeline-entry>
    </div>
    <!-- <q-timeline-entry subtitle="February 22, 2019" class="q-gutter-y-xs">
      <div class="column q-gutter-sm">
        <div class="text-uppercase text-weight-bold">
          <q-badge color="positive">WO <q-icon name="arrow_upward" class="q-ml-xs"/></q-badge>
           {{$app.number_format(17)}}
          <q-btn class="on-right" flat dense color="light" label="ING/2019/00001"/>

        </div>
        <div class="text-uppercase text-weight-bold">
          <q-badge color="negative">FM <q-icon name="arrow_downward" class="q-ml-xs"/></q-badge>
          {{$app.number_format(17)}}
        </div>
      </div>
    </q-timeline-entry>

    <q-timeline-entry subtitle="February 21, 2019">
      <div class="text-uppercase text-weight-bold">
        <q-badge color="negative">FM <q-icon name="arrow_downward" class="q-ml-xs"/></q-badge>
        {{$app.number_format(30)}}
      </div>
    </q-timeline-entry>

    <q-timeline-entry heading>
      November, 2017
    </q-timeline-entry>

    <q-timeline-entry subtitle="January 31, 2019">
      <div class="text-uppercase text-weight-bold">
        <q-badge color="positive"><q-icon name="arrow_upward"/></q-badge>
        WO {{$app.number_format(17)}}
      </div>
      <div class="text-uppercase text-weight-bold">
        <q-badge color="negative"><q-icon name="arrow_downward"/></q-badge>
        FM {{$app.number_format(17)}}
      </div>
    </q-timeline-entry>

    <q-timeline-entry subtitle="January 29, 2019">
      <div class="text-uppercase text-weight-bold">
        <q-badge color="positive"><q-icon name="arrow_upward"/></q-badge>
        FM {{$app.number_format(70)}}
      </div>
    </q-timeline-entry>


    <q-timeline-entry subtitle="January 29, 2019">
      <div class="text-uppercase text-weight-bold">
        <q-badge color="positive"><q-icon name="arrow_upward"/></q-badge>
        FM {{$app.number_format(15)}}
      </div>
    </q-timeline-entry>
    -->
  </q-timeline>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: null,
    }
  },
  data () {
    return {
      histories: [],
      timeline: {},
      length: 0,
    }
  },
  created () {
    this.$nextTick(() => {
      this.load ()
    })
  },
  computed: {
    MONTH () {
      const timeline = this.timeline  || {}
      return Object.keys(timeline)
    },
    TIMELINE () {
      const timeline = this.timeline || {}

      if (!Object.keys(timeline).length) return []
      return Object.keys(timeline)
      .map(month => ({
        date: month,
        data: Object.keys(timeline[month]).map(date => ({
          date: date,
          data: timeline[month][date]
        }))
      }))
    }
  },
  methods: {
    load () {
      let params = []
      params.push('mode=stockables')
      params.push(`id=${this.item.id}`)
      this.$axios.get('api/v1/common/items?'+params.join('&'))
      .then(response => {
        this.increase(response.data)
      })
      .catch(error => {
        console.error(error.response || error)

      })
    },
    increase (data) {
      for (let i = 0; i < data.length; i++) {
        const element = data[i]
        const m =  String(element.created_at).substr(0, 7)
        const d =  String(element.created_at).substr(0, 10)
        // this.histories.push(element.id)
        if (!this.timeline[m]) this.timeline[m] = Object.assign({})
        if (!this.timeline[m][d]) this.timeline[m][d] = []
        if (!this.timeline[m][d].find(x => x.id === element.id)) {
          this.timeline[m][d].push(element);
        }
      }

    }
  }
}
</script>

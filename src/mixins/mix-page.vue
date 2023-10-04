<script>
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      // code...
    }
  },
  created () {
    // console.info('[PLAY] MIX-PAGE is Created!')
  },
  computed: {
    title() {
      return this.$route.meta.title || ''
    },
    SIDETAB: {
      get () {
        return this.$store.state.admin.PAGE.sideTab
      },
      set (val) {
        this.$store.commit('admin/SetSideTab', val)

      }
    },
    LEFTDRAWER: {
      get () {
        return this.$store.state.admin.PAGE.leftDrawer
      },
      set (val) {
        this.$store.commit('admin/SetLeftDrawer', val)
      }
    },
    RIGHTDRAWER: {
      get () {
        return this.$store.state.admin.PAGE.rightDrawer
      },
      set (val) {
        this.$store.commit('admin/SetRightDrawer', val)
      }
    },
    SHOW: {
      get () {
        // console.warn('GET SHOW ->')
        return this.$store.state.admin.PAGE.show
      },
      set (val) {
        this.$store.commit('admin/setPageShow', val)
      }
    },
    ...mapGetters('admin', ['LAYOUT', 'CONFIG', 'SETTING'])
  },
  methods: {
    directToAdmin () {
      setTimeout(() => {
        this.$router.push('/admin')
      }, 100)
    },
    directToLogin () {
      setTimeout(() => {
        this.$router.push('/auth')
      }, 100)
    }
  }
}
</script>

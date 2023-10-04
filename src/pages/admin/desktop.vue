<template>
  <q-page padding class="page-admin">
    <div class="admin-top text-center">
      <p class="caption">
       <!-- No caption -->
      </p>
    </div>
    <div class="row justify-center">
      <div style="width: 850px; max-width: 90vw;" class="row">
        <template v-for="(page, index) in menus" >
        <div class="col-xs-6 col-sm-4 col-lg-3" :key="index"
          v-if="isVisible(page)"
        >
          <div class="card text-center menu-link text-primary" @click="show(page)">
            <!-- {{page}} -->
            <q-icon :name="page.icon ? page.icon : `star`" />
            <p class="caption" :class="{'text-blue-grey-4 text-bold': LAYOUT.isDark}">{{ page.name }}</p>
          </div>
        </div>
        </template>
      </div>
    </div>
    <q-page-sticky v-show="page" position="bottom-right" :offset="[18, 18]">
      <q-btn round color="secondary" @click="page = false" class="animate-pop">
        <q-icon name="keyboard_backspace" />
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
import MixPage from 'src/mixins/mix-page.vue'
import AdminMenus from 'assets/data-menu'

export default {
  mixins:[MixPage],
  data () {
    return {
      page: false,
      path: '',
      nodes: Object.assign({})
    }
  },
  created() {
    for (let i = 0; i < AdminMenus.length; i++) {
      this.loopMenu(AdminMenus[i], '/admin')
    }
  },
  computed: {
    menus () {
      return this.page || AdminMenus
    }
  },
  methods: {
    loopMenu(arrMenu = {}, parentfix = '') {
      const prefix = `${parentfix}/${arrMenu.path}`
      if(!this.nodes.hasOwnProperty(prefix)) this.nodes[prefix] = {}


      if(arrMenu.hasOwnProperty('children') && arrMenu.children.length) {
        this.nodes[prefix].validChilds = []
        for (let i = 0; i < arrMenu.children.length; i++) {
          this.loopMenu(arrMenu.children[i], prefix)
        }
      }
      else {
        const menu = this.$router.resolve({
          path: prefix,
        })

        const isValid = this.$app.can(menu.route.meta.permission)
        if(isValid) {
          this.nodes[prefix].valid = true
          this.setValidParent(parentfix)
        }
        else {
          this.nodes[prefix].valid = false
        }
      }

      this.nodes[arrMenu.path] = {
        ...this.nodes[arrMenu.path]

      }
    },
    setValidParent(path) {
      let hash = path
      let arrHash = path.split('/')

      for (let i = 0; i < arrHash.length; i++) {
        if(this.nodes.hasOwnProperty(hash)) {
          this.nodes[hash].validChilds.push(path)
          this.nodes[hash].valid = true
        }
        if(arrHash.hasOwnProperty(arrHash.length-i)) {
          arrHash = arrHash.slice(arrHash.length-1)
          hash = '/'+arrHash.join('/')
        }


      }
    },
    isVisible(node) {
      if(node.hide) return false

      let link = `/admin`
      link += node.prefix ? `/${node.prefix}/${node.path}` : `/${node.path}`

      if(link === this.$route.fullPath) return false

      if(this.nodes.hasOwnProperty(link) && this.nodes[link].valid) {
        return true
      }

      return false
    },
    show (link) {
      if (link.children) {
        this.page = link.children.map((item) => {
          item.prefix = link.prefix ?  link.prefix + '/' + link.path : link.path
          return item
        })
        return
      }
      this.$router.push(`/admin/` + (link.prefix ? link.prefix + '/' + link.path : link.path) )
    }
  }
}
</script>

<style lang="stylus">

.page-admin
  img
    width 100px
    height 100px
    margin-bottom 15px
  .admin-top
    margin-bottom 35px
    .q-alert
      max-width 500px
  .card
    cursor pointer
    position relative
    padding 16px
    .q-icon
      font-size 56px
    p
      color rgba(0, 0, 0, .87)
      margin 15px 0 0 0 !important
    &:before
      content ''
      position absolute
      top 0
      right 0
      bottom 0
      left 0
      border-radius 2px
      opacity 0
      transition opacity .2s
      background currentColor
    &:hover:before
      opacity .4
</style>

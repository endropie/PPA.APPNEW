
<script>
import MenuParent from 'components/MenuParent.vue'
import MenuChild from 'components/MenuChild.vue'

export default {
  functional: true,
  render (createElement, context) {
    const first = createElement(MenuChild, { props: context.props })
    const second = createElement(MenuParent, { props: context.props })
    return [first, second]
  },
  name: 'admin-menu-item',
  props: {
    dark: { type: Boolean, default: false },
    node: Object,
    prefix: { type: String, default: '' },
    isIndent: { type: Boolean, default: false },
    isChildren: { type: Boolean, default: false },
    countChild: { type: Boolean, default: false }
  },
}
</script>

<style lang="stylus">

.menu
  .q-expansion-item
    .q-expansion-item__content .q-item
      min-height 36px

  .q-item__section--avatar
    min-width: 38px;

  .q-expansion-item--expanded > div > .q-item > .q-item__section--main

  .q-item.q-router-link--active
    font-weight 500

  .q-item.q-router-link--active
    // background lighten($primary, 90%)

</style>

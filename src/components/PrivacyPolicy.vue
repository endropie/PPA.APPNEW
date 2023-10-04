<template>
  <q-dialog v-model="opened" >
    <!-- :content-css="{maxWidth: '80vw', maxHeight: '80vh'}" -->
    <q-layout class="bg-white" container  :class="'scroll'">
      <q-header class="bg-primary">
        <q-toolbar>
          <q-avatar>
            <q-icon name="widgets" size="lg" />
          </q-avatar>

          <q-toolbar-title><span class="text-weight-bold">MANUFACTURE PLAY</span> Privacy Policy</q-toolbar-title>

          <q-btn flat round dense icon="close" v-close-popup />

        </q-toolbar>
      </q-header>

      <!-- <q-footer class="bg-black text-white">
        <q-toolbar inset>
          <q-toolbar-title>Footer</q-toolbar-title>
        </q-toolbar>
      </q-footer> -->

      <q-page-container >
        <q-page padding >
          <q-scroll-area
            class="text-faded"
            style="height: calc(80vh - 20px) "
          >
            <div>

                <p>
                  We value your privacy, and our Privacy Policy aims to explain how your privacy is
                  protected while using the MANUFACTURE PLAY app.
                </p>

                <p class="caption">What personal information is collected from people using MANUFACTURE PLAY?</p>
                <p>
                  None, period. We don't collect, transmit or store any personal information or any other
                  data. MANUFACTURE PLAY is fully functional without requiring any information about the user.
                </p>

                <p class="caption">What information about my device is collected when I use MANUFACTURE PLAY?</p>
                <p>
                  It is not required to grant the app any device permissions in order to use MANUFACTURE PLAY,
                  however use of the QR code-scanning option requires allowing the app access your device's
                  camera. This is the only device permission the app will ever request, and it is the only
                  purpose for which the device's camera will ever be used by MANUFACTURE PLAY.
                </p>

                <p class="caption">Third-party disclosure</p>
                <p>
                  We do not sell, trade, or otherwise transfer any data to outside parties, nor do we include
                  any commercial offers for third-party products or services at any time.
                </p>

                <p class="caption">Changes to Privacy Policy</p>
                <p>
                  This Privacy Policy may be updated from time to time for any reason. You should check this
                  Privacy Policy periodically for any changes, as continued use is deemed approval of all changes.
                </p>

                <p class="caption">Contact Us</p>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at
                  <a href="mailto:razvan.stoenescu@gmail.com">razvan.stoenescu@gmail.com</a>.
                </p>

            </div>
          </q-scroll-area>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script>
export default {
  data () {
    return {
      opened: false
    }
  },
  methods: {
    show () {
      this.opened = true
    }
  }
}
</script>

<style lang="stylus">
.privacy-policy
  h6
    margin-top 25px
    margin-bottom 10px
  p.caption
    margin-top 0
    &:first-child
      margin-bottom 35px
</style>

<template>
  <router-view />
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Action } from 'vuex-class'

@Component
export default class App extends Vue {
  async created () {
    console.info(
      'Version:',
      process.env.SORA_FARM_PACKAGE_VERSION,
      '\nHash:',
      process.env.SORA_FARM_COMMIT_HASH_SHORT
    )
  }
}
</script>

<style lang="scss">
.web3modal-modal-lightbox {
  z-index: 1000 !important;
  font-family: 'Sora';
}
</style>

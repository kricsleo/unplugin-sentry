<script lang="ts">
import Vue from 'vue'
// @ts-expect-error virtual module
import * as sentryRuntime from 'virtual-unplugin-sentry-runtime'

export default Vue.extend({
  name: 'IndexPage',
  data() {
    return {
      content: JSON.stringify(sentryRuntime, null, 2),
    }
  },
})
</script>

<template>
  <pre>{{ content }}</pre>
</template>

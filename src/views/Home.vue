<template>
  <div class="app-container">
    <ExpandTable></ExpandTable>
  </div>
</template>

<script>
import ExpandTable from '@/components/ExpandTable'
import { generateWaterMark, removeWaterMark } from '@/utils/watermark'

export default {
  name: 'Home',
  components: {
    ExpandTable,
  },
  mounted() {
    generateWaterMark({
      content: 'Alexshwing',
      className: 'app-container',
    })
  },
}
</script>

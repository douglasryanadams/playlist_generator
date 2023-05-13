<template>
  <DataTable v-if="tracks > 0" :value="songStore.searchResults" tyleStyle="min-width: 50rem">
    <Column header="Add">
      <template #body="slotProps">
        <Button label="Add" @click="songStore.selectTrack(slotProps.data)" raised/>
      </template>
    </Column>
    <Column field="name" header="Track Name"></Column>
    <Column field="artist" header="Artist"></Column>
  </DataTable>
</template>

<script setup>
defineProps(() => {
  tracks = []
})
</script>

<style scoped>

</style>
<template>
  <div>
    <label>Nombre:</label>
    <input v-model="localName" @input="emit('update:name', localName)" />
    <span v-if="error" class="error">{{ error }}</span>
  </div>

</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps<{ name: string; error?: string }>();
const emit = defineEmits<{
  (e: 'update:name', value: string): void;
}>();

const localName = ref(props.name);

watch(() => props.name, (newVal) => {
  localName.value = newVal;
});
</script>

<style scoped>
.error {
  color: red;
  font-size: 0.9em;
}
</style>

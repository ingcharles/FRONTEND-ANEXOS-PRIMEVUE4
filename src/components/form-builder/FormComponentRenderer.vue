<template>
  <component
    :is="componentType"
    :component="component"
    :is-selected="isSelected"
    :is-dragging="isDragging"
    @select="handleSelect"
    @update="handleUpdate"
    @delete="handleDelete"
    @drag-start="handleDragStart"
    @drag-end="handleDragEnd"
    @resize="handleResize"
    @add-child="handleAddChild"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FormComponent } from '@/types/form-builder';
import FormText from './FormText.vue';
import FormCombobox from './FormCombobox.vue';
import FormPanel from './FormPanel.vue';
import FormTable from './FormTable.vue';
import FormLabel from './FormLabel.vue';
import FormButton from './FormButton.vue';
import FormPage from './FormPage.vue';

interface Props {
  component: FormComponent;
  isSelected?: boolean;
  isDragging?: boolean;
}

interface Emits {
  (e: 'select', component: FormComponent): void;
  (e: 'update', component: FormComponent): void;
  (e: 'delete', component: FormComponent): void;
  (e: 'drag-start', event: DragEvent): void;
  (e: 'drag-end', event: DragEvent): void;
  (e: 'resize', component: FormComponent, size: { width: number; height: number }): void;
  (e: 'add-child', parentId: string, child: FormComponent): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isDragging: false
});

const emit = defineEmits<Emits>();

const componentMap = {
  text: FormText,
  combobox: FormCombobox,
  panel: FormPanel,
  table: FormTable,
  label: FormLabel,
  button: FormButton,
  page: FormPage
};

const componentType = computed(() => {
  return componentMap[props.component.type] || FormText;
});

function handleSelect(component: FormComponent) {
  emit('select', component);
}

function handleUpdate(component: FormComponent) {
  emit('update', component);
}

function handleDelete(component: FormComponent) {
  emit('delete', component);
}

function handleDragStart(event: DragEvent) {
  emit('drag-start', event);
}

function handleDragEnd(event: DragEvent) {
  emit('drag-end', event);
}

function handleResize(component: FormComponent, size: { width: number; height: number }) {
  emit('resize', component, size);
}

function handleAddChild(parentId: string, child: FormComponent) {
  emit('add-child', parentId, child);
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import DesignerView from '@/pages/disenador/paginas/components/DesignerView.vue'
import PreviewView from '@/pages/disenador/paginas/components/PreviewView.vue'
import JsonView from '@/pages/disenador/paginas/components/JsonView.vue'

const pestaña = ref<'designer' | 'preview' | 'json'>('designer')
</script>

<template>
	<div class="p-3">
		<PrimeTabs v-model:value="pestaña">
			<PrimeTabPanel value="designer" header="Diseñador">
				<DesignerView />
			</PrimeTabPanel>
			<PrimeTabPanel value="preview" header="Previsualizar">
				<PreviewView />
			</PrimeTabPanel>
			<PrimeTabPanel value="json" header="JSON">
				<JsonView />
			</PrimeTabPanel>
		</PrimeTabs>
	</div>
</template>

<style scoped>
</style>

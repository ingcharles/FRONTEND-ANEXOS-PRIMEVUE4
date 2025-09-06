<template>
  <form @submit.prevent="handleSubmit">
    <InputCore :name="form.name" :error="errors.name" @update:name="form.name = $event" />
    <!-- <EmailInput :email="form.email" :error="errors.email" @update:email="form.email = $event" /> -->
    <button type="submit">Enviar</button>
  </form>
  <CForm>
  <CFormInput
    type="email"
    id="exampleFormControlInput1"
    label="Email address"
    placeholder="name@example.com"
    text="Must be 8-20 characters long."
    aria-describedby="exampleFormControlInputHelpInline"
  />
</CForm>
 <SidebarItem href="/home">
      <HomeIcon />
      <SidebarLabel>Home</SidebarLabel>
    </SidebarItem>
  <h1 class="text-3xl font-bold underline">
    Hello world!
  </h1>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { FormData } from '@validations/validation.ts';
import { formSchema } from '@validations/validation.ts';
import InputCore from '@/components/InputCore.vue';
import { CForm, CFormInput } from '@coreui/vue';
import { flattenError } from 'zod';
// import EmailInput from './components/EmailInput.vue';

const form = ref<FormData>({
  name: '',
  email: '',
});

const errors = ref<Partial<Record<keyof FormData, string>>>({});

function handleSubmit() {
  const result = formSchema.safeParse(form);
  if (!result.success) {
    const fieldErrors = flattenError(result.error).fieldErrors;
    errors.value.name = fieldErrors.name?.[0] ?? '';
    errors.value.email = fieldErrors.email?.[0] ?? '';
    return;
  }

  console.log('Formulario válido:', result.data);
  alert('Formulario enviado correctamente');
}
</script>

<script lang="ts" setup>
const isOpen = ref(false)

const { fetch, user } = useUserSession()
const toast = useToast()

async function update(event: SubmitEvent) {
  const target = event.target as HTMLFormElement

  await $fetch('/api/user', {
    method: 'PUT',
    body: {
      email: target.email.value,
      password: target.password.value,
    },
  }).then(() => {
    fetch()
    isOpen.value = false

    toast.add({
      color: 'green',
      title: 'User updated successfully',
    })
  }).catch((err) => {
    console.log(err)

    toast.add({
      color: 'red',
      title: err.data?.message || err.message,
    })
  })
}
</script>

<template>
  <UButton
    v-if="user?.email"
    size="xs"
    color="gray"
    @click="isOpen = true"
  >
    Update
  </UButton>

  <UDashboardModal
    v-if="user?.email"
    v-model="isOpen"
    title="Update user"
    description="Enter your email and password"
  >
    <form @submit.prevent="update($event)">
      <UFormGroup label="Email">
        <UInput
          :model-value="user.email"
          name="email"
          type="email"
        />
      </UFormGroup>
      <UFormGroup label="Password">
        <UInput
          name="password"
          type="password"
        />
      </UFormGroup>
      <UButton
        type="submit"
        color="black"
        class="mt-2"
      >
        Update
      </UButton>
    </form>
  </UDashboardModal>
</template>

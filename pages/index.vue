<template>
<div>
  <h2><b>{{ $t('index.title') }}</b></h2>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam, voluptas provident? Sit exercitationem dicta quis ab corporis libero, consequuntur deleniti nihil officiis illo eius tempore excepturi nemo, error deserunt quaerat.</p>
  
  <div style="color: green;">{{ $store.state.user.name }} - {{ $store.state.user.email }} - {{ $store.state.loggedIn }} </div>

</div>
</template>

<script>
export default {
  components: { },
  methods: { },
  
}
</script>

<style></style>
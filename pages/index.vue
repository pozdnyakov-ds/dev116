<template>
<div>
  <h2><b>{{ $t('index.title') }}</b></h2>
  <p>DOCKER!!! Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam, voluptas provident? Sit exercitationem dicta quis ab corporis libero, consequuntur deleniti nihil officiis illo eius tempore excepturi nemo, error deserunt quaerat.</p>
  
  <div style="color: green;">{{ name }} - {{ email }} - {{ loggedIn }} </div>

</div>
</template>

<script>
export default {
  components: { },
  methods: {},
  computed: {
    name() { 
      return (this.$store.state.user && this.$store.state.user.name) ? this.$store.state.user.name : "Guest"
    },
    email() { 
      return (this.$store.state.user && this.$store.state.user.email) ? this.$store.state.user.email : "None"
    },
    loggedIn() { 
      return (this.$store.state && this.$store.state.loggedIn) ? this.$store.state.loggedIn : false
    }
  }
  
}
</script>

<style></style>
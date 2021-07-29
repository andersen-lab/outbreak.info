<template>
<div>
  Redirecting to blog.outbreak.info ...
</div>
</template>

<script>
export default {
  name: "BlogRedirect",
  props: {
    id: String
  },
  created() {
    if (this.id) {
      window.location = `${this.blogLocation}/${this.id}`
    } else {
      window.location = this.blogLocation
    }
  },
  data() {
    return ({
      blogLocation: "https://blog.outbreak.info"
    })
  }
}
</script>

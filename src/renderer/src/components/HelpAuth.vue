<template>
  <div class="auth">
    <ImButton
      width="240px"
      variant="outlined"
      color="success"
      size="44"
      @click="sponsorshipVisible = true"
      >支持作者</ImButton
    >
    <!-- 赞助 -->
    <ImDialog v-model="sponsorshipVisible" width="520px" class="no_drag">
      <ImDialogHeader>赞助作者</ImDialogHeader>
      <ImDialogBody>
        <ImAlert variant="outlined">您的支持将帮助我们继续改进和完善软件</ImAlert>
        <div class="img_wrapper">
          <img src="../assets/alipay.jpg" />
          <img src="../assets/wechart.png" />
        </div>
      </ImDialogBody>
      <ImDialogFooter>
        <ImButton color="primary" variant="outlined" @click="sponsorshipVisible = false"
          >感谢老铁</ImButton
        >
      </ImDialogFooter>
    </ImDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const sponsorshipVisible = ref(false)
</script>

<style scoped lang="scss">
.auth {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 16px;
  background: var(--im-bg-content-color);
  border-radius: 8px;
  padding: 24px;
}

.img_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  gap: 16px;
  img {
    flex: 1;
    max-width: calc(50% - 16px);
    border-radius: 8px;
  }
}
</style>

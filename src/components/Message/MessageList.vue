<template>
    <div class="message__list">
        <div v-for="(message, index) in messages" :key="index" class="message">
            <div class="message__info">
                <h4 class="message__sender">{{ message.sender }}</h4>
                <p class="message__timestamp">{{ message.timestamp }}</p>
            </div>
            <p class="message__content">{{ message.content }}</p>
        </div>
    </div>
</template>
  
<script>
export default {
    props: ["messages"],
};
</script>
<template>
    <div class="message__input">
        <input type="text" v-model="message" placeholder="Ecrivez un message..." @keyup.enter="sendMessage" />
    </div>
</template>
  
<script>
import { ref } from "vue";

export default {
    props: ["modelValue"],
    emits: ["update:modelValue", "sendMessage"],
    setup(props, { emit }) {
        const message = ref(props.modelValue);

        const sendMessage = () => {
            emit("sendMessage", message.value);
            message.value = "";
        };

        return { message, sendMessage };
    },
};
</script>
  
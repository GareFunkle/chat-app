<template>
    <div class="image__upload">
        <input type="file" @change="uploadImage" />
    </div>
</template>
  
<script>
import { ref } from "vue";

export default {
    emits: ["sendImage"],
    setup(_, { emit }) {
        const uploadImage = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                emit("sendImage", reader.result);
            };

            if (file) {
                reader.readAsDataURL(file);
            }
        };

        return { uploadImage };
    },
};
</script>
  
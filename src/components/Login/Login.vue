<template>
    <div class="login">
        <h1 class="login__title">Chat App By V.D</h1>
        <h2 class="login__title">Connexion</h2>
        <BtnCustom text="Se connecter avec Gmail" @click="signInWithGoogle" />
        <p v-if="error">{{ error }}</p>
    </div>
</template>
  
<script>
import { ref } from "vue";
import { auth, provider, db } from "../../Data/Firebase/index";
import { signInWithPopup } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import BtnCustom from "../Button/BtnCustom.vue";

export default {
    components: {
        BtnCustom
    },
    emits: ["loggedIn"],
    setup(_, { emit }) {
        const error = ref(null);

        const saveUserToFirestore = async (user) => {
            const userRef = doc(db, "users", user.uid);
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                // Ajoutez d'autres champs si nécessaire
            };

            await setDoc(userRef, userData);
        };

        const signInWithGoogle = async () => {
            try {
                const res = await signInWithPopup(auth, provider);
                await saveUserToFirestore(res.user);
                emit("loggedIn", res.user);
            } catch (err) {
                error.value = err.message;
            }
        };

        return { signInWithGoogle, error };
    },
};
</script>

<style lang="scss">
.login {
    margin-top: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .login__title {
        font-size: 4rem;
        color: var(--color-3);
    }
}
</style>

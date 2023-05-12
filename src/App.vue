<template>
  <div id="app">
    <div class="login__wrap">
      <Login v-if="!user" @loggedIn="setUser" />
    </div>
    <div class="chat__wrap" v-if="user">
      <div class="friends__wrap">
        <BtnCustom text="Se Deconnecter" @click="logout" />
        <FriendList @selectFriend="selectFriend" />
      </div>
      <div class="chat__wrap">
        <Chat v-if="selectedFriend" :user="user" :friend="selectedFriend" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { auth } from "./Data/Firebase/index";
import { signOut } from "firebase/auth";
import Login from "./components/Login/Login.vue";
import FriendList from "./components/Friend/FriendList.vue";
import Chat from "./components/Chat/Chat.vue";
import BtnCustom from './components/Button/BtnCustom.vue';


export default {
  components: {
    Login,
    FriendList,
    Chat,
    BtnCustom
  },
  setup() {
    const user = ref(null);
    const selectedFriend = ref(null);

    onMounted(() => {
      auth.onAuthStateChanged((currentUser) => {
        user.value = currentUser;
      });
    });

    const setUser = (loggedInUser) => {
      user.value = loggedInUser;
    };

    const selectFriend = (friend) => {
      selectedFriend.value = friend;
    };

    const logout = async () => {
      try {
        await signOut(auth);
        setUser(null);
      } catch (err) {
        console.error("Error signing out:", err);
      }
    };

    return { user, setUser, selectedFriend, selectFriend, logout };
  },
};
</script>


<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap');

:root {
  --color-1: #d1dddb;
  --color-2: #85b8cb;
  --color-3: #1d6a96;
  --color-4: #283b42;
}

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: 'Roboto Condensed', sans-serif;

}

#app {
  overflow-x: none;
  max-width: 100%;
  height: 100vh;
  background: var(--color-1);


  .login__wrap {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .chat__wrap {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    width: 100%;
    height: 100vh;
    box-sizing: border-box;

    .friends__wrap {
      flex: 15%;
      border-right: 1px solid var(--color-4);
      padding-right: 1em;

      .btn-custom {
        margin-bottom: 1em;
      }
    }

    .chat__wrap {
      flex: 75%;
      overflow: auto;
    }
  }
}
</style>
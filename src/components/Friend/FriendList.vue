<!-- FriendList.vue -->
<template>
    <h3 class="title">Chat App By <div class="v">V</div>.<div class="d">D</div>
    </h3>
    <div class="search">
        <input v-model="searchTerm" placeholder="Rechercher un ami par son nom" />
        <ul class="search-results">
            <li class="result" v-for="result in searchResults" :key="result.uid" @click="addFriend(result)">
                {{ result.displayName }}
            </li>
        </ul>
    </div>
    <div class="discussion">
        <ul class="friends">
            <li class="friend" v-for="friend in friends" :key="friend.id" @click="selectFriend(friend)">
                {{ getDisplayName(friend.friendId) }}
            </li>
        </ul>
    </div>
</template>
  
<script>
import { ref, onMounted, onUnmounted, watchEffect, computed } from "vue";
import { auth, db } from "../../Data/Firebase/index";
import { collection, query, where, getDocs, addDoc, onSnapshot } from "firebase/firestore";

export default {
    emits: ["selectFriend"],
    setup(_, { emit }) {
        const users = ref([]);
        const friends = ref([]);
        const searchTerm = ref('');

        watchEffect(() => {
            const usersRef = collection(db, 'users');
            const unsubscribe = onSnapshot(usersRef, (snapshot) => {
                users.value = snapshot.docs.map(doc => doc.data());
            });

            onUnmounted(unsubscribe);
        });

        const getDisplayName = (uid) => {
            const user = users.value.find(user => user.uid === uid);
            return user ? user.displayName : '';
        }

        const fetchData = async () => {
            const user = auth.currentUser;
            const friendsRef = collection(db, "friends");
            const friendsQuery = query(friendsRef, where("ownerId", "==", user.uid));
            const friendSnapshot = await getDocs(friendsQuery);
            friends.value = friendSnapshot.docs.map((doc) => doc.data());
        }

        const searchResults = computed(() => {
            if (!searchTerm.value) {
                return []
            }
            const results = users.value.filter(user =>
                user.displayName.toLowerCase().includes(searchTerm.value.toLowerCase())
            )
            return results;
        })


        const addFriend = async (user) => {
            const existingFriend = friends.value.find(friend => friend.friendId === user.uid);
            if (existingFriend) {
                selectFriend(existingFriend);
            } else {
                const friendData = {
                    name: user.email,
                    ownerId: auth.currentUser.uid,
                    friendId: user.uid,
                };
                await addDoc(collection(db, "friends"), friendData);
                friends.value.push(friendData);
            }
            searchTerm.value = "";
            console.log("addFriend", user);
        };


        const selectFriend = (friend) => {
            emit("selectFriend", {
                name: friend.name,
                ownerId: friend.friendId,
                currentUserId: auth.currentUser.uid,
            });
        };

        onMounted(fetchData);

        return { friends, addFriend, selectFriend, getDisplayName, searchTerm, searchResults };
    },
};
</script>


<style lang="scss">
@keyframes zoom {
    0% {
        transform: scale(0.5);
        transition: transform 0.3s ease-in;
    }

    100% {
        transform: scale(1);
        transition: transform 0.3s ease-in;

    }
}

.title {
    margin-top: 1rem;
    display: flex;
    justify-content: center;

    .v {
        display: inline-block;
        color: blue;
        transform: scale(1);
        transition: transform 1s ease-in;
        animation: zoom 1.5s infinite;
    }

    .d {
        display: inline-block;
        color: red;
        transform: scale(1);
        transition: transform 1s ease-in;
        animation: zoom 1.5s infinite;
        animation-delay: 0.7s;
    }

}

.friends {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;

    .friend {
        padding: 10px 15px;
        cursor: pointer;
        border-bottom: 1px solid var(--color-4);

        &:hover {
            background-color: var(--color-2);
            transition: all 0.3s ease-in;
        }
    }
}

.search {

    margin: 1rem;

    input {
        border: none;
        border-radius: calc(5rem / 3);
        width: 100%;
        padding: 1rem;
        border: 1px solid var(--color-4);
        transition: all 0.3s ease-in;


        &:focus {
            font-size: 1rem;
            transition: all 0.3s ease-in;
        }
    }

    .search-results {
        margin-top: 1rem;

        .result {
            list-style: none;
            cursor: pointer;
        }
    }
}
</style>
  
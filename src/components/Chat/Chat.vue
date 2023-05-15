<!-- Chat.vue -->
<template>
    <div class="chat">
        <div class="chat__header">
            <h2 class="chat__name">{{ getDisplayName(friend.ownerId) }}</h2>
        </div>
        <ul class="chat__messages" ref="messageList">
            <li class="messages" v-for="message in messages" :key="message.id">
                <div class="message"
                    :class="{ 'user__messages': message.userId === user.uid, 'friend__messages': message.userId !== user.uid }">
                    <div
                        :class="{ 'user-message': message.userId === user.uid && message.type === 'text', 'friend-message': message.userId !== user.uid && message.type === 'text' }">

                        <span class="message__content" v-if="message.type === 'text'">{{ message.content }}</span>
                    </div>

                    <img v-if="message.type === 'image'" :src="message.content" :id="message.fileName" alt="sent image"
                        @load="scrollToBottom" />
                    <div v-if="message.type === 'image' && isUploading">
                        <progress v-if="uploadProgress[message.fileName]" max="100"
                            :value="uploadProgress[message.fileName]"> {{
                                uploadProgress[message.fileName] }}% </progress>
                    </div>
                </div>
            </li>

        </ul>
        <div class="message__send-wrap">
            <div class="send">
                <input class="input__message" v-model="newMessage" @keyup.enter="sendMessage" placeholder="Écrire..." />
                <input type="file" id="file" style="display:none;" @change="sendImage" />
                <label for="file">
                    <span class="material-icons file">
                        crop_original
                    </span>
                </label>
                <BtnCustom text="Envoyer" @click="sendMessage" />
            </div>
        </div>
    </div>
</template>

  
<script>
import { ref, watchEffect, onUnmounted, onMounted, onUpdated, nextTick } from "vue";
import { db, storage } from "../../Data/Firebase/index";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    where,
} from "firebase/firestore";
import { ref as fbRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import BtnCustom from "../Button/BtnCustom.vue";


export default {
    components: {
        BtnCustom,
    },
    props: ["user", "friend"],
    setup(props) {
        const users = ref([])
        const messages = ref([]);
        const newMessage = ref("");
        const messageList = ref(null);
        let unsubscribeMessages = null;
        let unsubscribeUsers = null;

        const uploadProgress = ref({});
        const isUploading = ref(false);

        onUpdated(() => {
            const elements = messageList.value.children;
            if (elements.length > 0) {
                elements[elements.length - 1].scrollIntoView({ behavior: 'smooth' });
            }
        });

        const scrollToBottom = () => {
            nextTick(() => {
                const container = document.querySelector('.chat__messages');
                container.scrollTop = container.scrollHeight;
            });
        };

        watchEffect(async () => {
            const friend = props.friend;
            if (friend) {
                if (unsubscribeMessages) {
                    unsubscribeMessages();
                }

                const messagesRef = collection(db, "messages");
                const messagesQuery = query(
                    messagesRef,
                    where(
                        "participants",
                        "array-contains-any",
                        [
                            `${props.user.uid}-${props.friend.ownerId}`,
                            `${props.friend.ownerId}-${props.user.uid}`,
                        ]
                    ),
                    orderBy("timestamp")
                );

                unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
                    messages.value = snapshot.docs.map((doc) => doc.data());
                });
            }
        });

        onUnmounted(() => {
            if (unsubscribeUsers) {
                unsubscribeUsers();
            }
            if (unsubscribeMessages) {
                unsubscribeMessages();
            }
        });

        const getDisplayName = (uid) => {
            const user = users.value.find(user => user.uid === uid);
            return user ? user.displayName : '';
        }

        const sendMessage = async () => {
            if (newMessage.value) {
                const messageData = {
                    content: newMessage.value,
                    sender: props.user.displayName,
                    userId: props.user.uid,
                    timestamp: serverTimestamp(),
                    type: 'text',
                    participants: [
                        `${props.user.uid}-${props.friend.ownerId}`,
                        `${props.friend.ownerId}-${props.user.uid}`,
                    ],
                };

                await addDoc(collection(db, 'messages'), messageData);
                messages.value.push(messageData);
                newMessage.value = '';

                // Affichage de la notification
                Notification.requestPermission().then(function (permission) {
                    if (permission === 'granted') {
                        new Notification('Nouveau message', { body: messageData.content });

                    }
                });
            }
        };



        const sendImage = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const storageRef = fbRef(storage, `images/${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);
                isUploading.value = true;

                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Calcul de la progression en pourcentage
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        uploadProgress.value[file.name] = progress;   // Met à jour la variable réactive
                        console.log(`Progress for ${file.name}: ${progress}%`)
                    },
                    (error) => {
                        console.error(error);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        const messageData = {
                            content: downloadURL,
                            sender: props.user.displayName,
                            userId: props.user.uid,
                            timestamp: serverTimestamp(),
                            type: 'image',
                            fileName: file.name, // Ajoutez ceci
                            participants: [
                                `${props.user.uid}-${props.friend.ownerId}`,
                                `${props.friend.ownerId}-${props.user.uid}`,
                            ],
                        };
                        uploadProgress.value[file.name] = 0; // Reset la progression après l'upload
                        delete uploadProgress.value[file.name];
                        await addDoc(collection(db, 'messages'), messageData);
                        messages.value.push(messageData);
                        uploadProgress.value = 0;
                        isUploading.value = false;
                    }
                );
            }
        };

        const fetchUser = () => {
            const usersRef = collection(db, 'users');
            unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
                users.value = snapshot.docs.map(doc => doc.data());
            });
        }
        const permission = () => {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    console.log("Permission sur les notification accepter")
                } else {
                    console.log("permission sur les notification refuser")
                }
            })
        }



        onMounted(() => {
            fetchUser()
            permission()
        });

        return { messages, newMessage, getDisplayName, messageList, sendMessage, sendImage, scrollToBottom, uploadProgress, isUploading };
    },
};
</script>
  
<style lang="scss">
.chat {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .chat__header {
        flex: 0 0 auto;
        padding: 10px 15px;
        background-color: var(--color-1);
        border-bottom: 1px solid var(--color-4);

        .chat__name {
            margin: 0;
        }
    }

    .chat__messages {
        flex: 1 1 auto;
        overflow-y: auto;
        padding: 15px;
        background-color: #fafafa;

        .messages {
            margin-bottom: 15px;
            list-style: none;

            .message {
                display: flex;
                align-items: center;

                &.user__messages {
                    display: flex;
                    justify-content: flex-end;
                }

                &.friend__messages {
                    display: flex;
                    justify-content: flex-start;
                }

                .user-message {
                    color: white;
                    padding: 1rem;
                    background: var(--color-3);
                    border-radius: calc(5rem / 3);
                }

                .friend-message {
                    color: white;
                    padding: 1rem;
                    background: var(--color-2);
                    border-radius: calc(5rem / 3);
                }

                .message__content {

                    overflow-wrap: break-word;
                }

                img {
                    max-width: 80%;
                    height: auto;
                    margin-left: 10px;
                }
            }

        }
    }

    .message__send-wrap {
        flex: 0 0 auto;
        padding: 15px;
        background-color: var(--color-1);
        border-top: 1px solid var(--color-4);

        .send {
            display: flex;
            align-items: center;

            .input__message {
                flex: 1 1 auto;
                padding: 10px;
                border: 1px solid var(--color-4);
                border-radius: 5px;
                margin-right: 10px;
            }

            .file {
                padding: 1rem;
                cursor: pointer;
                color: var(--color-3);
                font-size: 3rem;
                transition: color 0.3s ease-in;

                &:hover {
                    color: var(--color-4);
                }
            }
        }
    }
}
</style>
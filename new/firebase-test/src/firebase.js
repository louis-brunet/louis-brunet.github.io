// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from 'firebase/app'
import { ref, onUnmounted } from 'vue'
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from "firebase/app"

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
//import 'firebase/analytics'

// Add the Firebase products that you want to use
//import 'firebase/auth'
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: 'AIzaSyD6AZ8VDGo8vRqz2Z2v3iDwRl-HeEv0UE8',
    authDomain: 'vue-firebase-test-73757.firebaseapp.com',
    projectId: 'vue-firebase-test-73757',
    storageBucket: 'vue-firebase-test-73757.appspot.com',
    messagingSenderId: '917325420957',
    appId: '1:917325420957:web:1a4827b267bbbd4c607774'
}
// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig)
const db = firebaseApp.firestore()
const usersCollection = db.collection('users')

console.log('firebase created')
console.log('firebase :', firebase)
console.log('firebaseApp :', firebaseApp)
console.log('db :', db)
console.log('users :', usersCollection)
console.log('users.get() : ')
usersCollection.get().then((res) => {
    console.log(res)
    console.log('users.get().docs : ', res.docs)
})

export const createUser = (user) => usersCollection.add(user)

export const getUser = async (id) => {
    const u = await usersCollection.doc(id).get()
    return u.exists ? u.data() : null
}

export const deleteUser = (id) => usersCollection.doc(id).delete()

export const useLoadusers = () => {
    const users = ref([])
    const close = usersCollection.onSnapshot((snapshot) => {
        users.value = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }))
    })
    onUnmounted(close)
    return users
}

const form = document.getElementById('registerForm');
const alert = document.querySelector(".alert");

const firebaseConfig = {
    apiKey: "AIzaSyBsdQy3rZq4kPlL_2ctpsk1AKYvkOsehQE",
    authDomain: "register-59c22.firebaseapp.com",
    databaseURL: "https://register-59c22-default-rtdb.firebaseio.com",
    projectId: "register-59c22",
    storageBucket: "register-59c22.appspot.com",
    messagingSenderId: "862955181288",
    appId: "1:862955181288:web:9748c4a02237939359e55d",
    measurementId: "G-VETGH2BSMW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


const database = firebase.database()

const ref = database.ref("messages")


form.addEventListener("submit", (e) => {

    e.preventDefault();


    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;


    ref.push({
        name: name,
        password:password,
    })

    alert.style.display = "block"


    setTimeout(()=>{
        alert.style.display="none"
    }, 2000)

    form.reset()
})
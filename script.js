import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js"
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyBcDLdF0VWLjzlexPbYud5JWlJKQjapRNY",
  authDomain: "no-excuses-c9f61.firebaseapp.com",
  projectId: "no-excuses-c9f61",
  storageBucket: "no-excuses-c9f61.firebasestorage.app",
  messagingSenderId: "488365500196",
  appId: "1:488365500196:web:8a419b804451567f9df5b1",
  measurementId: "G-F6LKE7P5F0"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const users = {
  admin: { password: "queen123", role: "admin" },
  CHN: { password: "begood123", role: "user" }
}

let currentUser = null
let compliments = []
let unsubscribe = null

const complimentsCol = collection(db, "compliments")
const complimentsQuery = query(complimentsCol, orderBy("createdAt", "desc"))

function login() {
  let u = document.getElementById("username").value
  let p = document.getElementById("password").value

  if (users[u] && users[u].password === p) {
    currentUser = u
    document.getElementById("login").style.display = "none"
    document.getElementById("main").style.display = "block"
    createHearts()
    startRealtime()
  } else {
    alert("Wrong login")
  }
}

function startRealtime() {
  if (unsubscribe) unsubscribe()
  unsubscribe = onSnapshot(
    complimentsQuery,
    (snapshot) => {
      compliments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      render()
    },
    (err) => console.error(err)
  )
}

/* ADD COMPLIMENT */
async function addCompliment() {
  if (users[currentUser].role !== "user") {
    alert("Only CHN can add compliments")
    return
  }

  let text = prompt("Write today's compliment")
  if (!text) return

  await addDoc(complimentsCol, {
    text: text,
    points: 0,
    review: "",
    createdBy: currentUser,
    createdAt: serverTimestamp()
  })
}

/* ADMIN REVIEW */
async function review(id) {
  if (users[currentUser].role !== "admin") return

  let pts = prompt("Give points")
  if (pts === null) return

  let rev = prompt("Write review")

  let points = Number(pts)
  if (Number.isNaN(points)) {
    alert("Points must be a number")
    return
  }

  await updateDoc(doc(db, "compliments", id), {
    points: points,
    review: rev || ""
  })
}

/* RENDER */
function render() {
  renderCompliments()
  updateStats()
}

/* COMPLIMENT LIST */
function renderCompliments() {
  let box = document.getElementById("compliments")
  box.innerHTML = ""

  compliments.forEach((c) => {
    let div = document.createElement("div")
    div.className = "card"

    div.innerHTML = `
      <p><b>Compliment:</b> ${c.text || ""}</p>
      <p>⭐ Points: ${c.points || 0}</p>
      ${c.review ? `<p>📝 Review: ${c.review}</p>` : ""}
      ${
        users[currentUser].role === "admin"
          ? `<button onclick="review('${c.id}')">Give Points & Review</button>`
          : ""
      }
    `

    box.appendChild(div)
  })
}

/* STATS */
function updateStats() {
  let totalPoints = 0
  compliments.forEach((c) => {
    totalPoints += Number(c.points) || 0
  })

  const streak = compliments.length

  document.getElementById("points").innerText = totalPoints
  document.getElementById("streak").innerText = streak

  let level = "Beginner"
  if (totalPoints > 50) level = "Sweet Talker"
  if (totalPoints > 120) level = "Charmer"
  if (totalPoints > 250) level = "Legend"

  document.getElementById("level").innerText = level
  document.getElementById("progressBar").style.width = Math.min(totalPoints, 100) + "%"

  updateCat(streak)
}

/* CAT MOODS */
function updateCat(streak) {
  let emoji = "😸"
  let text = "Waiting for compliments..."

  if (streak >= 3) { emoji = "😺"; text = "Good streak going!" }
  if (streak >= 7) { emoji = "😻"; text = "Amazing compliments!" }
  if (streak >= 14) { emoji = "😽"; text = "Legendary charm!" }

  document.getElementById("catEmoji").innerText = emoji
  document.getElementById("catText").innerText = text
}

/* FLOATING HEARTS */
function createHearts() {
  const hearts = document.querySelector(".hearts")
  hearts.innerHTML = ""

  for (let i = 0; i < 20; i++) {
    let heart = document.createElement("span")
    heart.innerHTML = "💖"
    heart.style.left = Math.random() * 100 + "%"
    heart.style.animationDelay = Math.random() * 5 + "s"
    heart.style.fontSize = Math.random() * 20 + 10 + "px"
    hearts.appendChild(heart)
  }
}

window.login = login
window.addCompliment = addCompliment
window.review = review

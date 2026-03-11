const users = {
  admin: {
    password: "queen123",
    role: "admin"
  },
  CHN: {
    password: "begood123",
    role: "user"
  }
}

const STORAGE_KEY = "compliments"

let currentUser = null
let compliments = loadLocalCompliments()

function loadLocalCompliments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(compliments))
}

function login() {
  let u = document.getElementById("username").value
  let p = document.getElementById("password").value

  if (users[u] && users[u].password === p) {
    currentUser = u
    document.getElementById("login").style.display = "none"
    document.getElementById("main").style.display = "block"
    createHearts()
    render()
  } else {
    alert("Wrong login")
  }
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) {
    compliments = loadLocalCompliments()
    if (currentUser) render()
  }
})

/* ADD COMPLIMENT */
function addCompliment() {
  if (users[currentUser].role !== "user") {
    alert("Only CHN can add compliments")
    return
  }

  let text = prompt("Write today's compliment")
  if (!text) return

  compliments.push({
    text: text,
    points: 0,
    review: ""
  })

  save()
  render()
}

/* ADMIN REVIEW */
function review(i) {
  if (users[currentUser].role !== "admin") return

  let pts = prompt("Give points")
  if (pts === null) return

  let rev = prompt("Write review")

  let points = Number(pts)
  if (Number.isNaN(points)) {
    alert("Points must be a number")
    return
  }

  compliments[i].points = points
  compliments[i].review = rev || ""

  save()
  render()
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

  compliments.forEach((c, i) => {
    let div = document.createElement("div")
    div.className = "card"

    div.innerHTML = `
      <p><b>Compliment:</b> ${c.text}</p>
      <p>⭐ Points: ${c.points}</p>
      ${c.review ? `<p>📝 Review: ${c.review}</p>` : ""}
      ${
        users[currentUser].role === "admin"
          ? `<button onclick="review(${i})">Give Points & Review</button>`
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

  document.getElementById("progressBar").style.width =
    Math.min(totalPoints, 100) + "%"

  updateCat(streak)
}

/* CAT MOODS */
function updateCat(streak) {
  let emoji = "😸"
  let text = "Waiting for compliments..."

  if (streak >= 3) {
    emoji = "😺"
    text = "Good streak going!"
  }

  if (streak >= 7) {
    emoji = "😻"
    text = "Amazing compliments!"
  }

  if (streak >= 14) {
    emoji = "😽"
    text = "Legendary charm!"
  }

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

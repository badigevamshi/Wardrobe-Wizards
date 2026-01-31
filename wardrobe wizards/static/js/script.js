const form = document.getElementById("styleForm")
const imageInput = document.getElementById("imageInput")
const dropArea = document.getElementById("dropArea")

const getStartedBtn = document.getElementById("getStartedBtn")
const homeLink = document.getElementById("homeLink")
const tryLink = document.getElementById("tryLink")

const homeSection = document.getElementById("home")
const trySection = document.getElementById("try")

const result = document.getElementById("result")
const styleOptions = document.getElementById("styleOptions")

let detectedGender = ""

/* ---------- NAVIGATION ---------- */
getStartedBtn.addEventListener("click", () => {
    trySection.classList.remove("hidden")
    trySection.scrollIntoView({ behavior: "smooth" })
})

homeLink.addEventListener("click", e => {
    e.preventDefault()
    homeSection.scrollIntoView({ behavior: "smooth" })
})

tryLink.addEventListener("click", e => {
    e.preventDefault()
    trySection.classList.remove("hidden")
    trySection.scrollIntoView({ behavior: "smooth" })
})

/* ---------- DRAG & DROP ---------- */
dropArea.addEventListener("dragover", e => e.preventDefault())
dropArea.addEventListener("drop", e => {
    e.preventDefault()
    imageInput.files = e.dataTransfer.files
})

/* ---------- FORM SUBMIT ---------- */
form.addEventListener("submit", async e => {
    e.preventDefault()

    if (!imageInput.files.length) {
        alert("Please upload an image")
        return
    }

    const data = new FormData()
    data.append("image", imageInput.files[0])
    data.append("gender", document.querySelector("input[name='gender']:checked").value)

    result.innerHTML = "<p>Analyzing your skin tone...</p>"

    const res = await fetch("/analyze", {
        method: "POST",
        body: data
    })

    const json = await res.json()

    detectedGender = json.gender.toLowerCase()

    result.innerHTML = `
        <h3>Skin Tone: ${json.skin_tone}</h3>

        <div class="recommendation-box">
            <h4>👕 Shirt Colors</h4><p>${json.recommendation.shirts}</p>
            <h4>👖 Bottom Wear</h4><p>${json.recommendation.bottoms}</p>
            <h4>👟 Footwear</h4><p>${json.recommendation.footwear}</p>
            <h4>🕶 Accessories</h4><p>${json.recommendation.accessories}</p>
            <h4>💇 Hairstyle</h4><p>${json.recommendation.hairstyle}</p>
        </div>
    `

    styleOptions.classList.remove("hidden")
})

/* ---------- MYNTRA REDIRECT ---------- */
function goToShop(style) {
    let url = ""

    if (detectedGender === "male") {
        if (style === "casual") url = "https://www.myntra.com/men-casual-shirts"
        if (style === "formal") url = "https://www.myntra.com/men-formal-shirts"
        if (style === "party") url = "https://www.myntra.com/men-party-wear"
        if (style === "traditional") url = "https://www.myntra.com/men-kurta-sets"
        if (style === "sports") url = "https://www.myntra.com/men-sports-wear"
        if (style === "comfort") url = "https://www.myntra.com/men-loungewear"
    } else {
        if (style === "casual") url = "https://www.myntra.com/women-casual-wear"
        if (style === "formal") url = "https://www.myntra.com/women-workwear"
        if (style === "party") url = "https://www.myntra.com/women-party-wear"
        if (style === "traditional") url = "https://www.myntra.com/women-ethnic-wear"
        if (style === "sports") url = "https://www.myntra.com/women-sports-wear"
        if (style === "comfort") url = "https://www.myntra.com/women-loungewear"
    }

    window.open(url, "_blank")
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = "https://rfqzcsssnayujsajcwbl.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcXpjc3NzbmF5dWpzYWpjd2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODkxMDIsImV4cCI6MjA3MTI2NTEwMn0.C0DbtCOC7M8t98cq8k1p-r2XNEaEUmBp16RDVMk_hYs"
const supabase = createClient(supabaseUrl, supabaseKey)

const form = document.getElementById("register-form")
const message = document.getElementById("message")

form.addEventListener("submit", async (e) => {
  e.preventDefault()

  const name = document.getElementById("name").value
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  // 1️⃣ Create account in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password
  })

  if (error) {
    message.style.color = "red"
    message.innerText = "❌ " + error.message
    return
  }

  const userId = data.user.id

  // 2️⃣ Insert user into "users" table
  const { error: insertError } = await supabase
    .from("users")
    .insert([{ id: userId, name: name, role: "user" }])

  if (insertError) {
    message.style.color = "red"
    message.innerText = "⚠️ Registered but profile insert failed"
    return
  }

  message.style.color = "green"
  message.innerText = "✅ Registration successful! Redirecting..."
  setTimeout(() => {
    window.location.href = "home.php"
  }, 1500)
})

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = "https://rfqzcsssnayujsajcwbl.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcXpjc3NzbmF5dWpzYWpjd2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODkxMDIsImV4cCI6MjA3MTI2NTEwMn0.C0DbtCOC7M8t98cq8k1p-r2XNEaEUmBp16RDVMk_hYs"
const supabase = createClient(supabaseUrl, supabaseKey)

const form = document.getElementById("login-form")
const message = document.getElementById("message")

form.addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  // 1️⃣ Login user
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })

  if (error) {
    message.style.color = "red"
    message.innerText = "❌ " + error.message
    return
  }

  const userId = data.user.id

  // 2️⃣ Fetch user role from "users" table
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    message.style.color = "red"
    message.innerText = "⚠️ Login successful but role not found"
    return
  }

  // 3️⃣ Redirect based on role
  if (profile.role === "admin") {
    message.style.color = "green"
    message.innerText = "✅ Welcome Admin! Redirecting..."
    setTimeout(() => {
      window.location.href = "admin_dashboard.php"
    }, 1500)
  } else {
    message.style.color = "green"
    message.innerText = "✅ Login successful! Redirecting..."
    setTimeout(() => {
      window.location.href = "home.php"
    }, 1500)
  }
})

// Configuration - Move these to environment variables in production
const CONFIG = {
  SUPABASE_URL: "https://rfqzcsssnayujsajcwbl.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcXpjc3NzbmF5dWpzYWpjd2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODkxMDIsImV4cCI6MjA3MTI2NTEwMn0.C0DbtCOC7M8t98cq8k1p-r2XNEaEUmBp16RDVMk_hYs"
};

// Initialize Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Get form elements
const form = document.getElementById("register-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const termsCheckbox = document.getElementById("terms");
const submitBtn = document.getElementById("submit-btn");
const loader = document.getElementById("loader");
const btnText = document.getElementById("btn-text");
const message = document.getElementById("message");
const loginLink = document.getElementById("login-link");

// Validation state
const validation = {
  name: false,
  email: false,
  password: false,
  confirmPassword: false,
  terms: false
};

// Utility functions
function showMessage(text, type = 'info') {
  message.textContent = text;
  message.className = `show ${type}`;
  setTimeout(() => {
    message.className = message.className.replace('show', '');
  }, 5000);
}

function showValidation(field, isValid, messageText) {
  const input = document.getElementById(field);
  const messageEl = document.getElementById(`${field}-message`);
  
  input.className = isValid ? 'valid' : 'invalid';
  messageEl.textContent = messageText;
  messageEl.className = `validation-message show ${isValid ? 'success' : 'error'}`;
  
  // Update validation state
  const fieldKey = field.replace('-', '').replace('password', 'Password');
  validation[fieldKey === 'confirmPassword' ? 'confirmPassword' : field.replace('-', '')] = isValid;
  updateSubmitButton();
}

function updateSubmitButton() {
  const allValid = Object.values(validation).every(v => v);
  submitBtn.disabled = !allValid;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
}

function updatePasswordStrength(password) {
  const strengthEl = document.getElementById("password-strength");
  const fillEl = document.getElementById("strength-fill");
  const textEl = document.getElementById("strength-text");
  
  if (password.length === 0) {
    strengthEl.style.display = 'none';
    return false;
  }
  
  strengthEl.style.display = 'block';
  const { checks, score } = validatePassword(password);
  
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthClasses = ['strength-weak', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong'];
  
  const strength = strengthLabels[score];
  const strengthClass = strengthClasses[score];
  const width = (score / 5) * 100;
  
  fillEl.style.width = `${width}%`;
  fillEl.className = `strength-fill ${strengthClass}`;
  textEl.textContent = strength;
  
  // Require at least "Good" strength (score >= 3)
  return score >= 3;
}

// Real-time validation event listeners
nameInput.addEventListener('input', (e) => {
  const name = e.target.value.trim();
  
  if (name.length === 0) {
    showValidation('name', false, 'Name is required');
  } else if (name.length < 2) {
    showValidation('name', false, 'Name must be at least 2 characters');
  } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    showValidation('name', false, 'Name can only contain letters, spaces, hyphens, and apostrophes');
  } else if (name.length > 50) {
    showValidation('name', false, 'Name must be less than 50 characters');
  } else {
    showValidation('name', true, 'Looks good!');
  }
});

emailInput.addEventListener('input', (e) => {
  const email = e.target.value.trim();
  
  if (email.length === 0) {
    showValidation('email', false, 'Email is required');
  } else if (!validateEmail(email)) {
    showValidation('email', false, 'Please enter a valid email address');
  } else {
    showValidation('email', true, 'Email format is valid');
  }
});

// Check email availability on blur (when user leaves the field)
emailInput.addEventListener('blur', async (e) => {
  const email = e.target.value.trim();
  
  if (validateEmail(email)) {
    try {
      // Check if email already exists in the users table
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();
      
      if (data) {
        showValidation('email', false, 'This email is already registered');
      } else if (error && error.code === 'PGRST116') {
        // PGRST116 = no rows returned, meaning email is available
        showValidation('email', true, 'Email is available');
      } else if (error) {
        console.log('Email availability check error:', error);
        // Don't show error to user, just keep the format validation
        showValidation('email', true, 'Email format is valid');
      }
    } catch (err) {
      console.log('Email check error:', err);
      // Fail silently and keep format validation
      showValidation('email', true, 'Email format is valid');
    }
  }
});

passwordInput.addEventListener('input', (e) => {
  const password = e.target.value;
  const isStrong = updatePasswordStrength(password);
  
  if (password.length === 0) {
    showValidation('password', false, 'Password is required');
  } else if (password.length < 8) {
    showValidation('password', false, 'Password must be at least 8 characters');
  } else if (!isStrong) {
    showValidation('password', false, 'Password needs to be stronger');
  } else {
    showValidation('password', true, 'Strong password!');
  }
  
  // Revalidate confirm password if it has a value
  if (confirmPasswordInput.value) {
    confirmPasswordInput.dispatchEvent(new Event('input'));
  }
});

confirmPasswordInput.addEventListener('input', (e) => {
  const confirmPassword = e.target.value;
  const password = passwordInput.value;
  
  if (confirmPassword.length === 0) {
    showValidation('confirm-password', false, 'Please confirm your password');
  } else if (confirmPassword !== password) {
    showValidation('confirm-password', false, 'Passwords do not match');
  } else {
    showValidation('confirm-password', true, 'Passwords match!');
  }
});

termsCheckbox.addEventListener('change', (e) => {
  validation.terms = e.target.checked;
  updateSubmitButton();
});

// Handle login link click
loginLink.addEventListener('click', (e) => {
  e.preventDefault();
  
  // Check if login.html exists, otherwise show alert
  // In a real application, you would always have this file
  const loginExists = true; // Set to true when you create login.html
  
  if (loginExists) {
    window.location.href = 'login.html';
  } else {
    alert('Login page is not yet created. Please create a login.html file.');
    // Optionally, you could redirect to a different page:
    // window.location.href = 'index.html';
  }
});

// Form submission handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Final validation check
  if (!Object.values(validation).every(v => v)) {
    showMessage('Please fix all validation errors before submitting.', 'error');
    return;
  }

  // Show loading state
  loader.style.display = 'inline-block';
  btnText.textContent = 'Creating Account...';
  submitBtn.disabled = true;

  const formData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value
  };

  try {
    showMessage('Creating your account...', 'info');
    
    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name
        }
      }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // Step 2: Insert user profile into custom users table (if user was created)
    const userId = authData.user?.id;
    if (userId) {
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ 
          id: userId, 
          name: formData.name, 
          email: formData.email,
          role: "user",
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Profile insert error:', insertError);
        showMessage('Account created but profile setup incomplete. Please contact support.', 'error');
        return;
      }
    }

    // Success message
    showMessage('✅ Account created successfully! Please check your email to verify your account.', 'success');
    
    // Reset form and validation states
    resetForm();
    
    // Redirect after delay (update URL to your actual home page)
    setTimeout(() => {
      // Change 'home.html' to your actual home page
      const homePageExists = false; // Set to true when you have a home page
      
      if (homePageExists) {
        window.location.href = "home.html";
      } else {
        showMessage('Registration complete! Home page not yet created.', 'info');
      }
    }, 3000);

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error types
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      errorMessage = 'This email is already registered. Try logging in instead.';
    } else if (error.message.includes('Password should be at least')) {
      errorMessage = 'Password is too weak. Please choose a stronger password.';
    } else if (error.message.includes('Invalid email')) {
      errorMessage = 'Invalid email address. Please check and try again.';
    } else if (error.message.includes('signup is disabled')) {
      errorMessage = 'New registrations are temporarily disabled. Please try again later.';
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Too many attempts. Please wait a few minutes and try again.';
    }
    
    showMessage(errorMessage, 'error');
    
  } finally {
    // Reset loading state
    loader.style.display = 'none';
    btnText.textContent = 'Create Account';
    submitBtn.disabled = !Object.values(validation).every(v => v); // Re-enable only if form is valid
  }
});

// Function to reset form after successful registration
function resetForm() {
  form.reset();
  
  // Reset validation state
  Object.keys(validation).forEach(key => {
    validation[key] = false;
  });
  
  // Hide all validation messages
  document.querySelectorAll('.validation-message').forEach(el => {
    el.classList.remove('show');
  });
  
  // Reset input styles
  document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]').forEach(input => {
    input.classList.remove('valid', 'invalid');
  });
  
  // Hide password strength indicator
  document.getElementById("password-strength").style.display = 'none';
  
  // Update submit button state
  updateSubmitButton();
}

// Initialize the form
document.addEventListener('DOMContentLoaded', () => {
  updateSubmitButton();
  
  // Focus on first input
  nameInput.focus();
});

// Handle browser back/forward buttons
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    // Page was loaded from cache, reset form state
    resetForm();
  }
});

// Export functions for testing (if needed)
export { 
  validateEmail, 
  validatePassword, 
  updatePasswordStrength,
  showMessage,
  resetForm 
};

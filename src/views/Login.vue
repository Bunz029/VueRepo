<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-container">
          <img 
            src="/img/isu-e-logo.png" 
            alt="ISU-E Campus Map Logo" 
            class="logo-image"
            @error="onImageError"
          />
        </div>
        <h1>ISU-E Campus Map</h1>
        <h2>Admin Panel</h2>
        <p>Sign in to access the admin dashboard</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="loginForm.email"
            type="email"
            placeholder="Enter your email address"
            required
            :disabled="isLoading"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              required
              :disabled="isLoading"
              class="form-input"
            />
            <button
              type="button"
              @click="togglePassword"
              class="password-toggle"
              :disabled="isLoading"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="loginForm.remember"
              type="checkbox"
              :disabled="isLoading"
            />
            <span class="checkmark"></span>
            Remember me for 30 days
          </label>
        </div>
        
        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="login-button"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
        
        <div v-if="errorMessage" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ errorMessage }}
        </div>
      </form>
      
      <div class="login-footer">
        <p>© 2024 ISU E-MAP Admin Panel</p>
        <p class="help-text">
          Need help? Contact IT Support
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      loginForm: {
        email: '',
        password: '',
        remember: false
      },
      showPassword: false,
      isLoading: false,
      errorMessage: ''
    }
  },
  computed: {
    isFormValid() {
      return this.loginForm.email && 
             this.loginForm.password && 
             this.loginForm.email.includes('@')
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    
    onImageError(event) {
      // Hide the image if it fails to load and show a fallback
      event.target.style.display = 'none'
      console.warn('Logo image not found. Please check the file exists at: public/img/isu-e-logo.png')
    },
    
    async handleLogin() {
      if (!this.isFormValid) return
      this.isLoading = true
      this.errorMessage = ''
      try {
        const { default: auth } = await import('../services/authService')
        await auth.login({
          email: this.loginForm.email,
          password: this.loginForm.password
        })
        const redirect = this.$route.query.redirect || '/maps'
        this.$router.push(redirect)
      } catch (err) {
        this.errorMessage = 'Invalid credentials'
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2d5016 0%, #4a7c59 50%, #c8102e 100%);
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

/* Logo Container */
.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.logo-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.logo-image:hover {
  transform: scale(1.05);
}

.login-header h1 {
  color: #2c3e50;
  font-size: 2.2em;
  font-weight: 700;
  margin: 0 0 8px 0;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.025em;
}

.login-header h2 {
  color: #c8102e;
  font-size: 1.3em;
  font-weight: 600;
  margin: 0 0 8px 0;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.01em;
}

.login-header p {
  color: #7f8c8d;
  font-size: 0.95em;
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.95em;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.01em;
}

.form-input {
  padding: 14px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
  background: #fafbfc;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  letter-spacing: -0.01em;
}

.form-input:focus {
  outline: none;
  border-color: #c8102e;
  background: white;
  box-shadow: 0 0 0 3px rgba(200, 16, 46, 0.1);
}

.form-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 1.1em;
  color: #6c757d;
  transition: color 0.2s ease;
}

.password-toggle:hover:not(:disabled) {
  color: #c8102e;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  margin-top: -5px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9em;
  color: #5a6c7d;
  margin: 0;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #c8102e;
}

.login-button {
  background: linear-gradient(135deg, #c8102e 0%, #a00d26 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 1.05em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.01em;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(200, 16, 46, 0.3);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #fc8181;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}

.error-icon {
  font-size: 1.1em;
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}

.login-footer p {
  color: #7f8c8d;
  font-size: 0.85em;
  margin: 4px 0;
}

.help-text {
  font-size: 0.8em !important;
  color: #95a5a6 !important;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
    padding: 15px;
  }
  
  .login-card {
    padding: 30px 25px;
  }
  
  .login-header h1 {
    font-size: 1.8em;
  }
  
  .login-header h2 {
    font-size: 1.1em;
  }
}
</style>


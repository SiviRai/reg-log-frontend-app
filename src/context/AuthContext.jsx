import React, { createContext, useContext, useState, useEffect } from 'react';
import { hashPassword, generateJWT, generateOTP, validatePasswordSecurity } from '../utils/crypto';

const AuthContext = createContext(null);

const STORAGE_KEY_USERS = 'luxecart_users_db';
const STORAGE_KEY_ACTIVE = 'luxecart_active_session';
const STORAGE_KEY_JWT = 'luxecart_jwt_token';
const STORAGE_KEY_OTP = 'luxecart_password_otp';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize database and session
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Seed initial demo user if DB is empty
        const existingUsers = localStorage.getItem(STORAGE_KEY_USERS);
        if (!existingUsers) {
          const initialHashedPassword = await hashPassword('Password123!');
          const seedUsers = [
            {
              id: 'usr_demo_101',
              name: 'Sivi Rai',
              email: 'sivi@luxecart.com',
              mobile: '9876543210',
              passwordHash: initialHashedPassword,
              createdAt: new Date().toISOString()
            }
          ];
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(seedUsers));
        }

        // 2. Load active session
        const savedSession = localStorage.getItem(STORAGE_KEY_ACTIVE);
        const savedJwt = localStorage.getItem(STORAGE_KEY_JWT);

        if (savedSession && savedJwt) {
          setCurrentUser(JSON.parse(savedSession));
          setJwtToken(savedJwt);
        }
      } catch (err) {
        console.error('Error during Auth initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Helper: Get users from database
   */
  const getUsers = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  /**
   * 1. Register User
   * Validates uniqueness of Email and Mobile, hashes password, saves to DB
   */
  const register = async ({ fullName, email, mobile, password }) => {
    try {
      const users = getUsers();
      const cleanEmail = email.trim().toLowerCase();
      const cleanMobile = mobile.trim();

      // Check unique email
      const isEmailTaken = users.some((u) => u.email.toLowerCase() === cleanEmail);
      if (isEmailTaken) {
        return {
          success: false,
          message: 'An account with this email address already exists. Please login instead.'
        };
      }

      // Check unique mobile number
      const isMobileTaken = users.some((u) => u.mobile === cleanMobile);
      if (isMobileTaken) {
        return {
          success: false,
          message: 'An account with this mobile number already exists. Please login instead.'
        };
      }

      // Validate password rules
      const passwordCheck = validatePasswordSecurity(password);
      if (!passwordCheck.isValid) {
        return {
          success: false,
          message: passwordCheck.message
        };
      }

      // Encrypt (Hash) password before storing
      const encryptedPassword = await hashPassword(password);

      const newUser = {
        id: `usr_${Date.now()}`,
        name: fullName.trim(),
        email: cleanEmail,
        mobile: cleanMobile,
        passwordHash: encryptedPassword,
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));

      return {
        success: true,
        message: 'Account registered successfully! You can now login.'
      };
    } catch (err) {
      console.error('Registration failed:', err);
      return {
        success: false,
        message: 'A system error occurred while creating your account. Please try again.'
      };
    }
  };

  /**
   * 2. User Login
   * Allows login with Email OR Mobile Number + Password
   * Generates JWT token and creates session
   */
  const login = async (identifier, password) => {
    try {
      const users = getUsers();
      const cleanId = identifier.trim().toLowerCase();

      // Find user by Email or Mobile number
      const matchedUser = users.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          u.mobile === identifier.trim()
      );

      if (!matchedUser) {
        return {
          success: false,
          message: 'No account found with this email or mobile number.'
        };
      }

      // Verify encrypted password
      const enteredHash = await hashPassword(password);
      if (enteredHash !== matchedUser.passwordHash) {
        return {
          success: false,
          message: 'Invalid password. Please verify your credentials and try again.'
        };
      }

      // Generate JWT Access Token
      const token = generateJWT(matchedUser);

      // Create Active Session object
      const sessionUser = {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        mobile: matchedUser.mobile,
        loggedInAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(sessionUser));
      localStorage.setItem(STORAGE_KEY_JWT, token);

      setCurrentUser(sessionUser);
      setJwtToken(token);

      return {
        success: true,
        message: 'Login successful! Generating session...'
      };
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        message: 'A system error occurred during authentication.'
      };
    }
  };

  /**
   * 3. Logout
   * Invalidates session and clears JWT token
   */
  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_ACTIVE);
      localStorage.removeItem(STORAGE_KEY_JWT);
      localStorage.removeItem(STORAGE_KEY_OTP);
      setCurrentUser(null);
      setJwtToken(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  /**
   * 4. Forgot Password - Request OTP
   * Accepts registered email or mobile number and generates OTP
   */
  const requestPasswordOTP = (identifier) => {
    try {
      const users = getUsers();
      const cleanId = identifier.trim().toLowerCase();

      const matchedUser = users.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          u.mobile === identifier.trim()
      );

      if (!matchedUser) {
        return {
          success: false,
          message: 'No registered user found with this email or mobile number.'
        };
      }

      // Generate One-Time Password
      const otp = generateOTP();
      const otpRecord = {
        userId: matchedUser.id,
        email: matchedUser.email,
        mobile: matchedUser.mobile,
        otp: otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
      };

      localStorage.setItem(STORAGE_KEY_OTP, JSON.stringify(otpRecord));

      return {
        success: true,
        otp: otp,
        targetEmail: matchedUser.email,
        targetMobile: matchedUser.mobile,
        message: `OTP generated successfully! Demo OTP: ${otp}`
      };
    } catch (err) {
      console.error('OTP request error:', err);
      return {
        success: false,
        message: 'Failed to generate OTP. Please try again.'
      };
    }
  };

  /**
   * 4b. Verify OTP
   */
  const verifyPasswordOTP = (identifier, enteredOtp) => {
    try {
      const storedOtpData = localStorage.getItem(STORAGE_KEY_OTP);
      if (!storedOtpData) {
        return { success: false, message: 'No OTP request found. Please request an OTP first.' };
      }

      const record = JSON.parse(storedOtpData);

      if (Date.now() > record.expiresAt) {
        return { success: false, message: 'OTP has expired. Please request a new OTP.' };
      }

      const cleanId = identifier.trim().toLowerCase();
      const matchesTarget =
        record.email.toLowerCase() === cleanId ||
        record.mobile === identifier.trim();

      if (!matchesTarget) {
        return { success: false, message: 'Identifier mismatch with the requested OTP.' };
      }

      if (record.otp.trim() !== enteredOtp.trim()) {
        return { success: false, message: 'Invalid OTP entered. Please check and try again.' };
      }

      return {
        success: true,
        message: 'OTP verified successfully! You can now reset your password.'
      };
    } catch (err) {
      console.error('OTP verification error:', err);
      return { success: false, message: 'Failed to verify OTP.' };
    }
  };

  /**
   * 5. Reset Password
   * Updates user password in database and invalidates existing sessions
   */
  const resetPassword = async (identifier, newPassword) => {
    try {
      // Validate password rules
      const passwordCheck = validatePasswordSecurity(newPassword);
      if (!passwordCheck.isValid) {
        return {
          success: false,
          message: passwordCheck.message
        };
      }

      const users = getUsers();
      const cleanId = identifier.trim().toLowerCase();
      const userIndex = users.findIndex(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          u.mobile === identifier.trim()
      );

      if (userIndex === -1) {
        return { success: false, message: 'User record not found.' };
      }

      // Hash new password
      const newHash = await hashPassword(newPassword);

      users[userIndex].passwordHash = newHash;
      users[userIndex].updatedAt = new Date().toISOString();

      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

      // Invalidate existing sessions
      logout();

      return {
        success: true,
        message: 'Password reset successful! Please login with your new password.'
      };
    } catch (err) {
      console.error('Reset password error:', err);
      return { success: false, message: 'Failed to reset password.' };
    }
  };

  /**
   * 6. Change Password (for logged-in user)
   * Verifies current password, validates new password, and updates DB
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!currentUser) {
        return { success: false, message: 'You must be logged in to change your password.' };
      }

      const users = getUsers();
      const userIndex = users.findIndex((u) => u.id === currentUser.id);

      if (userIndex === -1) {
        return { success: false, message: 'Active user account not found in database.' };
      }

      // Verify current password
      const currentHash = await hashPassword(currentPassword);
      if (currentHash !== users[userIndex].passwordHash) {
        return { success: false, message: 'Current password is incorrect.' };
      }

      // Validate new password rules
      const passwordCheck = validatePasswordSecurity(newPassword);
      if (!passwordCheck.isValid) {
        return { success: false, message: passwordCheck.message };
      }

      // Ensure new password is not identical to current password
      if (currentPassword === newPassword) {
        return {
          success: false,
          message: 'New password cannot be the same as your current password.'
        };
      }

      // Encrypt and update
      const newHash = await hashPassword(newPassword);
      users[userIndex].passwordHash = newHash;
      users[userIndex].updatedAt = new Date().toISOString();

      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

      return {
        success: true,
        message: 'Password changed successfully!'
      };
    } catch (err) {
      console.error('Change password error:', err);
      return { success: false, message: 'Failed to change password.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        jwtToken,
        isAuthenticated: !!currentUser,
        loading,
        register,
        login,
        logout,
        requestPasswordOTP,
        verifyPasswordOTP,
        resetPassword,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

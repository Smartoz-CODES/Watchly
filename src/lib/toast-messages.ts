import type { ToastType } from "../context/ToastContext";

export interface ToastMessage {
  title: string;
  description: string;
  type: ToastType;
}

// Authentication (SignupPage, LoginPage, PasswordRecoveryPage)
export const AUTH_TOASTS = {
  accountCreated: {
    title: "Account created",
    description: "Welcome to Watchly, let's find your community next.",
    type: "success",
  },
  phoneVerified: {
    title: "Phone number verified",
    description: "Your OTP was confirmed successfully.",
    type: "success",
  },
  signedIn: (communityName: string): ToastMessage => ({
    title: "Signed in",
    description: `Welcome back to ${communityName}.`,
    type: "success",
  }),
  passwordReset: {
    title: "Password reset",
    description: "You can now sign in with your new password.",
    type: "success",
  },
  incorrectCode: {
    title: "Incorrect code",
    description: "That OTP doesn't match. Check the code and try again.",
    type: "error",
  },
  codeExpired: {
    title: "Code expired",
    description: "This OTP is no longer valid.",
    type: "error",
  },
  signInFailed: {
    title: "Sign-in failed",
    description: "Incorrect email or password.",
    type: "error",
  },
  accountAlreadyExists: {
    title: "Account already exists",
    description: "This phone number is already registered.",
    type: "error",
  },
  accountNotFound: {
    title: "Account not found",
    description: "This email is not registered",
    type: "error",
  },
  codeSent: (maskedPhone: string): ToastMessage => ({
    title: "Code sent",
    description: `A 6-digit code was sent to ${maskedPhone}.`,
    type: "info",
  }),
  resendingCode: {
    title: "Resending code",
    description: "This may take a few seconds.",
    type: "info",
  },
  tooManyOtpRequests: {
    title: "Too many attempts",
    description: "You've requested too many codes this hour. Try again later.",
    type: "error",
  },
  checkYourEmail: {
    title: "Check your email",
    description: "Password reset instructions sent to your email.",
    type: "info",
  },
} satisfies Record<string, ToastMessage | ((...args: never[]) => ToastMessage)>;

// Corroboration (IncidentDetailPage, useCorroboration)
export const CORROBORATION_TOASTS = {
  recorded: {
    title: "Corroboration recorded",
    description:
      "Thanks, this is a supporting signal, not a verification decision.",
    type: "success",
  },
  alreadyCorroborated: {
    title: "Already corroborated",
    description: "You can only corroborate an incident once.",
    type: "error",
  },
  ownReport: {
    title: "Cannot corroborate own report.",
    description: "You are not allowed to confirm an incident that you reported",
    type: "error",
  },
} satisfies Record<string, ToastMessage>;

// Community (CommunityDetailPage, CommunitySearchPage)
export const COMMUNITY_TOASTS = {
  joined: (communityName: string): ToastMessage => ({
    title: `You've joined ${communityName}`,
    description: "You'll now see their feed and receive alerts.",
    type: "success",
  }),
  left: (communityName: string): ToastMessage => ({
    title: `You've left ${communityName}`,
    description: "You can rejoin anytime.",
    type: "success",
  }),
  inviteLinkCopied: {
    title: "Invite link copied",
    description: "Share it with residents to bring them into your community.",
    type: "info",
  },
} satisfies Record<string, ToastMessage | ((...args: never[]) => ToastMessage)>;

// Reporting and Evidence
export const REPORTING_TOASTS = {
  submitted: {
    title: "Report submitted",
    description: "Your neighbours and community admin have been notified.",
    type: "success",
  },
  submitFailed: {
    title: "Report couldn't be submitted",
    description:
      "Check your connection and try again. Your details are still saved.",
    type: "error",
  },
  photoFailed: {
    title: "Photo failed to upload",
    description:
      "You can submit your report without images or try uploading again.",
    type: "error",
  },
  fileTooLarge: {
    title: "File too large.",
    description:
      "Each image must be under 5MB. Compress photo or choose a smaller file and try again.",
    type: "error",
  },
  offline: {
    title: "You're offline",
    description: "Your report will send automatically once you're back online.",
    type: "info",
  },
} satisfies Record<string, ToastMessage>;

// Admin (AdminReviewPage, useStatusUpdate)
export const ADMIN_TOASTS = {
  markedVerified: {
    title: "Marked Verified",
    description:
      "An SMS alert has been sent to residents in the affected area.",
    type: "success",
  },
  markedResolved: {
    title: "Incident marked Resolved",
    description: "This closes the incident's status history.",
    type: "success",
  },
  markedNotVerified: {
    title: "Marked Not Verified",
    description: "The reporter has been notified with your reason.",
    type: "error",
  },
  reasonRequiredNotVerified: {
    title: "A reason is required",
    description: "Add a short note before marking this Not Verified.",
    type: "error",
  },
  reasonRequiredVerified: {
    title: "A reason is required",
    description: "Add a short note before marking this Verified.",
    type: "error",
  },
} satisfies Record<string, ToastMessage>;

// Account and System, app-wide session handling
export const ACCOUNT_TOASTS = {
  profileUpdated: {
    title: "Profile updated",
    description: "Your profile has been updated successfully.",
    type: "success",
  },
  connectionLost: {
    title: "Connection lost",
    description:
      "Reconnecting... some actions may not save until you're back online.",
    type: "error",
  },
  sessionExpired: {
    title: "Session expired",
    description: "Please sign in again to continue.",
    type: "info",
  },
} satisfies Record<string, ToastMessage>;

// Generic client-side validation
export const VALIDATION_TOASTS = {
  missingFields: {
    title: "Missing information",
    description: "Please fill in all fields to continue.",
    type: "error",
  },
  invalidEmail: {
    title: "Invalid email",
    description: "Enter a valid email address.",
    type: "error",
  },
  invalidPhone: {
    title: "Invalid phone number",
    description: "Enter a valid Nigerian phone number.",
    type: "error",
  },
  passwordTooShort: {
    title: "Password too short",
    description: "Password must be at least 8 characters.",
    type: "error",
  },
  privacyPolicyRequired: {
    title: "Privacy Policy required",
    description: "Please agree to the Privacy Policy to continue.",
    type: "error",
  },
  emailRequired: {
    title: "Email required",
    description: "Please enter your email to continue.",
    type: "error",
  },
  resendFailed: {
    title: "Resend failed",
    description: "Failed to resend code. Please try again.",
    type: "error",
  },
  updateFailed: {
    title: "Update failed",
    description: "Failed to update password. Please try again.",
    type: "error",
  },
  sendLinkFailed: {
    title: "Couldn't send link",
    description: "Failed to send reset link. Please try again.",
    type: "error",
  },
} satisfies Record<string, ToastMessage>;

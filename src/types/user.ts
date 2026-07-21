export interface User {
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  phone_verified: boolean;
  email_verified: boolean;
  profile_image_url: string | null;
  is_platform_admin: boolean;
  date_joined: string;
}

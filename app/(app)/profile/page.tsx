import { ProfileForm } from "./profile-form";
import { getProfile } from "@/lib/db/profile";

export default async function ProfilePage() {
  const profile = await getProfile();
  return <ProfileForm initial={profile} />;
}

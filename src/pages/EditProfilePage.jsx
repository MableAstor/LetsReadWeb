import useEditProfile from "../hooks/useEditProfile";
import EditProfileView from "../components/profile/EditProfileView";

export default function EditProfilePage() {
  const model = useEditProfile();
  return <EditProfileView model={model} />;
}

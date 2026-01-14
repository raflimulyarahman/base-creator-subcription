// page.tsx (SERVER COMPONENT)
import RegistForm from "@/app/pages/regist/registForm";
import ProtectedRoute from "@/store/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["Users"]}>
          <RegistForm />
    </ProtectedRoute>
  );
}

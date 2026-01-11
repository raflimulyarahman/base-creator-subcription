"use client";
import ToastSuccess from "@/components/ui/Toast";
import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import ProtectedRoute from "@/store/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function RegistCreators() {
  const { isDark } = useLight();
  const router = useRouter();
  const { user, setUser, updateProfileUsers } = useUsers();
  const [showToast, setShowToast] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const formData = new FormData();

      if (firstNameRef.current)
        formData.append("first_name", firstNameRef.current.value);
      if (lastNameRef.current)
        formData.append("last_name", lastNameRef.current.value);
      if (usernameRef.current)
        formData.append("username", usernameRef.current.value);
      if (selectedFile) formData.append("foto", selectedFile);

      const updatedUser = await updateProfileUsers(user.id_users, formData);

      if (updatedUser) {
        setUser(updatedUser);
        setShowToast(true);
        router.push("/dashboard/users/subscribe");
      } else {
        console.error("Failed to update profile: backend returned null");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Users"]}>
      <div className="w-full md:px-8 lg:px-16 py-10 px-8">
        <div className="justify-center items-center">
          <ToastSuccess
            show={showToast}
            onClose={() => setShowToast(false)}
            message="Successfully updated profile"
          />
        </div>
        <div className="mt-1">
          <div
            className={`min-h-screen ${isDark ? "text-white" : "text-black"}`}
          >
            <div className="p-2">
              <section className="max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium">First Name</label>
                    <input
                      ref={firstNameRef}
                      className={`w-full px-4 py-1 rounded-md ${
                        isDark ? "bg-gray-800" : "bg-white"
                      } border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500`}
                      placeholder="input first your name ..."
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium">Last Name</label>
                    <input
                      ref={lastNameRef}
                      className={`w-full px-4 py-1 rounded-md ${
                        isDark ? "bg-gray-800" : "bg-white"
                      } border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500`}
                      placeholder="input last your name ..."
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-xs font-medium">Username</label>
                    <input
                      ref={usernameRef}
                      className={`w-full px-4 py-1 rounded-md ${
                        isDark ? "bg-gray-800" : "bg-white"
                      } border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500`}
                      placeholder="input your username ..."
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {/* Hidden file input */}
                      <input
                        ref={usernameRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            console.log("Selected file:", e.target.files[0]);
                          }
                        }}
                      />

                      {/* Custom button */}
                      <button
                        onClick={() => usernameRef.current?.click()}
                        className={`px-4 py-2 rounded-md font-medium text-sm ${
                          isDark
                            ? "bg-gray-800 text-white hover:bg-gray-700"
                            : "bg-white text-black hover:bg-gray-100"
                        } border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500`}
                      >
                        Upload Images
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="
      font-mono
      px-3 py-1.5
      text-sm
      bg-blue-900
      text-white
      rounded-md
      font-semibold
      hover:bg-blue-700
      transition
    "
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

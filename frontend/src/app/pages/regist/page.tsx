"use client";
import ToastSuccess from "@/components/ui/Toast";
import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import { useWallet } from "@/context/WalletContext";
import ProtectedRoute from "@/store/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function RegistCreators() {
  const { isDark } = useLight();
  const { role, userId, setRole } = useWallet();
  const router = useRouter();
  const { updateProfileUsers } = useUsers();
  const [showToast, setShowToast] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  console.log(userId, "user");
  const handleSubmit = async () => {
    if (!role || role !== "Users") {
      return
    };
    if (!userId) {
      console.error("User ID is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("first_name", firstNameRef.current?.value || "");
      formData.append("last_name", lastNameRef.current?.value || "");
      formData.append("username", usernameRef.current?.value || "");
      if (selectedFile) {
        formData.append("foto", selectedFile);
      }
      const registeredCreator = await updateProfileUsers(userId, formData);
      setRole(registeredCreator?.role ?? null);
      console.log(registeredCreator?.role, "role");
      setShowToast(true);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };



  return (
    <ProtectedRoute allowedRoles={["Users"]}>
      <div className="w-full md:px-8 lg:px-16 py-10 px-8">
        <div className="justify-center items-center">
          <ToastSuccess
            show={showToast}
            onClose={() => setShowToast(false)}
            message="Successfully registation creator"
          />
        </div>
        <div className="mt-1">
          <div
            className={`min-h-screen ${isDark ? "text-white" : "text-black"}`}
          >
            <div className="p-2">
              <section className="max-w-4xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">First Name</label>
                      <input
                        ref={firstNameRef}
                        className={`w-full px-4 py-1 rounded-md ${isDark ? "bg-gray-800" : "bg-white"
                          } border border-black/10`}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">Last Name</label>
                      <input
                        ref={lastNameRef}
                        className={`w-full px-4 py-1 rounded-md ${isDark ? "bg-gray-800" : "bg-white"
                          } border border-black/10`}
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-xs font-medium">Username</label>
                      <input
                        ref={usernameRef}
                        className={`w-full px-4 py-1 rounded-md ${isDark ? "bg-gray-800" : "bg-white"
                          } border border-black/10`}
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-2">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSelectedFile(e.target.files[0]);
                            console.log("Selected file:", e.target.files[0]);
                          }
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="px-4 py-2 border rounded-md"
                      >
                        Upload Image
                      </button>
                    </div>

                    {/* 🔥 BUTTON SUBMIT */}
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="submit"
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
                </form>
              </section>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

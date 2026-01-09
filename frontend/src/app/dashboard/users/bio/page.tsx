"use client";
import ToastSuccess from "@/components/ui/toastSuccess";
import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import ProtectedRoute from "@/utils/ProtectedRoute";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Based from "../../../../../public/based.png";

export default function BioCreators() {
  const { isDark } = useLight();
  const router = useRouter();
  const { user, setUser, updateProfileUsers } = useUsers();
  const [showToast, setShowToast] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const jenis_kelaminRef = useRef<HTMLInputElement>(null);
  const birth_yearsRef = useRef<HTMLInputElement>(null);
  const bio = useRef<HTMLInputElement>(null);
  console.log("User Data:", user);

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
      if (emailRef.current) formData.append("email", emailRef.current.value);
      if (jenis_kelaminRef.current)
        formData.append("jenis_kelamin", jenis_kelaminRef.current.value);
      if (birth_yearsRef.current)
        formData.append("birth_years", birth_yearsRef.current.value);
      if (bio.current) formData.append("bio", bio.current.value);
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
    <ProtectedRoute allowedRoles={["Users", "Creators"]}>
      <div className="justify-center items-center">
        <ToastSuccess
          show={showToast}
          onClose={() => setShowToast(false)}
          message="Successfully updated profile"
        />
      </div>
      <div className="w-full md:px-8 lg:px-16 py-10 px-8">
        <div className="mt-1">
          <div
            className={`min-h-screen ${isDark ? "text-white" : "text-black"}`}
          >
            <div className="p-2">
              <section className="max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={firstNameRef}
                      className={`w-full px-4 py-3 rounded-md ${
                        isDark ? "bg-gray-800" : "bg-white"
                      } border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500`}
                      defaultValue={user?.first_name}
                      placeholder="input first your name ..."
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={lastNameRef}
                      className={`w-full px-4 py-3 rounded-md ${
                        isDark ? "bg-gray-800" : "bg-white"
                      } border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500`}
                      defaultValue={user?.last_name}
                      placeholder="input last your name ..."
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={usernameRef}
                      className={`w-full px-4 py-3 rounded-md ${
                        isDark ? "bg-gray-800" : "bg-white"
                      } border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500`}
                      defaultValue={user?.username}
                      placeholder="input your username ..."
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={emailRef}
                      className={`w-full px-4 py-3 rounded-md ${
                        isDark ? "bg-gray-800" : "bg-white"
                      } border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500`}
                      defaultValue={user?.email}
                      placeholder="input email your ..."
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Gender <span className="text-red-500">* F / M</span>
                    </label>
                    <input
                      ref={jenis_kelaminRef}
                      className={`w-full px-4 py-3 rounded-md ${
                        isDark ? "bg-gray-800" : "bg-white"
                      } border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500`}
                      defaultValue={user?.jenis_kelamin}
                      placeholder="input your gender ..."
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Birt Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={birth_yearsRef}
                      defaultValue={user?.birth_years}
                      type="date"
                      className={`w-full px-4 py-3 rounded-md ${
                        isDark ? "bg-gray-800" : "bg-white"
                      } border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500`}
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-sm font-medium">Bio</label>
                    <textarea
                      rows={4}
                      ref={bio}
                      defaultValue={user?.bio}
                      className={`w-full px-4 py-3 rounded-md ${
                        isDark ? "bg-gray-800" : "bg-white"
                      } border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500`}
                      placeholder="Tell us about yourself..."
                    />
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
                  Send Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

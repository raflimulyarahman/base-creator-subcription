"use client";
import { useLight } from "@/context/LightContext";
import ProtectedRoute from "@/utils/ProtectedRoute";
import Image from "next/image";
import Based from "../../../../../public/based.png";
export default function Profile() {
  const { isDark } = useLight();
  return (
    <ProtectedRoute allowedRoles={["Users","Creators"]}>
      <div className="w-full md:px-8 lg:px-16 py-10 px-8">
        <div className="mt-1">
          <div className={`min-h-screen ${ isDark ? "text-white" : "text-black"}`}>
            <div className="p-2">
              {/* Profile Picture */}
              <div className="flex items-center gap-6 mb-10">
                <div>
                  <h3 className="font-mono font-semibold text-lg">
                    Profile Picture
                  </h3>
                  <p className="font-mono text-sm mb-3">
                    We only support PNGs, JPEGs and GIFs under 10MB
                  </p>
                  <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                      <Image
                        src={Based}
                        alt="Avatar"
                        width={140}
                        height={140}
                        className="rounded-full object-cover ring-4 ring-red-500/30 transition group-hover:ring-red-500"
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <span className="text-sm font-medium text-white">
                          Change
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 w-full">
                      <button className="font-mono w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-900 text-white rounded-lg text-sm font-semibold active:scale-[0.98] hover:bg-blue-800 transition">
                        Change Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <section className="max-w-4xl">
                <h2 className="font-mono text-2xl font-semibold mb-1">
                  Personal Info
                </h2>
                <p className="font-mono text-sm mb-6">
                  Manage your personal details
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-md bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500"
                      defaultValue="Eko Purnama"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-md bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500"
                      defaultValue="Azi"
                    />
                  </div>

                  {/* Username */}
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Username
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-md bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500"
                      defaultValue="@ekopurnamaazi-y4g4o"
                    />
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-md bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500"
                      defaultValue="epaweb3js@gmail.com"
                    />
                  </div>

                  {/* Phone */}
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Phone
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-md bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500"
                      defaultValue="+62 852 8194 4451"
                    />
                  </div>

                  {/* Date Birth */}
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-md bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Country */}
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Country
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-md bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-red-500"
                      defaultValue="Indonesia"
                    />
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 rounded-md bg-white border border-black/10 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              </section>

              {/* Save Button */}
              <div className="mt-4 bottom-6 right-6">
                <button className="font-mono px-6 py-3 bg-blue-900 text-white rounded-md font-semibold hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

import Image from "next/image";

export default function GrupCreator() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 z-10">
        <div className="flex items-center gap-4 md:gap-6">
          <Image
            src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
            alt="Creator Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h1 className="font-bold text-lg md:text-xl text-gray-900">Group Creator 1</h1>
            <span className="text-sm md:text-base text-gray-400">90 Members</span>
          </div>
        </div>
        <button className="text-blue-500 font-semibold hover:text-blue-600 transition">
          Info
        </button>
      </div>


      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 flex flex-col gap-3 mb-20">
        {/* Creator message */}
        <div className="flex justify-start">
          <div className="max-w-[70%] px-4 py-2 rounded-xl bg-gray-200 text-gray-900 rounded-bl-none">
            Hello! How can I help you today?
          </div>
        </div>

        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[70%] px-4 py-2 rounded-xl bg-blue-500 text-white rounded-br-none">
            Hi! I need some advice.
          </div>
        </div>

        {/* Another Creator message */}
        <div className="flex justify-start">
          <div className="max-w-[70%] px-4 py-2 rounded-xl bg-gray-200 text-gray-900 rounded-bl-none">
            Sure! What kind of advice are you looking for?
          </div>
        </div>

        {/* Another User message */}
        <div className="flex justify-end">
          <div className="max-w-[70%] px-4 py-2 rounded-xl bg-blue-500 text-white rounded-br-none">
            About improving productivity in AI projects.
          </div>
        </div>
      </div>

      {/* Input Box - fixed at bottom */}
      <div className="fixed bottom-0 left-0 w-full flex items-center px-4 md:px-8 py-3 gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-full cursor-not-allowed">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>

        </button>
      </div>
    </div>
  );
}

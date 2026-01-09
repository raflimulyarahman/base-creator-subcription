import Image from "next/image";
export default function Chating() {
  return (
    <div className="w-screen py-6 md:py-8">

      <div className="flex items-center gap-3 px-4 md:px-8 mb-2">
        <h1 className="text-lg font-bold md:text-xl text-gray-900">
          Chat With AI Agent
        </h1>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 text-gray-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>

      <div
        className="
      flex gap-4 px-4 md:px-8 py-2
      overflow-x-auto
      snap-x snap-mandatory
      touch-pan-x
      overscroll-x-contain
      scrollbar-hide
      scroll-px-4
    "
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="
          min-w-[60vw] sm:min-w-[200px] md:min-w-[180px]
          h-[220px] md:h-[240px]
          snap-start
          rounded-xl
          border-2 border-gray-500
          shadow-md
          hover:shadow-xl
          transition-shadow
          flex-shrink-0
          overflow-hidden
          flex flex-col items-center justify-center
          text-center
        "
          >
            <Image
              src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
              alt={`Avatar ${i}`}
              width={100}
              height={100}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover mb-3"
            />

            <div className="px-3">
              <p className="text-sm md:text-base font-semibold truncate">
                AI Agent {i}
              </p>
              <p className="text-xs md:text-sm text-gray-500 line-clamp-2 mt-1">
                Smart assistant ready to help you
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 px-4 md:px-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
          Creator Groups
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center rounded-xl p-2 hover:gray-200 transition-shadow"
            >
              <div className="flex items-center">
                <Image
                  src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                  alt={`Avatar ${i}`}
                  width={40}
                  height={40}
                  className="w-15 h-15 md:w-24 md:h-24 rounded-full object-cover mr-4"
                />
                <div className="flex flex-col justify-center">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                    Creator Content Group {i}
                  </h3>
                  <p className="text-xs text-gray-500">Creator: Jakarta</p>
                  <p className="text-xs text-gray-500">Shared post might like</p>
                </div>
              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 px-4 md:px-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
          Direct Message With Creator
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center rounded-xl p-2 hover:gray-200 transition-shadow"
            >
              <div className="flex items-center">
                <Image
                  src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                  alt={`Avatar ${i}`}
                  width={40}
                  height={40}
                  className="w-15 h-15 md:w-24 md:h-24 rounded-full object-cover mr-4"
                />
                <div className="flex flex-col justify-center">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                    Creator {i}
                  </h3>
                  <p className="text-lg text-gray-500">Last Post</p>
                </div>
              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
}

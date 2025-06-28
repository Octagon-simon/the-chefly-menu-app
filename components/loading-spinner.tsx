import Image from "next/image"

export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-2">
      {/* Logo on top */}
      <Image
        src="/cheflymenuapp-transparent.png"
        width={150}
        height={150}
        alt="Chefly Logo"
        objectFit="cover"
      />

      {/* Spinner below */}
      <div className="flex flex-col items-center space-y-2">
        <p className="text-md sm:text-lg">Please wait</p>
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-black" />
      </div>
    </div>
  )
}

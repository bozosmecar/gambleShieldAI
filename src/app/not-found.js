import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-no-repeat bg-fixed"
      style={{
        paddingTop: "70px",
        backgroundImage: "url('/1_Home%20page/404.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center justify-center text-center w-full max-w-2xl min-h-[500px]">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
          Page Not Found
        </h1>
        <p className="text-gray-200 text-lg mb-8 max-w-md drop-shadow">
          Looks like this page doesn&apos;t exist. Maybe it got lost in the shuffle.
        </p>
        <Link
          href="/"
          className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

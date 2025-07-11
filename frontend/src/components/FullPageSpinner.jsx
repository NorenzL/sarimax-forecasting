export default function FullPageSpinner() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
      <p className="mt-4 text-white text-lg">Generating Forecast...</p>
    </div>
  );
}

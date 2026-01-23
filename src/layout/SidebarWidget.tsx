import useAuthStore from "../stores/useAuthStore";

export default function SidebarWidget() {
  const { user } = useAuthStore();

  const currentPlan = user?.plan?.toLowerCase() || "trial";

  const getButtonText = () => {
    if (currentPlan === "pro") return "Upgrade Plan";
    if (currentPlan === "plus") return null;
    return "Purchase Plan";
  };

  const buttonText = getButtonText();

  return (
    <div className={`mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-600 dark:to-brand-700 p-5 shadow-xl shadow-brand-500/20 dark:shadow-brand-900/30 relative overflow-hidden ${
      buttonText ? 'min-h-[160px]' : ''
    }`}>
      
      {/* glass shine */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-white/0 via-white/5 to-white/0 rotate-45 pointer-events-none"></div>

      {/* FLEX CONTAINER */}
      <div className={`relative z-10 flex flex-col h-full text-center pt-2 ${
        !buttonText ? 'justify-center' : ''
      }`}>
        
        <h3 className="mb-4 font-bold text-white text-lg tracking-tight">
          {currentPlan === "plus"
            ? "Plus Active"
            : `${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan`}
        </h3>

        {buttonText && (
          <p className="text-white/80 dark:text-white/70 text-sm">
            {currentPlan === "trial"
              ? "Upgrade for more features."
              : "Advanced premium features."}
          </p>
        )}

        {/* BUTTON STAYS VISIBLE */}
        {buttonText && (
          <div className="mt-auto pt-4">
            <a
              href="/pricing"
              className="flex items-center justify-center w-full p-3 font-bold text-brand-700 dark:text-brand-800 bg-white dark:bg-gray-100 rounded-xl text-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-200 hover:shadow-lg active:scale-95 shadow-md shadow-black/10"
            >
              {buttonText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

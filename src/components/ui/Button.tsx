export const Button = ({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  href?: string;
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        pointer-events-auto
        select-none rounded-2xl border-4 border-black
        px-4 py-2 text-xl font-black text-black
        shadow-[0_6px_0_0_#000]
        transition
        hover:-translate-y-px
        active:translate-y-1 active:shadow-none
        ${className}
      `}
    >
      {children}
    </button>
  );
};

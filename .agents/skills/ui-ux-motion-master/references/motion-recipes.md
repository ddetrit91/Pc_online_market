# Motion & Interactive UI Recipes

Concrete Tailwind CSS and React animation patterns tailored for high-tech web applications.

---

## 1. Interactive Button Micro-Interactions

### Cyber Glowing Button
```tsx
export const CyberButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="group relative inline-flex items-center justify-center px-6 py-3 font-semibold text-white overflow-hidden rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
    >
      {/* Animated gradient border */}
      <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl" />
      
      {/* Light sheen sweep */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      
      {/* Content */}
      <span className="relative flex items-center gap-2 text-sm tracking-wide">
        {children}
      </span>
    </button>
  );
};
```

---

## 2. Bento Card with Magnetic Hover & Glow

```tsx
export const BentoCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  icon?: any;
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800/80 bg-white dark:bg-gray-900/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 ${className}`}
    >
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
      
      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-200">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
```

---

## 3. Smooth Skeleton Loading (Shimmer Effect)

```tsx
export const HardwareSkeleton = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/50 p-6 space-y-4">
      <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      <div className="h-40 w-full bg-gray-200/60 dark:bg-gray-800/60 rounded-xl animate-pulse" />
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
      </div>
      
      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
    </div>
  );
};
```

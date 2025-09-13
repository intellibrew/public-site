import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-indigo-200 via-sky-200 to-cyan-200 text-zinc-900 " +
          "shadow-[0_6px_20px_-6px_rgba(2,132,199,0.35)] " +
          "hover:from-indigo-400 hover:via-sky-400 hover:to-cyan-400 " +
          "hover:shadow-[0_0_25px_4px_rgba(56,189,248,0.55)]",
        primary600:
          "bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 text-white " +
          "shadow-[0_8px_24px_-8px_rgba(2,132,199,0.55)] " +
          "hover:from-indigo-500 hover:via-sky-500 hover:to-cyan-500 " +
          "hover:shadow-[0_0_28px_6px_rgba(56,189,248,0.6)]",
        outline:
          "relative border-0 bg-white text-zinc-900 " +
          "before:content-[''] before:absolute before:inset-0 before:rounded-full before:p-[1.5px] " +
          "before:bg-gradient-to-r before:from-indigo-200 before:via-sky-200 before:to-cyan-200 before:-z-10 " +
          "before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] " +
          "before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] " +
          "shadow-[0_6px_20px_-6px_rgba(2,132,199,0.25)] " +
          "hover:before:from-indigo-400 hover:before:via-sky-400 hover:before:to-cyan-400 " +
          "hover:shadow-[0_0_22px_5px_rgba(56,189,248,0.5)]",
        ghost: "hover:bg-zinc-100 text-zinc-900",
        link: "text-sky-600 underline-offset-4 hover:underline",
        destructive: "bg-red-600 text-white hover:bg-red-600/90",
      },
      size: {
        default: "h-11 px-6 text-sm",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"
export { Button, buttonVariants }

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type InputWithFeedbackProps = ComponentProps<typeof Input> & {
  errorMessage?: string;
  isError?: boolean;
  isLoading?: boolean;
  helperText?: ReactNode;
  trailingElement?: ReactNode;
};

export function InputWithFeedback({
  errorMessage,
  helperText,
  isError,
  isLoading,
  trailingElement,
  className,
  ...props
}: InputWithFeedbackProps) {
  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          className={cn("w-full", className, {
            "border-red-500": isError,
            "pr-10": isLoading || trailingElement,
          })}
          {...props}
        />

        {isLoading && (
          <Loader2 className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 animate-spin h-4 w-4" />
        )}

        {!isLoading && trailingElement && (
          <div className="absolute top-1/2 right-2 -translate-y-1/2">
            {trailingElement}
          </div>
        )}
      </div>

      {isError && (
        <p className="absolute -bottom-6 text-xs text-red-500">
          {errorMessage}
        </p>
      )}
      {!isError && helperText && (
        <p className="text-muted-foreground absolute -bottom-6 text-xs">
          {helperText}
        </p>
      )}
    </div>
  );
}

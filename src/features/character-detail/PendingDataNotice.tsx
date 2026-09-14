import { cn } from "@/components/ui/cn";
import { STATE_CHIP } from "@/components/ui/tokens";

interface Props {
  /** What is missing, e.g. "命之座". */
  subject: string;
  /** What the absence means for the simulation result. */
  consequence: string;
  className?: string;
}

/**
 * Honest empty state for data that is genuinely not present yet.
 *
 * Deliberately NOT a skeleton or a spinner: nothing is loading, and animating a
 * placeholder would imply the data is on its way in this session. It states
 * what is absent and — the part that makes it actionable — what that absence
 * does to the numbers on screen.
 */
export function PendingDataNotice({ subject, consequence, className }: Props) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
        STATE_CHIP.info,
        className,
      )}
    >
      <p className="leading-relaxed">
        <span className="font-semibold">{subject}尚未录入。</span> {consequence}
      </p>
    </div>
  );
}

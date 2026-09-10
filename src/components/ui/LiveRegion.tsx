interface Props {
  /** Latest announcement. Empty string renders nothing audible. */
  message: string;
}

/**
 * Single polite live region. All mutations of an owning feature funnel their
 * announcements through one of these so screen readers are not spammed by
 * several competing regions.
 */
export function LiveRegion({ message }: Props) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

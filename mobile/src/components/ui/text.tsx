import { Text as RNText, type TextProps } from 'react-native';

import { cn } from '@/lib/cn';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

const weightClass: Record<Weight, string> = {
  regular: 'font-sans',
  medium: 'font-pmedium',
  semibold: 'font-psemibold',
  bold: 'font-pbold',
  extrabold: 'font-pextrabold',
};

// `text-ink` is the default body color. When a caller supplies another text
// color, the generated CSS can order the default after the caller's class and
// silently override it, so only add the default when no color was supplied.
const explicitColorClass =
  /(?:^|\s)text-(?:brand-(?:blue|green|orange|purple|red)|black|current|ink|muted|navy|subtle|transparent|white|yellow)(?:\/\d+)?(?=\s|$)|(?:^|\s)text-\[(?:#|rgb|hsl)[^\]]*\](?=\s|$)/;

type AppTextProps = TextProps & {
  weight?: Weight;
  className?: string;
};

export function Text({ weight = 'regular', className, ...props }: AppTextProps) {
  const hasExplicitColor = className ? explicitColorClass.test(className) : false;

  return (
    <RNText
      className={cn(weightClass[weight], !hasExplicitColor && 'text-ink', className)}
      {...props}
    />
  );
}

export function Heading({
  className,
  weight = 'semibold',
  ...props
}: AppTextProps & { weight?: Weight }) {
  return <Text weight={weight} className={cn('text-navy', className)} {...props} />;
}

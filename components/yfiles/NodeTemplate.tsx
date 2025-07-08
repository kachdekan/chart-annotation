import type { ReactComponentNodeStyleProps } from '@/utils/ReactComponentNodeStyle'

export interface CustomNodeProps<TTag = any> extends ReactComponentNodeStyleProps<TTag> {
  borderColor?: string
  backgroundColor?: string
  textColor?: string
}

export const NodeTemplate = <TTag extends { text?: string }>({
  width,
  height,
  //selected,
  tag,
  borderColor = 'border-black',
  backgroundColor = 'bg-white',
  textColor = 'text-black'
}: CustomNodeProps<TTag>) => {
  // (In a real implementation, you might want to map these to actual CSS classes)
  const borderColorValue = getColorValue(borderColor)
  const backgroundColorValue = getColorValue(backgroundColor)
  const textColorValue = getColorValue(textColor)

  return (
    <g>
      {/* Background rectangle with border */}
      <rect
        width={width}
        height={height}
        rx="8" // rounded corners
        fill={backgroundColorValue}
        stroke={borderColorValue} // blue border when selected
        strokeWidth={1.5}
      />
      
      {/* Text content */}
      <text
        x={width / 2}
        y={height / 2}
        fill={textColorValue}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Inter, sans-serif"
        fontSize="12"
      >
        {tag?.text || ''}
      </text>
    </g>
  )
}

// Helper function to convert Tailwind-like classes to CSS values
function getColorValue(twClass: string): string {
  const colorMap: Record<string, string> = {
    'bg-white': '#ffffff',
    'bg-black': '#000000',
    'bg-slate-100': '#f1f5f9',
    'bg-blue-50': '#eff6ff',
    'text-black': '#000000',
    'text-white': '#ffffff',
    'border-black': '#000000',
    'border-slate-200': '#e2e8f0',
    // Add more mappings as needed
  }
  return colorMap[twClass] || twClass // fallback to the input if not found
}
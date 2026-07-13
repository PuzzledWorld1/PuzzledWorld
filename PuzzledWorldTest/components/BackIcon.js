import Svg, { Polyline } from 'react-native-svg';


// A plain "<" chevron, hand-drawn with react-native-svg to match
// ShareIcon's line style instead of using an emoji.
export default function BackIcon({ size = 18, color = '#ffffff' }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <Polyline
        points="16,5 8,12 16,19"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

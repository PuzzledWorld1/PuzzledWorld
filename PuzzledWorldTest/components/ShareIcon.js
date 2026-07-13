import Svg, { Circle, Line } from 'react-native-svg';


// The standard "share" icon (a single node on the left connected to two
// nodes on the right, forming a "<" shape with a dot on each of its
// three ends) - not a Unicode emoji, so drawn by hand with react-native-svg
// (already a dependency, used by JigsawPiece) instead of pulling in an
// icon-font library for one glyph.
export default function ShareIcon({ size = 18, color = '#ffffff' }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <Line
        x1={7}
        y1={12}
        x2={17}
        y2={6}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />

      <Line
        x1={7}
        y1={12}
        x2={17}
        y2={18}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />

      <Circle
        cx={7}
        cy={12}
        r={2.6}
        fill={color}
      />

      <Circle
        cx={17}
        cy={6}
        r={2.6}
        fill={color}
      />

      <Circle
        cx={17}
        cy={18}
        r={2.6}
        fill={color}
      />
    </Svg>
  );
}

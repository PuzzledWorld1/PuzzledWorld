import Svg, { Path } from 'react-native-svg';

export default function JigsawPiece({ size = 100 }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
    >
      <Path
        d="
          M 0 0
          H 35
          C 35 15, 65 15, 65 0
          H 100

          V 35
          C 85 35, 85 65, 100 65
          V 100

          H 65
          C 65 85, 35 85, 35 100
          H 0

          V 65
          C 15 65, 15 35, 0 35
          Z
        "
        fill="#8b5cf6"
      />
    </Svg>
  );
}
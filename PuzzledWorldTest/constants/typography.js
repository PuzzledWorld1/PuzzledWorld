// React 19 removed defaultProps support for function components, and RN's
// Text component (Libraries/Text/Text.js) is a function component with no
// defaultProps of its own - so there's no single global "set the app's
// default font" switch anymore. This wraps a screen's style definitions
// (BEFORE StyleSheet.create) and injects fontFamily into every entry
// instead, so applying/changing the app's font is still a one-line change
// per screen rather than touching every individual style.
//
// Geomini ships as a single variable-weight font with no @expo-google-fonts
// package - two static instances (400/600) were extracted from it with
// fontTools and given clean, distinct internal name-table identities
// (see assets/fonts/), since the original variable font's internal name
// ("Geomini ExtraLight") didn't match the "Geomini" key it was registered
// under and silently failed to render as the custom font on-device.
// Custom fonts don't respond to fontWeight: 'bold' the way system fonts
// do, so any style already marked fontWeight: 'bold' gets the SemiBold
// family instead, to keep that "this should look bold" intent working.
// Critically, the original fontWeight: 'bold' has to be REMOVED (not just
// have fontFamily added alongside it) - leaving both set makes RN try to
// resolve a synthetic bold variant of the custom family, which doesn't
// exist under that name and silently falls back to the system font
// instead of the custom one.
const FONT_REGULAR = 'Geomini';
const FONT_BOLD = 'GeominiSemiBold';

export function withAppFont(styles) {
  const result = {};

  for (const key of Object.keys(styles)) {
    const { fontWeight, ...rest } = styles[key];
    const isBold = fontWeight === 'bold';

    result[key] = {
      ...rest,
      fontFamily: isBold ? FONT_BOLD : FONT_REGULAR,
      fontWeight: isBold ? 'normal' : fontWeight,
    };
  }

  return result;
}

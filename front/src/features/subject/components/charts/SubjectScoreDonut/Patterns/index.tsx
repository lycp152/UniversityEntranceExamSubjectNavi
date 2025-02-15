import { FC } from 'react';
import { COLORS } from '@/features/subject/constants';

const Patterns: FC = () => (
  <defs>
    {/* 英語用のストライプパターン */}
    <pattern
      id="pattern-英語"
      patternUnits="userSpaceOnUse"
      width="8"
      height="8"
      patternTransform="rotate(45)"
    >
      <rect width="8" height="8" fill={COLORS.英語} />
      <line x1="0" y="0" x2="0" y2="8" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
    </pattern>

    {/* 数学用のドットパターン */}
    <pattern id="pattern-数学" patternUnits="userSpaceOnUse" width="8" height="8">
      <rect width="8" height="8" fill={COLORS.数学} />
      <circle cx="4" cy="4" r="1.5" fill="white" fillOpacity="0.5" />
    </pattern>

    {/* 国語用のクロスパターン */}
    <pattern id="pattern-国語" patternUnits="userSpaceOnUse" width="8" height="8">
      <rect width="8" height="8" fill={COLORS.国語} />
      <path d="M0,0 L8,8 M8,0 L0,8" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
    </pattern>

    {/* 理科用の波線パターン */}
    <pattern id="pattern-理科" patternUnits="userSpaceOnUse" width="8" height="8">
      <rect width="8" height="8" fill={COLORS.理科} />
      <path d="M0,4 Q2,0 4,4 T8,4" stroke="white" strokeWidth="1" strokeOpacity="0.5" fill="none" />
    </pattern>

    {/* 地歴公用の格子パターン */}
    <pattern id="pattern-地歴公" patternUnits="userSpaceOnUse" width="8" height="8">
      <rect width="8" height="8" fill={COLORS.地歴公} />
      <path
        d="M0,0 M0,8 L8,8 L8,0 L0,0"
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.5"
        fill="none"
      />
    </pattern>
  </defs>
);

export default Patterns;

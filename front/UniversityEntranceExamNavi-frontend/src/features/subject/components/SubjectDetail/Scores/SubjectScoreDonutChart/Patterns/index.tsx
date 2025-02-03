import { FC } from 'react';
import { SUBJECT_PATTERNS, TEST_TYPE_PATTERNS, PATTERN_CONFIG } from '../constants';

const Patterns: FC = () => (
  <>
    {/* 科目別パターン */}
    {Object.entries(SUBJECT_PATTERNS).map(([subject, config]) => (
      <pattern
        key={subject}
        id={`pattern-${subject}`}
        patternUnits="userSpaceOnUse"
        width={config.pattern.width}
        height={config.pattern.height}
        patternTransform={config.pattern.transform}
        dangerouslySetInnerHTML={{ __html: config.pattern.content(config.color) }}
      />
    ))}
    {/* テスト種別パターン */}
    {Object.entries(TEST_TYPE_PATTERNS).map(([type, config]) => (
      <pattern
        key={type}
        id={`pattern-${type}`}
        patternUnits="userSpaceOnUse"
        width={config.pattern.width}
        height={config.pattern.height}
        patternTransform={config.pattern.transform}
        dangerouslySetInnerHTML={{ __html: config.pattern.content(config.color) }}
      />
    ))}
  </>
);

export default Patterns;

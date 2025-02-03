export type PatternConfig = {
  color: string;
  pattern: {
    width: number;
    height: number;
    transform?: string;
    content: (color: string) => string;
  };
};

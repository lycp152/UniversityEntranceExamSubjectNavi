interface SectionTitleProps {
  children: React.ReactNode;
}

export const SectionTitle = ({ children }: SectionTitleProps) => {
  return <h2 className="text-lg font-semibold mb-1">{children}</h2>;
};

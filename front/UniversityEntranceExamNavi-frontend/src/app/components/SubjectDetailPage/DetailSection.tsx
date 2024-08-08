const DetailSection = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) => (
  <p className="mb-2">
    <strong>{label}:</strong> {value ?? "情報なし"}
  </p>
);

export default DetailSection;

import Select from "./Select";

function StatusSelect({
  value,
  onChange,
  options = [],
  id = "status",
  className = "",
}) {
  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      containerClassName={className}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Select>
  );
}

export default StatusSelect;
    

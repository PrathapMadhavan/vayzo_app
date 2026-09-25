import Select from "./Select";

function StatusSelect({
  name,
  value,
  onChange,
  label,
  options = [],
  id = "status",
  className = "",
}) {
  return (
    <Select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      label={label}
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
    

export function exportToCSV(data, filename) {
  if (!data || !data.length) {
    alert("No data available to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Escape CSV strings
  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '""';
    const stringified = String(str);
    if (stringified.includes('"') || stringified.includes(',') || stringified.includes('\n')) {
      return `"${stringified.replace(/"/g, '""')}"`;
    }
    return `"${stringified}"`;
  };

  // Convert array of objects to CSV string
  const csvRows = [];
  csvRows.push(headers.join(',')); // Add headers

  for (const row of data) {
    const values = headers.map(header => {
      // Flatten nested objects if necessary (e.g., stats)
      const val = row[header];
      if (typeof val === 'object' && val !== null) {
        return escapeCsv(JSON.stringify(val));
      }
      return escapeCsv(val);
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.style.visibility = 'hidden';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

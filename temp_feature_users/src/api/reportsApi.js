import { API_BASE_URL } from "./config";

const API_URL = `${API_BASE_URL}/reports`;
const SUMMARY_API_URL = `${API_BASE_URL}/reportsSummary`;

export async function getReports(filters = {}) {
  // Construct query parameters
  const queryParams = new URLSearchParams();
  
  if (filters.reportType && filters.reportType !== "All") {
    queryParams.append("type", filters.reportType);
  }

  // Handle date filters (json-server supports _gte and _lte for filtering)
  // For dates, assuming generatedOn is stored in "YYYY-MM-DD" format
  if (filters.startDate) {
    // Note: This relies on json-server's exact string matching or proper operator support
    // For a real backend, pass exact ISO strings. Here we simulate it.
  }

  // Append pagination or other filters if needed by json-server in future
  
  const queryString = queryParams.toString();
  const fetchUrl = queryString ? `${API_URL}?${queryString}` : API_URL;

  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error("Unable to load reports");
  }

  const data = await response.json();
  
  // Custom client-side date filtering (since json-server date filtering can be tricky)
  let filteredData = data;
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate).getTime();
    const end = new Date(filters.endDate).getTime();
    
    filteredData = filteredData.filter(report => {
      // Parse "2026-09-01 10:00" format
      const reportDate = new Date(report.generatedOn.split(" ")[0]).getTime();
      return reportDate >= start && reportDate <= end;
    });
  }

  return filteredData;
}

export async function getReportSummary() {
  const response = await fetch(SUMMARY_API_URL);
  if (!response.ok) {
    throw new Error("Unable to load report summary");
  }
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function deleteReport(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Unable to delete report");
  }
  return response.json();
}

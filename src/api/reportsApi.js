import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/reports";
const SUMMARY_ENDPOINT = "/api/v1/admin/reports-summary";

export async function getReports(filters = {}) {
  // Construct query parameters
  const queryParams = new URLSearchParams();
  
  if (filters.reportType && filters.reportType !== "All") {
    queryParams.append("type", filters.reportType);
  }

  const queryString = queryParams.toString();
  const fetchUrl = queryString ? `${ENDPOINT}?${queryString}` : ENDPOINT;

  const data = await apiRequest(fetchUrl, {}, "Unable to load reports");
  
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
  const data = await apiRequest(SUMMARY_ENDPOINT, {}, "Unable to load report summary");
  return Array.isArray(data) ? data[0] : data;
}

export async function deleteReport(id) {
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: "DELETE",
  }, "Unable to delete report");
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  UserCheck,
  BarChart3,
  Undo2,
  Download,
  Info,
  RotateCcw,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import Avatar from "../components/ui/Avatar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import Button from "../components/ui/Button";
import DateRangeInput from "../components/ui/DateRangeInput";
import Select from "../components/ui/Select";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";

import { getEarnings } from "../api/earningsApi";

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount || 0));

const formatDelta = (curr, prev) => {
  const diff = curr - prev;
  const pct = prev > 0 ? (diff / prev) * 100 : 0;
  return {
    diff: diff > 0 ? `+${formatAmount(diff)}` : formatAmount(diff),
    pct: (
      <span className="flex items-center gap-0.5">
        {diff >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {Math.abs(pct).toFixed(2)}%
      </span>
    ),
    isPositive: diff >= 0
  };
};

const PIE_COLORS = ["#5b21b6", "#3b82f6", "#f59e0b", "#ef4444"];

export default function Earnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [compareWith, setCompareWith] = useState("Previous Period");
  const [earningsType, setEarningsType] = useState("All Earnings");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        setLoading(true);
        const result = await getEarnings();
        setData(result);
      } catch (err) {
        setError("Failed to load earnings data");
      } finally {
        setLoading(false);
      }
    };
    loadEarnings();
  }, []);

  const hasFilters = 
    fromDate !== "" || 
    toDate !== "" || 
    compareWith !== "Previous Period" || 
    earningsType !== "All Earnings";

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setCompareWith("Previous Period");
    setEarningsType("All Earnings");
  };

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        setLoading(true);
        const result = await getEarnings();
        // Mimic API filtering behavior
        setData(result);
      } catch (err) {
        setError("Failed to load earnings data");
      } finally {
        setLoading(false);
      }
    };
    loadEarnings();
  }, [compareWith, fromDate, toDate, earningsType]);

  if (loading) return <div className="p-6 text-muted">Loading earnings...</div>;
  if (error || !data) return <div className="p-6 text-danger">{error || "No data"}</div>;

  const { stats, chartData, summary, topPartners } = data;

  const pieData = [
    { name: "Delivery Earnings", value: stats.partner },
    { name: "Platform Commission", value: stats.platform },
    { name: "Other Earnings", value: summary.other.current }
  ];

  // Pagination Logic
  const totalPages = Math.ceil(topPartners.length / itemsPerPage);
  const paginatedPartners = topPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 pb-20">
      
      {/* Stat Cards Row */}
      <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          variant="horizontal"
          title="Total Earnings"
          value={`₹${stats.total.toLocaleString('en-IN', {minimumFractionDigits: 2})}`}
          trend="15.3%"
          icon={Wallet}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <StatCard
          variant="horizontal"
          title="Delivery Partner Earnings"
          value={`₹${stats.partner.toLocaleString('en-IN', {minimumFractionDigits: 2})}`}
          trend="13.6%"
          icon={UserCheck}
          colorClass="text-success"
          bgClass="bg-success/10"
        />
        <StatCard
          variant="horizontal"
          title="Platform Commission"
          value={`₹${stats.platform.toLocaleString('en-IN', {minimumFractionDigits: 2})}`}
          trend="18.7%"
          icon={BarChart3}
          colorClass="text-info"
          bgClass="bg-info/10"
        />
        <StatCard
          variant="horizontal"
          title="Refunds & Adjustments"
          value={`-₹${stats.refunds.toLocaleString('en-IN', {minimumFractionDigits: 2})}`}
          trend="4.2%"
          isNegative
          icon={Undo2}
          colorClass="text-danger"
          bgClass="bg-danger/10"
        />
      </div>

      {/* Filters Top Bar */}
      <Card noPadding className="mb-6 p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted">Date Range</label>
              <DateRangeInput
                fromValue={fromDate}
                toValue={toDate}
                onFromChange={(e) => setFromDate(e.target.value)}
                onToChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted">Compare With</label>
              <Select 
                options={["Previous Period", "Previous Year"]} 
                value={compareWith} 
                onChange={(e) => setCompareWith(e.target.value)} 
                className="w-full sm:w-[180px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted">Type</label>
              <Select 
                options={["All Earnings", "Platform Commission", "Delivery Earnings"]} 
                value={earningsType} 
                onChange={(e) => setEarningsType(e.target.value)} 
                className="w-full sm:w-[180px]"
              />
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {hasFilters && (
              <Button variant="secondary" onClick={resetFilters} className="gap-2 shrink-0 shadow-sm border border-border h-10">
                <RotateCcw size={16} /> Reset
              </Button>
            )}
            <Button variant="secondary" className="gap-2 bg-surface text-foreground font-medium px-4 h-10 shadow-sm border border-border shrink-0 w-full sm:w-auto">
              <Download size={16} /> Export Report
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        
        {/* Earnings Overview Chart */}
        <Card className="p-5 xl:col-span-2 flex flex-col h-[400px]">
          <div className="font-bold text-foreground mb-4">Earnings Overview</div>
          <div className="flex gap-6 mb-4 justify-center text-sm font-semibold">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary"></span> Total Earnings</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-success"></span> Partner Earnings</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-info"></span> Commission</span>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <RechartsTooltip 
                  formatter={(value) => formatAmount(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="total" stroke="#5b21b6" strokeWidth={2} dot={{ r: 4, fill: '#5b21b6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="partner" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="commission" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Earnings By Type Pie Chart */}
        <Card className="p-5 flex flex-col h-[400px]">
          <div className="font-bold text-foreground mb-6">Earnings by Type</div>
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 relative">
            <div className="h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatAmount(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-col gap-4">
              {pieData.map((item, index) => {
                 const percentage = ((item.value / stats.total) * 100).toFixed(1);
                 return (
                   <div key={item.name} className="flex flex-col">
                     <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                       <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: PIE_COLORS[index]}}></span>
                       {item.name}
                     </span>
                     <span className="text-sm font-bold text-foreground ml-4.5 mt-0.5">
                       {percentage}% <span className="text-xs font-medium text-muted">({formatAmount(item.value)})</span>
                     </span>
                   </div>
                 );
              })}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column Wrapper */}
        <div className="xl:col-span-2 flex flex-col justify-between">
          {/* Earnings Summary Table */}
          <Card className="p-0 overflow-hidden flex flex-col self-start w-full">
            <div className="p-5 border-b border-border font-bold text-foreground">
            Earnings Summary
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface text-muted font-medium border-b border-border">
                <tr>
                  <th className="px-5 py-4 font-medium text-foreground">Earning Type</th>
                  <th className="px-5 py-4 font-medium text-right text-foreground">This Period (12 May - 20 May)</th>
                  <th className="px-5 py-4 font-medium text-right text-foreground">Previous Period (04 May - 11 May)</th>
                  <th className="px-5 py-4 font-medium text-right text-foreground">Change %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-semibold">
                
                {/* Partner Earnings */}
                <tr >
                  <td className="px-5 py-4 text-foreground font-normal">Delivery Partner Earnings</td>
                  <td className="px-5 py-4 text-right text-foreground font-normal">{formatAmount(summary.partner.current)}</td>
                  <td className="px-5 py-4 text-right text-foreground font-normal">{formatAmount(summary.partner.previous)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-success">
                      <span className="text-xs">{formatDelta(summary.partner.current, summary.partner.previous).diff}</span>
                      <span className="text-xs font-semibold">{formatDelta(summary.partner.current, summary.partner.previous).pct}</span>
                    </div>
                  </td>
                </tr>

                {/* Platform Commission */}
                <tr >
                  <td className="px-5 py-4 text-foreground font-normal">Platform Commission</td>
                  <td className="px-5 py-4 text-right text-foreground font-normal">{formatAmount(summary.platform.current)}</td>
                  <td className="px-5 py-4 text-right text-foreground font-normal">{formatAmount(summary.platform.previous)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-success">
                      <span className="text-xs">{formatDelta(summary.platform.current, summary.platform.previous).diff}</span>
                      <span className="text-xs font-semibold">{formatDelta(summary.platform.current, summary.platform.previous).pct}</span>
                    </div>
                  </td>
                </tr>

                {/* Other Earnings */}
                <tr >
                  <td className="px-5 py-4 text-foreground font-normal">Other Earnings</td>
                  <td className="px-5 py-4 text-right text-foreground font-normal">{formatAmount(summary.other.current)}</td>
                  <td className="px-5 py-4 text-right text-foreground font-normal">{formatAmount(summary.other.previous)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-success">
                      <span className="text-xs">{formatDelta(summary.other.current, summary.other.previous).diff}</span>
                      <span className="text-xs font-semibold">{formatDelta(summary.other.current, summary.other.previous).pct}</span>
                    </div>
                  </td>
                </tr>

                {/* Refunds */}
                <tr >
                  <td className="px-5 py-4 text-foreground font-normal">Refunds & Adjustments</td>
                  <td className="px-5 py-4 text-right text-danger font-normal">-{formatAmount(summary.refunds.current)}</td>
                  <td className="px-5 py-4 text-right text-danger font-normal">-{formatAmount(summary.refunds.previous)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-danger">
                       {/* Refunds increase means bad (negative trend visually), but math diff is diff */}
                      <span className="text-xs">+{formatAmount(summary.refunds.current - summary.refunds.previous)}</span>
                      <span className="text-xs font-semibold flex items-center gap-0.5"><TrendingDown size={14} /> {(((summary.refunds.current - summary.refunds.previous)/summary.refunds.previous)*100).toFixed(2)}%</span>
                    </div>
                  </td>
                </tr>

              </tbody>
              <tfoot>
                <tr className="bg-primary/5 border-t-2 border-border font-bold">
                  <td className="px-5 py-4 text-foreground text-base">Total Earnings</td>
                  <td className="px-5 py-4 text-right text-foreground text-base">{formatAmount(stats.total)}</td>
                  <td className="px-5 py-4 text-right text-foreground text-base">{formatAmount(1021538)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-success">
                      <span className="text-xs">+{formatAmount(stats.total - 1021538)}</span>
                      <span className="text-sm font-semibold flex items-center gap-1">
                        <TrendingUp size={16} strokeWidth={2.5} /> 21.95%
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
        
        <div className="text-xs text-muted flex items-center gap-1.5 mt-6 xl:mb-4">
          <Info size={14} /> Earnings are updated every 24 hours. Last updated on <span className="font-semibold text-foreground">20 May 2024, 11:30 PM</span>
        </div>
      </div>

        {/* Top Earning Partners */}
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center bg-surface">
            <h3 className="font-bold text-foreground">Top Earning Delivery Partners</h3>
            <Link to="/delivery" className="text-primary text-sm hover:underline pr-2">View All</Link>
          </div>
          <div className="p-0 custom-scrollbar">
            <Table
              headers={["No.", "Partner", "Orders", "Earnings"]}
              currentCount={paginatedPartners.length}
              totalCount={topPartners.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              minWidth="auto"
              className="border-0 shadow-none rounded-none border-t-0"
            >
              {paginatedPartners.map((dp, index) => (
                <tr key={index} >
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">
                    {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full overflow-hidden border border-border shrink-0">
                        <Avatar src={dp.image} alt={dp.name} identifier={dp.id} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-normal text-foreground text-sm truncate">{dp.name}</span>
                        <span className="text-[10px] text-muted truncate">{dp.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center font-semibold text-muted">{dp.orders}</td>
                  <td className="px-5 py-4 text-right font-bold text-foreground">{formatAmount(dp.earnings)}</td>
                </tr>
              ))}
            </Table>
          </div>
        </Card>

      </div>
    </section>
  );
}

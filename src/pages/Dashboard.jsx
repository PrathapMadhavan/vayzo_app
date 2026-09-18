import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Wallet,
  Coins,
  CreditCard,
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  Download,
  Activity,
  XCircle,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getDashboardData } from "../api/dashboardApi";
import { exportToCSV } from "../utils/exportUtils";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import Select from "../components/ui/Select";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-danger/10 p-3 text-danger">
            <XCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Failed to load Dashboard
            </h3>
            <p className="text-muted">{error}</p>
          </div>
          <Button onClick={loadData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    stats,
    recentOrders,
    ordersByService,
    deliveryPartnerOverview,
    topRestaurants,
    recentTransactions,
    quickSummary,
    lineChartData,
    barChartData,
    pieData,
  } = data;

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders.value,
      trend: stats.totalOrders.trend,
      icon: ShoppingBag,
      colorClass: "text-primary",
      bgClass: "bg-primary-light",
    },
    {
      title: "Gross Revenue",
      value: stats.grossRevenue.value,
      trend: stats.grossRevenue.trend,
      icon: Wallet,
      colorClass: "text-warning",
      bgClass: "bg-warning/10",
    },
    {
      title: "Commission",
      value: stats.commission.value,
      trend: stats.commission.trend,
      icon: Coins,
      colorClass: "text-success",
      bgClass: "bg-success/10",
    },
    {
      title: "Net Revenue",
      value: stats.netRevenue.value,
      trend: stats.netRevenue.trend,
      icon: CreditCard,
      colorClass: "text-info",
      bgClass: "bg-info/10",
    },
    {
      title: "New Users",
      value: stats.newUsers.value,
      trend: stats.newUsers.trend,
      icon: Users,
      colorClass: "text-danger",
      bgClass: "bg-danger/10",
    },
  ];

  return (
    <div className="min-h-full space-y-6 bg-background p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            Welcome back, Prathap M 👋
          </h1>
          <p className="mt-1 text-sm text-muted">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: "this_week", label: "21 May 2024 - 27 May 2024" },
              { value: "last_week", label: "14 May 2024 - 20 May 2024" },
            ]}
          />
          <Button className="flex items-center gap-2" onClick={() => exportToCSV(recentOrders, "recent_orders.csv")}>
            <Download size={16} /> Download Report
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            colorClass={stat.colorClass}
            bgClass={stat.bgClass}
          />
        ))}
      </div>

      {/* Charts & Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line Chart */}
        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Orders Overview</h3>
            <Select
              options={[{ value: "this_week", label: "This Week" }]}
              className="w-32"
            />
          </div>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `${val / 1000}k` : val} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "8px" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "var(--color-foreground)" }} />
                <Line type="monotone" dataKey="thisWeek" name="This Week" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="lastWeek" name="Last Week" stroke="var(--color-border)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart */}
        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Revenue Overview</h3>
            <Select
              options={[{ value: "this_week", label: "This Week" }]}
              className="w-32"
            />
          </div>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}L`} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "8px" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "var(--color-foreground)" }} />
                <Bar dataKey="gross" name="Gross Revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="net" name="Net Revenue" fill="var(--color-success)" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Orders List */}
        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Orders</h3>
            <Link to="/orders" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {recentOrders.map((order, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{order.id}</p>
                    <p className="text-xs text-muted">{order.restaurant}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{order.amount}</p>
                  <p className="text-xs text-muted">{order.date}</p>
                </div>
                <div className="w-24 text-right">
                  <Badge variant={
                    order.status === 'Delivered' ? 'success' :
                    order.status === 'Out for Delivery' ? 'info' :
                    order.status === 'Preparing' ? 'warning' :
                    'default'
                  }>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Overview Row */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Orders by Service */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Orders by Service</h3>
            <Link to="/orders" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {ordersByService.map((service, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-muted border border-border">
                    <Activity size={16} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{service.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground">{service.value}</span>
                  <span className="flex items-center text-xs text-success"><TrendingUp size={12} className="mr-1"/>{service.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Users Overview (Donut) */}
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Users Overview</h3>
            <Link to="/users" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>
          <div className="relative flex h-48 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs text-muted">Total Users</span>
              <span className="text-lg font-bold text-foreground">45,231</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{backgroundColor: d.color}}></span>
                <span className="text-muted truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Delivery Partner Overview */}
        <Card>
          <h3 className="mb-4 font-semibold text-foreground">Delivery Partner Overview</h3>
          <div className="space-y-4">
            {deliveryPartnerOverview.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${item.color.replace('text-', 'bg-')}`}></div>
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Restaurants */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Top Performing Restaurants</h3>
            <Link to="/restaurants" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {topRestaurants.map((rest, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted">{rest.id}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-warning/10 text-warning">
                    <ShoppingBag size={14} />
                  </div>
                  <span className="text-sm font-medium text-foreground truncate max-w-[80px]">{rest.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{rest.orders} Orders</p>
                  <p className="text-xs text-success">{rest.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <div className="col-span-2">
          <Table 
            headers={[
              "Transaction ID",
              "Type",
              "Related To",
              "Amount",
              "Payment Method",
              "Status",
              "Date & Time"
            ]}
            currentCount={recentTransactions.length}
            totalCount={recentTransactions.length}
            minWidth="700px"
          >
            {recentTransactions.map((txn, idx) => (
              <tr key={idx} >
                <td className="px-3 py-3 text-center font-medium text-foreground">{txn.id}</td>
                <td className="px-3 py-3 text-center text-foreground">{txn.type}</td>
                <td className="px-3 py-3 text-center text-muted">{txn.related}</td>
                <td className="px-3 py-3 text-center font-medium text-foreground">{txn.amount}</td>
                <td className="px-3 py-3 text-center text-muted">{txn.method}</td>
                <td className="px-3 py-3 text-center">
                  <Badge variant={
                    txn.status === 'Success' ? 'success' :
                    txn.status === 'Refunded' ? 'warning' :
                    'default'
                  }>
                    {txn.status}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-center text-xs text-muted">{txn.date}</td>
              </tr>
            ))}
          </Table>
        </div>

        {/* Quick Summary */}
        <Card>
          <h3 className="mb-4 font-semibold text-foreground">Quick Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-danger">
                <XCircle size={18} />
                <span className="text-xs font-medium text-muted">Cancelled Orders</span>
              </div>
              <p className="text-xl font-bold text-foreground">{quickSummary.cancelledOrders.value}</p>
              <span className="flex items-center text-xs text-danger">
                <TrendingDown size={12} className="mr-1"/> {quickSummary.cancelledOrders.trend}
              </span>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-warning">
                <RotateCcw size={18} />
                <span className="text-xs font-medium text-muted">Return/Refunds</span>
              </div>
              <p className="text-xl font-bold text-foreground">{quickSummary.returnRefunds.value}</p>
              <span className="flex items-center text-xs text-danger">
                <TrendingDown size={12} className="mr-1"/> {quickSummary.returnRefunds.trend}
              </span>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-success">
                <Activity size={18} />
                <span className="text-xs font-medium text-muted">Average Order Value</span>
              </div>
              <p className="text-xl font-bold text-foreground">{quickSummary.avgOrderValue.value}</p>
              <span className="flex items-center text-xs text-success">
                <TrendingUp size={12} className="mr-1"/> {quickSummary.avgOrderValue.trend}
              </span>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-info">
                <RefreshCw size={18} />
                <span className="text-xs font-medium text-muted">Repeat Customers</span>
              </div>
              <p className="text-xl font-bold text-foreground">{quickSummary.repeatCustomers.value}</p>
              <span className="flex items-center text-xs text-success">
                <TrendingUp size={12} className="mr-1"/> {quickSummary.repeatCustomers.trend}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;

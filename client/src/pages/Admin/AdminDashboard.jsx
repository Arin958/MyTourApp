import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { ProgressSpinner } from "primereact/progressspinner";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Skeleton } from "primereact/skeleton";
import { Badge } from "primereact/badge";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get(`${API}/api/adminDashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setStats(response.data.data);
        initCharts(response.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const initCharts = (data) => {
    // Revenue Chart
    const revenueChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Revenue',
          data: data.monthlyRevenueData || Array(12).fill(0),
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: '#fff',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgb(99, 102, 241)',
          pointHoverBorderColor: '#fff',
          pointHitRadius: 10,
          pointBorderWidth: 2,
          tension: 0.3
        }
      ]
    };

    const revenueChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 2.5,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 12
          },
          callbacks: {
            label: function(context) {
              return ` $${context.raw.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              return `$${value.toLocaleString()}`;
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    };

    // Bookings Chart
    const bookingsChartData = {
      labels: ['Completed', 'Upcoming', 'Cancelled'],
      datasets: [
        {
          data: [
            data.completedBookings || 0,
            data.upcomingBookings || 0,
            data.cancelledBookings || 0
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          hoverBackgroundColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 0,
          cutout: '70%'
        }
      ]
    };

    setChartData({
      revenue: revenueChartData,
      bookings: bookingsChartData
    });

    setChartOptions({
      revenue: revenueChartOptions,
      bookings: {
        maintainAspectRatio: false,
        aspectRatio: 1.5,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const statusBodyTemplate = (rowData) => {
    const status = rowData.status?.toLowerCase();
    let severity = 'info';

    if (status === 'completed') severity = 'success';
    else if (status === 'cancelled') severity = 'danger';
    else if (status === 'upcoming') severity = 'warning';

    return <Tag value={rowData.status} severity={severity} rounded />;
  };

  const priceBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center">
        <span className="font-bold" style={{ color: '#4f46e5' }}>
          ${rowData.price}
        </span>
        {rowData.discount > 0 && (
          <Badge 
            value={`-${rowData.discount}%`} 
            severity="info" 
            className="ml-2" 
            size="small"
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <ProgressSpinner strokeWidth="4" animationDuration=".5s" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4 text-red-600 flex flex-column align-items-center justify-content-center" style={{ height: '80vh' }}>
        <i className="pi pi-exclamation-triangle text-4xl mb-3" />
        <h2>Failed to load dashboard statistics</h2>
        <p>Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex align-items-center mb-4">
        <div className="flex align-items-center justify-content-center bg-indigo-100 border-round" style={{ width: '3rem', height: '3rem' }}>
          <i className="pi pi-chart-line text-xl text-indigo-600" />
        </div>
        <div className="ml-3">
          <h1 className="text-3xl font-bold m-0 text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 m-0">Welcome back! Here's what's happening with your business today.</p>
        </div>
      </div>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
  <StatCard 
    label="Total Users" 
    value={stats.totalUsers} 
    icon="pi pi-users" 
    color="bg-blue-100"
    iconColor="text-blue-600"
    trend={stats.userGrowth > 0 ? 'up' : 'down'}
    trendValue={`${Math.abs(stats.userGrowth || 0).toFixed(1)}%`}
    className="p-4 rounded-2xl shadow hover:shadow-lg transition-shadow duration-300 border border-blue-200"
  />
  <StatCard 
    label="Total Tours" 
    value={stats.totalTours} 
    icon="pi pi-map" 
    color="bg-green-100"
    iconColor="text-green-600"
    trend={stats.tourGrowth > 0 ? 'up' : 'down'}
    trendValue={`${Math.abs(stats.bookingGrowth || 0).toFixed(1)}%`}
    className="p-4 rounded-2xl shadow hover:shadow-lg transition-shadow duration-300 border border-green-200"
  />
  <StatCard 
    label="Total Bookings" 
    value={stats.totalBookings} 
    icon="pi pi-ticket" 
    color="bg-purple-100"
    iconColor="text-purple-600"
    trend={stats.bookingGrowth > 0 ? 'up' : 'down'}
   trendValue={`${Math.abs(stats.tourGrowth || 0).toFixed(1)}%`}
    className="p-4 rounded-2xl shadow hover:shadow-lg transition-shadow duration-300 border border-purple-200"
  />
  <StatCard 
    label="Monthly Revenue" 
    value={`$${stats.monthlyRevenue?.toLocaleString() || 0}`} 
    icon="pi pi-money-bill" 
    color="bg-amber-100"
    iconColor="text-amber-600"
    trend={stats.revenueGrowth > 0 ? 'up' : 'down'}
    trendValue={`${Math.abs(stats.revenueGrowth)}%`}
    className="p-4 rounded-2xl shadow hover:shadow-lg transition-shadow duration-300 border border-amber-200"
  />
</div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
  <div className="col-span-2">
    <Card 
      title="Monthly Revenue" 
      className="h-full border-1 surface-border shadow-1 hover:shadow-3 transition-shadow"
      headerClassName="border-bottom-1 surface-border"
    >
      <div className="h-72">
        <Chart 
          type="line" 
          data={chartData.revenue} 
          options={chartOptions.revenue} 
        />
      </div>
    </Card>
  </div>
  <div>
    <Card 
      title="Bookings Overview" 
      className="h-full border-1 surface-border shadow-1 hover:shadow-3 transition-shadow"
      headerClassName="border-bottom-1 surface-border"
    >
      <div className="flex flex-column align-items-center justify-content-center h-72">
        <div className="w-44 h-44">
          <Chart 
            type="doughnut" 
            data={chartData.bookings} 
            options={chartOptions.bookings} 
          />
        </div>
        <div className="flex flex-wrap justify-content-center gap-3 mt-4">
          {chartData.bookings?.labels?.map((label, index) => (
            <div key={index} className="flex items-center text-sm">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: chartData.bookings.datasets[0].backgroundColor[index] }} 
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
</div>


      <Card 
        title="Recent Bookings" 
        className="mt-4 border-1 surface-border shadow-1"
        headerClassName="border-bottom-1 surface-border"
      >
        <DataTable
          value={stats.recentBookings}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} bookings"
          emptyMessage="No bookings found"
          responsiveLayout="scroll"
          className="p-datatable-sm"
          stripedRows
        >
          <Column field="User.name" header="Customer" sortable />
          <Column field="Tour.title" header="Tour" sortable />
          <Column field="createdAt" header="Date" body={(rowData) => formatDate(rowData.createdAt)} sortable />
          <Column field="price" header="Amount" body={priceBodyTemplate} sortable />
          <Column field="status" header="Status" body={statusBodyTemplate} sortable />
        </DataTable>
      </Card>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, iconColor, trend, trendValue }) => (
  <Card className="border-1 surface-border shadow-1 hover:shadow-3 transition-all transition-duration-300">
    <div className="flex justify-content-between align-items-center">
      <div className={`flex align-items-center justify-content-center border-round ${color}`} style={{ width: '3rem', height: '3rem' }}>
        <i className={`pi ${icon} text-xl ${iconColor}`} />
      </div>
      <div className="text-right">
        <span className="block text-600 font-medium mb-1">{label}</span>
        <div className="text-900 font-bold text-2xl">{value}</div>
        {trend && (
          <div className={`flex align-items-center justify-content-end mt-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            <i className={`pi pi-arrow-${trend} text-xs mr-1`} />
            <span className="text-xs font-medium">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  </Card>
);

export default AdminDashboard;
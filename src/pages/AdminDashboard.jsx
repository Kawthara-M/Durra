import { useEffect, useState } from "react"
import User from "../services/api"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"

import "../../public/stylesheets/dashboard.css"

const STATUS_ORDER = ["submitted", "processing", "picked-up", "delivered"]

const STATUS_LABELS = {
  submitted: "Submitted",
  processing: "Processing",
  "picked-up": "Picked Up",
  delivered: "Delivered",
}

const ORDER_TYPE_COLORS = {
  "Jewelry Only": "#21d79bff",
  "Service Only": "#f0a500",
  Both: "#9f0000ff",
}

const AdminDashboard = () => {
  const [ordersChartData, setOrdersChartData] = useState([])
  const [isOrdersLoading, setIsOrdersLoading] = useState(true)

  const [customersChartData, setCustomersChartData] = useState([])
  const [isCustomersLoading, setIsCustomersLoading] = useState(true)

  const [ordersPerShopData, setOrdersPerShopData] = useState([])
  const [orderTypeData, setOrderTypeData] = useState([])

  const [comparisonChartData, setComparisonChartData] = useState([])
  const [isComparisonLoading, setIsComparisonLoading] = useState(true)

  // orders column chart, orders column chart, order contents
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await User.get("/orders")
        const orders = response.data.orders || []

        const counts = orders.reduce((acc, order) => {
          const status = order.status
          if (!acc[status]) acc[status] = 0
          acc[status] += 1
          return acc
        }, {})

        const chartData = STATUS_ORDER.map((statusKey) => ({
          status: STATUS_LABELS[statusKey],
          key: statusKey,
          value: counts[statusKey] || 0,
        }))

        setOrdersChartData(chartData)

        const EXCLUDED_STATUSES = [
          "pending",
          "submitted",
          "rejected",
          "cancelled",
        ]

        const filtered = orders.filter(
          (order) => !EXCLUDED_STATUSES.includes(order.status)
        )

        let jewelryOnly = 0
        let serviceOnly = 0
        let both = 0

        filtered.forEach((order) => {
          const hasJewelry =
            Array.isArray(order.jewelryOrder) && order.jewelryOrder.length > 0
          const hasService =
            Array.isArray(order.serviceOrder) && order.serviceOrder.length > 0

          if (hasJewelry && hasService) {
            both += 1
          } else if (hasJewelry) {
            jewelryOnly += 1
          } else if (hasService) {
            serviceOnly += 1
          }
        })

        setOrderTypeData([
          { name: "Jewelry Only", value: jewelryOnly },
          { name: "Service Only", value: serviceOnly },
          { name: "Both", value: both },
        ])

        const perShopCounts = filtered.reduce((acc, order) => {
          const shopName = order.shop?.name || "Unknown Shop"

          if (!acc[shopName]) acc[shopName] = 0
          acc[shopName] += 1
          return acc
        }, {})

        const perShopData = Object.entries(perShopCounts).map(
          ([shop, value]) => ({
            shop,
            value,
          })
        )

        setOrdersPerShopData(perShopData)
      } catch (err) {
        console.error("Failed to fetch orders:", err)
      } finally {
        setIsOrdersLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // customers line chart
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await User.get("/profile/users")
        const users = response.data.users || response.data || []

        const customers = users.filter((u) => u.role === "Customer")
        if (!customers.length) {
          setCustomersChartData([])
          return
        }

        const monthCounts = new Map()
        let minDate = null
        let maxDate = null

        customers.forEach((customer) => {
          if (!customer.createdAt) return

          const date = new Date(customer.createdAt)
          if (isNaN(date)) return

          const year = date.getFullYear()
          const monthIndex = date.getMonth()

          const key = `${year}-${monthIndex}`

          monthCounts.set(key, (monthCounts.get(key) || 0) + 1)

          if (!minDate || date < minDate) minDate = date
          if (!maxDate || date > maxDate) maxDate = date
        })

        if (!minDate || !maxDate) {
          setCustomersChartData([])
          return
        }

        const data = []
        const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
        const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)

        let runningTotal = 0

        while (cursor <= end) {
          const year = cursor.getFullYear()
          const monthIndex = cursor.getMonth()
          const key = `${year}-${monthIndex}`

          const countThisMonth = monthCounts.get(key) || 0
          runningTotal += countThisMonth

          data.push({
            month: cursor.toLocaleDateString("en-US", {
              month: "long",
            }),
            value: runningTotal,
          })

          cursor.setMonth(cursor.getMonth() + 1)
        }

        setCustomersChartData(data)
      } catch (err) {
        console.error("Failed to fetch customers:", err)
      } finally {
        setIsCustomersLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // comparsions line chart
  useEffect(() => {
    const fetchComparisons = async () => {
      try {
        const response = await User.get("/comparsion/all")
        const comparisons = response.data.comparsions || []

        if (!comparisons.length) {
          setComparisonChartData([])
          return
        }

        const monthCounts = new Map()
        let minDate = null
        let maxDate = null

        comparisons.forEach((item) => {
          if (!item.createdAt) return

          const date = new Date(item.createdAt)
          if (isNaN(date)) return

          const year = date.getFullYear()
          const monthIndex = date.getMonth()
          const key = `${year}-${monthIndex}`

          monthCounts.set(key, (monthCounts.get(key) || 0) + 1)

          if (!minDate || date < minDate) minDate = date
          if (!maxDate || date > maxDate) maxDate = date
        })

        if (!minDate || !maxDate) {
          setComparisonChartData([])
          return
        }

        const data = []
        const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
        const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)

        let runningTotal = 0

        while (cursor <= end) {
          const year = cursor.getFullYear()
          const monthIndex = cursor.getMonth()
          const key = `${year}-${monthIndex}`

          const countThisMonth = monthCounts.get(key) || 0
          runningTotal += countThisMonth

          data.push({
            month: cursor.toLocaleDateString("en-US", {
              month: "long",
            }),
            value: runningTotal,
          })

          cursor.setMonth(cursor.getMonth() + 1)
        }

        setComparisonChartData(data)
      } catch (err) {
        console.error("Failed to fetch comparison tables:", err)
      } finally {
        setIsComparisonLoading(false)
      }
    }

    fetchComparisons()
  }, [])

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <div className="dashboard-body">
        <div className="dashboard-card">
          <h2>Customers per Month</h2>
          {isCustomersLoading ? (
            <p>Loading chart...</p>
          ) : customersChartData.length === 0 ? (
            <p>No customers registered yet.</p>
          ) : (
            <div className="charts-row">
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={customersChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Customers"
                      stroke="#9f0000ff"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        <div className="dashboard-card">
          <h2>Orders by Status</h2>
          {isOrdersLoading ? (
            <p>Loading chart...</p>
          ) : ordersChartData.every((item) => item.value === 0) ? (
            <p>No orders Submitted, Processing, Picked Up, or Delivered.</p>
          ) : (
            <div className="charts-row">
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={ordersChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Orders" fill="#9f0000ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Orders per Shop</h2>
          {isOrdersLoading ? (
            <p>Loading chart...</p>
          ) : ordersPerShopData.length === 0 ? (
            <p>No completed orders to display yet.</p>
          ) : (
            <div className="charts-row">
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={ordersPerShopData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="shop" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Orders" fill="#9f0000ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Orders by Type</h2>
          {isOrdersLoading ? (
            <p>Loading chart...</p>
          ) : orderTypeData.every((item) => item.value === 0) ? (
            <p>No completed orders to display yet.</p>
          ) : (
            <div className="charts-row">
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={orderTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      stroke="none"
                      label={false}
                      labelLine={false}
                    >
                      {orderTypeData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={ORDER_TYPE_COLORS[entry.name]}
                        />
                      ))}
                    </Pie>
                    <Tooltip cursor={false} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Total Comparison Tables</h2>
          {isComparisonLoading ? (
            <p>Loading chart...</p>
          ) : comparisonChartData.length === 0 ? (
            <p>No comparison tables created yet.</p>
          ) : (
            <div className="charts-row">
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Comparison Tables"
                      stroke="#2e7d32"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import * as XLSX from 'xlsx';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [softwareUsage, setSoftwareUsage] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [peakHour, setPeakHour] = useState('');
  const [lowestHour, setLowestHour] = useState('');
  const [countryCounts, setCountryCounts] = useState([]);
  const GEOCODE_API_KEY = "309640c5509c437d9b48f9e37a03653d";  // Use your OpenCage API key
  
  useEffect(() => {
    fetchUsers();
    fetchLoginLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/admin/users/', { headers: {} });
      const data = await response.json();
      
      // Convert lat-long to country for each user
      const usersWithCountry = await Promise.all(data.users.map(async user => {
        let country = "Unknown";  // Default value if location is not available

        if (user.location) {
          const [lat, lon] = user.location.split(',').map(coord => parseFloat(coord.trim()));
          country = await convertLatLongToCountry(lat, lon);
        }
        
        return { ...user, country };  // Add country to user data
      }));
      
      setUsers(usersWithCountry);
      setFilteredUsers(usersWithCountry);  // Initially display all users with country
      updateCountryCounts(usersWithCountry);  // Update country count for bar chart
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLoginLogs = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/admin/login-logs/', { headers: {} });
      const data = await response.json();
      
      if (Array.isArray(data.login_logs)) {
        // Aggregate logins by hour
        const aggregatedData = aggregateLoginsByHour(data.login_logs);
        
        // Find the peak (max) and lowest (min) login hours
        const { peakHour, lowestHour } = findPeakAndLowestUsage(aggregatedData);
        
        setSoftwareUsage(aggregatedData); // Update the chart with aggregated data
        setPeakHour(peakHour);
        setLowestHour(lowestHour);
      }
    } catch (err) {
      console.error("Error fetching login logs:", err);
    }
  };

  const aggregateLoginsByHour = (logs) => {
    const loginCountsByHour = {};
    logs.forEach(log => {
      const timestamp = new Date(log.timestamp);
      const hour = timestamp.getHours();  // Get the hour (0-23)
      loginCountsByHour[hour] = (loginCountsByHour[hour] || 0) + 1;
    });

    return Object.keys(loginCountsByHour).map(hour => ({
      hour: `${hour}:00`,
      loginCount: loginCountsByHour[hour],
    }));
  };

  const findPeakAndLowestUsage = (aggregatedData) => {
    let peakHour = null;
    let lowestHour = null;
    let maxLogins = -1;
    let minLogins = Infinity;

    aggregatedData.forEach(data => {
      if (data.loginCount > maxLogins) {
        maxLogins = data.loginCount;
        peakHour = data.hour;
      }
      if (data.loginCount < minLogins) {
        minLogins = data.loginCount;
        lowestHour = data.hour;
      }
    });

    return { peakHour, lowestHour };
  };

  const convertLatLongToCountry = async (lat, lon) => {
    try {
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${GEOCODE_API_KEY}`);
      if (response.data && response.data.results && response.data.results[0]) {
        return response.data.results[0].components.city;
      }
    } catch (error) {
      console.error("Error fetching country data:", error);
    }
    return "Unknown Country";
  };

  const updateCountryCounts = (usersWithCountry) => {
    const counts = usersWithCountry.reduce((acc, user) => {
      acc[user.country] = (acc[user.country] || 0) + 1;
      return acc;
    }, {});

    const countryCountsArray = Object.keys(counts).map(country => ({
      country,
      userCount: counts[country],
    }));

    setCountryCounts(countryCountsArray);
  };

  const handleDateFilter = () => {
    const filtered = users.filter(user => {
      const createdAt = new Date(user.created_at);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      return (!from || createdAt >= from) && (!to || createdAt <= to);
    });
    setFilteredUsers(filtered);
  };

  const exportToExcel = () => {
    const usersToExport = filteredUsers.length > 0 ? filteredUsers : users;
    const fileData = usersToExport.map(user => ({
      Name: `${user.first_name} ${user.last_name}`,
      Email: user.email,
      ResumeCount: user.total_resumes,
      Location: user.country,  // Use country here instead of location
      created_at: user.created_at,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(fileData);
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, 'user_data.xlsx');
  };

  const deleteUser = async (userId) => {
    try {
      await fetch(`http://localhost:8000/auth/admin/deleteusers/${userId}`, { method: 'DELETE' });
      alert('User deleted');
      fetchUsers();  // Refresh the list after deletion
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      {/* User List Section */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Users</h2>

        <div className="flex flex-wrap gap-4 mb-4">
          {/* Date Range Inputs */}
          <div className="flex gap-4">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-4 py-2 border border-gray-500 rounded-md bg-gray-700 text-white"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-4 py-2 border border-gray-500 rounded-md bg-gray-700 text-white"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleDateFilter}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Filter
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Export Users
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-gray-700 shadow-lg rounded-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-600">
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Resume Count</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Location</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Created at</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-t border-gray-600">
                  <td className="px-4 py-2 text-sm text-gray-300">{user.first_name} {user.last_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{user.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{user.total_resumes}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{user.country}</td> {/* Use country here */}
                  <td className="px-4 py-2 text-sm text-gray-300">{user.created_at}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Software Usage Chart */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Software Usage</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={softwareUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="hour" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="loginCount" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>

        <div>
          <p><strong>Peak Hour in UTC timezone:</strong> {peakHour}</p>
          <p><strong>Lowest Hour in UTC timezone:</strong> {lowestHour}</p>
        </div>
      </div>

      {/* User Count by Country Bar Chart */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">User Count by Country</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={countryCounts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="country" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Legend />
            <Bar dataKey="userCount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;

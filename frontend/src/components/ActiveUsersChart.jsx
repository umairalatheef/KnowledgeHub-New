import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Chart from "chart.js/auto";

const ActiveUsersPieChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("http://localhost:8000/api/v1/admin_dashboard/active-users/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!data.length) return <Typography>No data available</Typography>;

  const labels = data.map((item) => item.date);
  const values = data.map((item) => item.active_users_count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Active Users",
        data: values,
        backgroundColor: ["#673AB7", "#9575CD", "#D1C4E9", "#B39DDB"],
        hoverOffset: 10,
      },
    ],
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper, // Adapt background
        color: theme.palette.text.primary, // Adapt text
        padding: 3,
        borderRadius: 2,
        boxShadow: 3,
        width: "100%",
        maxWidth: "500px",
        margin: "auto",
      }}
    >
      <Typography variant="h6" gutterBottom color="primary" align="center">
        Active Users Distribution
      </Typography>
      <Box sx={{ height: "400px", width: "100%" }}>
        {data.length > 0 && typeof window !== "undefined" && <Pie data={chartData} />}
      </Box>
    </Box>
  );
};

export default ActiveUsersPieChart;

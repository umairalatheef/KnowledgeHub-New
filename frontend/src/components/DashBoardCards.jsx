import React from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const DashBoardCards = ({ stats = {} }) => {
  console.log("Stats received:", stats); // Debugging log
  const theme = useTheme();
  const cardData = [
    { title: "Total Users", value: stats.total_users ?? 0 },
    { title: "Total Courses", value: stats.total_courses ?? 0 },
   // { title: "Completed Courses", value: stats.completed_courses ?? 0 },
    { title: "Total Enrollments", value: stats.total_enrollments ?? 0 },
    { title: "Total Videos", value: stats.total_videos ?? 0 },
  ];

  return (
    <Grid container spacing={3}>
      {cardData.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card
            elevation={3}
            sx={{
              textAlign: "center",
              padding: 2,
              background: theme.palette.background.paper, // Adapt to theme
              color: theme.palette.text.primary, // Text color adapts
            }}
          >
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                {card.title}
              </Typography>
              <Typography variant="h4">{card.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashBoardCards;
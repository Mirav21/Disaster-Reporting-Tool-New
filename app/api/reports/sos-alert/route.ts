// import nodemailer from "nodemailer";
// import prisma from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";

// // Function to calculate distance between two points using Haversine formula
// function calculateDistance(
//   lat1: number,
//   lon1: number,
//   lat2: number,
//   lon2: number
// ): number {
//   const R = 6371; // Earth's radius in kilometers
//   const dLat = (lat2 - lat1) * (Math.PI / 180);
//   const dLon = (lon2 - lon1) * (Math.PI / 180);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1 * (Math.PI / 180)) *
//     Math.cos(lat2 * (Math.PI / 180)) *
//     Math.sin(dLon / 2) *
//     Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c; // Distance in kilometers
// }

// // Email transporter setup
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT || "587"),
//   secure: process.env.SMTP_SECURE === "true",
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

// interface SOSEmailData {
//   reportId: string;
//   radius: number; 
//   message: string;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { reportId, radius, message }: SOSEmailData = await req.json();

//     // Get the report details
//     const report = await prisma.report.findUnique({
//       where: { id: reportId },
//       select: {
//         id: true,
//         type: true,
//         description: true,
//         latitude: true,
//         longitude: true,
//         location: true,
//       },
//     });
//     console.log(report)
//     if (!report) {
//       return NextResponse.json(
//         { message: "Report not found" },
//         { status: 404 }
//       );
//     }

//     // Get all users from the database
//     const allUsers = await prisma.user.findMany({
//       select: {
//         id: true,
//         email: true,
//         latitude: true,
//         longitude: true,
//       },
//     });

//     if (!report.latitude || !report.longitude) {
//       return NextResponse.json({
//         message: "Report location coordinates not available",
//         status: 400
//       });
//     }
    
//     const usersInArea = allUsers.filter((user) => {
//       if (!user.latitude || !user.longitude) return false;
      
//       const distance = calculateDistance(
//         report.latitude!, // Add non-null assertion since we checked above
//         report.longitude!,
//         user.latitude,
//         user.longitude
//       );
//       return distance <= radius;
//     });
    
//     if (usersInArea.length === 0) {
//       return NextResponse.json({
//         success: true,
//         recipientCount: 0,
//         message: "No users found in the specified area",
//       });
//     }

//     // Prepare email content
//     const emailContent = {
//       subject: `⚠️ Emergency Alert: Incident Reported in Your Area`,
//       html: `
//         <h2>Emergency Alert</h2>
//         <p>An incident has been reported in your area:</p>
//         <ul>
//           <li><strong>Location:</strong> ${report.location}</li>
//           <li><strong>Type:</strong> ${report.type}</li>
//           <li><strong>Description:</strong> ${report.description}</li>
//         </ul>
//         <p>${message}</p>
//         <p>Please stay alert and follow any instructions from local authorities.</p>
//         <hr>
//         <p><small>This is an automated alert. Do not reply to this email.</small></p>
//       `,
//     };

//     // Send emails in batches to avoid overwhelming the email server
//     const batchSize = 50;
//     for (let i = 0; i < usersInArea.length; i += batchSize) {
//       const batch = usersInArea.slice(i, i + batchSize);
//       const emailPromises = batch.map((user: { email: string; }) =>
//         transporter.sendMail({
//           from: process.env.SMTP_FROM,
//           to: user.email,
//           subject: emailContent.subject,
//           html: emailContent.html,
//         })
//       );
//       await Promise.all(emailPromises);
      
//       // Add a small delay between batches
//       if (i + batchSize < usersInArea.length) {
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
//     }

//     // Log the alert
//     await prisma.sOSAlert.create({
//       data: {
//         reportId: report.id,
//         radius,
//         message,
//         recipientCount: usersInArea.length,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       recipientCount: usersInArea.length,
//       message: `Alert sent to ${usersInArea.length} users in the area`,
//     });
//   } catch (error) {
//     console.error("Error sending SOS alerts:", error);
//     return NextResponse.json(
//       { message: "Error sending alerts", error },
//       { status: 500 }
//     );
//   }
// }


import { Client } from "pg";
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

// Function to calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SOSEmailData {
  reportId: string;
  radius: number;
  message: string;
}

// Create a database client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const { reportId, radius, message }: SOSEmailData = await req.json();

    await client.connect();

    // Get the report details
    const reportResult = await client.query(
      `SELECT id, disaster_type, description, latitude, longitude, location FROM disaster_report WHERE id = $1`,
      [reportId]
    );
    console.log(reportResult)
    const report = reportResult.rows[0];

    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    if (!report.latitude || !report.longitude) {
      return NextResponse.json({
        message: "Report location coordinates not available",
        status: 400,
      });
    }

    // Get all users from the database
    const usersResult = await client.query(
      `SELECT id, email, latitude, longitude FROM users`
    );
    console.log(usersResult)
    const allUsers = usersResult.rows;

    const usersInArea = allUsers.filter((user: any) => {
      if (!user.latitude || !user.longitude) return false;

      const distance = calculateDistance(
        report.latitude,
        report.longitude,
        user.latitude,
        user.longitude
      );
      return distance <= radius;
    });

    if (usersInArea.length === 0) {
      return NextResponse.json({
        success: true,
        recipientCount: 0,
        message: "No users found in the specified area",
      });
    }

    // Prepare email content
    const emailContent = {
      subject: `⚠️ Emergency Alert: Incident Reported in Your Area`,
      html: `
        <h2>Emergency Alert</h2>
        <p>An incident has been reported in your area:</p>
        <ul>
          <li><strong>Location:</strong> ${report.location}</li>
          <li><strong>Type:</strong> ${report.type}</li>
          <li><strong>Description:</strong> ${report.description}</li>
        </ul>
        <p>${message}</p>
        <p>Please stay alert and follow any instructions from local authorities.</p>
        <hr>
        <p><small>This is an automated alert. Do not reply to this email.</small></p>
      `,
    };

    const batchSize = 50;
    for (let i = 0; i < usersInArea.length; i += batchSize) {
      const batch = usersInArea.slice(i, i + batchSize);
      const emailPromises = batch.map((user: { email: string }) =>
        transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
        })
      );
      await Promise.all(emailPromises);

      // Add a small delay between batches
      if (i + batchSize < usersInArea.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Log the alert
    // await client.query(
    //   `INSERT INTO sos_alerts (report_id, radius, message, recipient_count) VALUES ($1, $2, $3, $4)`,
    //   [report.id, radius, message, usersInArea.length]
    // );

    await client.end();

    return NextResponse.json({
      success: true,
      recipientCount: usersInArea.length,
      message: `Alert sent to ${usersInArea.length} users in the area`,
    });
  } catch (error) {
    console.error("Error sending SOS alerts:", error);
    await client.end();
    return NextResponse.json(
      { message: "Error sending alerts", error },
      { status: 500 }
    );
  }
}

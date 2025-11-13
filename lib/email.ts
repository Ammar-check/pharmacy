import nodemailer from "nodemailer";

// Create reusable transporter using Gmail SMTP
function createTransporter() {
	const email = process.env.SMTP_EMAIL;
	const password = process.env.SMTP_PASSWORD;

	if (!email || !password) {
		throw new Error("Missing SMTP_EMAIL or SMTP_PASSWORD environment variables");
	}

	// Using Gmail SMTP configuration (can be changed for other providers)
	return nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true, // use SSL
		auth: {
			user: email,
			pass: password,
		},
		// Serverless-friendly configuration
		pool: false, // Disable connection pooling for serverless
		maxConnections: 1,
		maxMessages: 1,
		// Add timeouts to prevent hanging
		connectionTimeout: 10000, // 10 seconds
		greetingTimeout: 10000,
		socketTimeout: 10000,
	} as any);
}

export async function sendEmail(params: {
	to: string | string[];
	subject: string;
	html: string;
	from?: string;
}) {
	try {
		const transporter = createTransporter();
		const from = params.from || process.env.SMTP_EMAIL || "no-reply@example.com";

		const mailOptions = {
			from: from,
			to: Array.isArray(params.to) ? params.to.join(", ") : params.to,
			subject: params.subject,
			html: params.html,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Email sent successfully:", info.messageId);
		return info;
	} catch (error) {
		console.error("Error sending email:", error);
		console.error("Email config:", {
			service: process.env.SMTP_SERVICE,
			hasEmail: !!process.env.SMTP_EMAIL,
			hasPassword: !!process.env.SMTP_PASSWORD,
			to: params.to,
			subject: params.subject,
		});
		throw error;
	}
}



import { emailConfig, emailTransporter } from "./email";
import {
	orderConfirmationEmail,
	orderShippedEmail,
	refundNotificationEmail,
} from "./templates/order";
import {
	passwordChangeConfirmationEmail,
	passwordResetConfirmationEmail,
	passwordResetEmailWithOTP,
} from "./templates/passwordReset";
import {
	vendorPayoutNotificationEmail,
	vendorRegistrationConfirmationEmail,
	vendorStatusUpdateEmail,
} from "./templates/vendor";
import { welcomeEmailWithOTP } from "./templates/welcome";

export class EmailService {
	static async sendWelcomeEmail(
		user: { name: string; email: string },
		verificationLink: string,
	) {
		const email = welcomeEmailWithOTP(user, verificationLink);
		return this.sendEmail(email);
	}

	static async sendPasswordResetEmail(
		user: { name: string; email: string },
		resetLink: string,
	) {
		const email = passwordResetEmailWithOTP(user, resetLink);
		return this.sendEmail(email);
	}

	static async sendPasswordResetConfirmationEmail(user: {
		name: string;
		email: string;
	}) {
		const email = passwordResetConfirmationEmail(user);
		return this.sendEmail(email);
	}

	static async sendVendorRegistrationConfirmation(vendor: {
		name: string;
		email: string;
		businessName: string;
	}) {
		const email = vendorRegistrationConfirmationEmail(vendor);
		return this.sendEmail(email);
	}

	static async sendVendorStatusUpdate(
		vendor: { name: string; email: string; businessName: string },
		status: "approved" | "rejected" | "suspended",
		reason?: string,
	) {
		const email = vendorStatusUpdateEmail(vendor, status, reason);
		return this.sendEmail(email);
	}

	static async sendVendorPayoutNotification(
		vendor: { name: string; email: string },
		payout: { amount: number; status: string; payoutId: string },
	) {
		const email = vendorPayoutNotificationEmail(vendor, payout);
		return this.sendEmail(email);
	}

	static async sendOrderConfirmation(
		user: { name: string; email: string },
		order: { orderNumber: string; total: number; items: any[] },
	) {
		const email = orderConfirmationEmail(user, order);
		return this.sendEmail(email);
	}

	static async sendOrderShippedNotification(
		user: { name: string; email: string },
		order: { orderNumber: string; trackingNumber?: string; carrier?: string },
	) {
		const email = orderShippedEmail(user, order);
		return this.sendEmail(email);
	}

	static async sendRefundNotification(
		user: { name: string; email: string },
		refund: { orderNumber: string; amount: number; reason?: string },
	) {
		const email = refundNotificationEmail(user, refund);
		return this.sendEmail(email);
	}

	static async sendPasswordChangeConfirmationEmail(user: {
		name: string;
		email: string;
	}) {
		const email = passwordChangeConfirmationEmail(user);
		return this.sendEmail(email);
	}

	private static async sendEmail(emailOptions: {
		to: string;
		subject: string;
		html: string;
		text: string;
	}) {
		try {
			await emailTransporter.sendMail({
				from: emailConfig.from,
				...emailOptions,
			});
			return true;
		} catch (error) {
			console.error("Error sending email:", error);
			return false;
		}
	}
}

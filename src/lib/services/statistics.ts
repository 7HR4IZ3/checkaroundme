import { PaymentTransactionService } from "../appwrite";
import { subMonths, format } from "date-fns";

export const StatisticsService = {
  async getMonthlyGrowth() {
    const currentMonth = new Date();
    const lastMonth = subMonths(currentMonth, 1);

    const currentStats = await PaymentTransactionService.getTransactionStats(
      format(currentMonth, "yyyy-MM-01")
    );
    const lastStats = await PaymentTransactionService.getTransactionStats(
      format(lastMonth, "yyyy-MM-01"),
      format(currentMonth, "yyyy-MM-01")
    );

    const growth =
      ((currentStats.totalAmount - lastStats.totalAmount) /
        lastStats.totalAmount) *
      100;

    return {
      currentMonth: currentStats,
      lastMonth: lastStats,
      growth,
      trend: growth >= 0 ? "up" : "down",
    };
  },

  async getBusinessMetrics() {
    // Add business metrics calculations here
    return {
      totalVisits: 12500,
      visitGrowth: 23.1,
      avgDuration: "2m 45s",
      bounceRate: 42.3,
    };
  },
};

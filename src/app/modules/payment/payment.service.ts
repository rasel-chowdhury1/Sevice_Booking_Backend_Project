import { IPayment } from "./payment.interface";
import Payment from "./payment.model";


// Get payments with pagination and optional filters
const getPayments = async (filter: Record<string, any>, options: { page: number; limit: number; sort?: Record<string, 1 | -1>}) => {
  const { page, limit, sort } = options;
  const skip = (page - 1) * limit;

  // Ensure sort is defined and not empty
  const defaultSort: Record<string, 1 | -1> = sort && Object.keys(sort).length > 0 ? sort : { createdAt: -1 };

  // Find payments based on filter, with pagination
  const payments = await Payment.find(filter)
    .skip(skip)
    .limit(limit)
    .populate('user_id', 'fullName email') // Populate user details
    .populate('guide_id', 'fullName email') // Populate guide details
    .sort(defaultSort);

  const totalResults = await Payment.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  const pagination = { currentPage: page, limit, totalResults, totalPages };

  return { payments, pagination };
};

// Create a new payment
const createPayment = async (paymentData: IPayment) => {
  const newPayment = await Payment.create(paymentData);
  return newPayment;
};

const getPaymentOverview = async (year: any) => {
    try {
      // Generate an array of months (1 through 12)
      const months = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, 3, ..., 12]
  
      // Fetch payment data, grouped by month and payment type
      const paymentOverview = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) }, // Filter by year
          },
        },
        {
          $group: {
            _id: { $month: '$createdAt' }, // Group by the month of 'createdAt'
            totalIncome: { $sum: '$netAmount' }, // Sum netAmount for each group
            count: { $sum: 1 }, // Count number of payments for each month
            subscriptionCount: {
              $sum: {
                $cond: [{ $eq: ['$paymentType', 'subscription'] }, 1, 0], // Count only subscription payments
              },
            },
            bookingCount: {
              $sum: {
                $cond: [{ $eq: ['$paymentType', 'booking'] }, 1, 0], // Count only booking payments
              },
            },
          },
        },
        {
          $project: {
            _id: 1, // Month number
            totalIncome: 1, // Total income (sum of netAmount)
            count: 1, // Total payment count
            subscriptionCount: 1, // Subscription payment count
            bookingCount: 1,
            monthName: {
              $switch: {
                branches: [
                  { case: { $eq: ['$_id', 1] }, then: 'January' },
                  { case: { $eq: ['$_id', 2] }, then: 'February' },
                  { case: { $eq: ['$_id', 3] }, then: 'March' },
                  { case: { $eq: ['$_id', 4] }, then: 'April' },
                  { case: { $eq: ['$_id', 5] }, then: 'May' },
                  { case: { $eq: ['$_id', 6] }, then: 'June' },
                  { case: { $eq: ['$_id', 7] }, then: 'July' },
                  { case: { $eq: ['$_id', 8] }, then: 'August' },
                  { case: { $eq: ['$_id', 9] }, then: 'September' },
                  { case: { $eq: ['$_id', 10] }, then: 'October' },
                  { case: { $eq: ['$_id', 11] }, then: 'November' },
                  { case: { $eq: ['$_id', 12] }, then: 'December' },
                ],
                default: 'Unknown', // Default if month is invalid (i.e., 0)
              },
            },
          },
        },
        {
          $project: {
            monthName: 1,
            totalIncome: 1,
            count: 1,
            subscriptionCount: 1,
            bookingCount: 1,
            month: {
              $ifNull: ['$_id', 0], // Set month to 0 if it's missing or invalid
            },
          },
        },
        { $sort: { month: 1 } }, // Sort by month (ascending)
      ]);
  
      // Add missing months to the result
      const fullYearData = months.map((month) => {
        const monthData = paymentOverview.find((item) => item.month === month);
  
        return {
          month,
          monthName: monthData ? monthData.monthName : getMonthName(month), // Always set a monthName
          totalIncome: monthData ? monthData.totalIncome : 0,
          count: monthData ? monthData.count : 0,
          subscriptionCount: monthData ? monthData.subscriptionCount : 0,
          bookingCount: monthData ? monthData.bookingCount : 0,
        };
      });
  
      // Return the result
      return fullYearData;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw new Error('Error fetching dashboard data.');
    }
  };
  
  // Helper function to get the month name
  const getMonthName = (month: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1] || 'Unknown';
  };
  
  
  

export const PaymentService = { getPayments, createPayment, getPaymentOverview };

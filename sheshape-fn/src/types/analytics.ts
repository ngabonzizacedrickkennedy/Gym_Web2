// src/types/analytics.ts
export interface AnalyticsData {
  userMetrics: {
    totalUsers: number;
    userGrowthRate: number;
    activeUsers: number;
    newUsersThisMonth: number;
    churnRate: number; // Added missing field
  };
  financialMetrics: {
    totalRevenue: number;
    revenueGrowthRate: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
    lifetimeValue: number; // Added field that mock service uses
  };
  orderMetrics: {
    totalOrders: number;
    orderGrowthRate: number;
    abandonedCarts: number;
    conversionRate: number;
  };
  conversionMetrics: {
    conversionRate: number;
    conversionRateChange: number;
    checkoutCompletionRate: number; // Added missing field
    acquisitionCost: number; // Added missing field
  };
  revenueData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  userAcquisitionData: Array<{ // Added missing field
    date: string;
    newUsers: number;
  }>;
  topProducts: Array<{ // Added missing field
    id: number;
    name: string;
    imageUrl: string;
    category: string;
    totalSales: number;
    revenue: number;
    growth: number;
    quantity: number;
  }>;
  contentEngagement: {
    blogViews: number;
    programViews: number;
    averageTimeSpent: number;
    topBlogs: Array<{ // Added structured data
      id: number;
      title: string;
      views: number;
    }>;
    topPrograms: Array<{ // Added structured data
      id: number;
      title: string;
      enrollments: number;
    }>;
  };
}

export interface DateRange {
  from: Date;
  to: Date;
}

// Additional interfaces for component props
export interface TopProduct {
  id: number;
  name: string;
  imageUrl: string;
  category: string;
  totalSales: number;
  revenue: number;
  growth: number;
  quantity: number;
}

export interface UserAcquisitionData {
  date: string;
  newUsers: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface ContentEngagementData {
  topBlogs: Array<{
    id: number;
    title: string;
    views: number;
  }>;
  topPrograms: Array<{
    id: number;
    title: string;
    enrollments: number;
  }>;
}
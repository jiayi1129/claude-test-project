import type {
  User,
  Studio,
  MemberProfile,
  MembershipPlan,
  MemberMembership,
  ClassTemplate,
  ClassSession,
  Booking,
  WaitlistConfig,
  Payment,
  CreditLedger,
  Waiver,
  WaiverSignature,
  StaffProfile,
  PayRate,
  TimeEntry,
  CheckIn,
  QRCode,
  NotificationLog,
  Note,
  IntakeForm,
  IntakeResponse,
} from "@prisma/client";

// Re-export Prisma types
export type {
  User,
  Studio,
  MemberProfile,
  MembershipPlan,
  MemberMembership,
  ClassTemplate,
  ClassSession,
  Booking,
  WaitlistConfig,
  Payment,
  CreditLedger,
  Waiver,
  WaiverSignature,
  StaffProfile,
  PayRate,
  TimeEntry,
  CheckIn,
  QRCode,
  NotificationLog,
  Note,
  IntakeForm,
  IntakeResponse,
};

// Extended types with relations
export type UserWithProfile = User & {
  memberProfile: MemberProfile | null;
  staffProfile: StaffProfile | null;
};

export type BookingWithDetails = Booking & {
  session: ClassSession & {
    template: ClassTemplate | null;
    instructor: User | null;
  };
  member: User;
};

export type ClassSessionWithDetails = ClassSession & {
  template: ClassTemplate | null;
  instructor: User | null;
  bookings: Booking[];
  _count: {
    bookings: number;
  };
};

export type MemberWithMembership = User & {
  memberProfile: MemberProfile | null;
  memberMemberships: (MemberMembership & {
    plan: MembershipPlan;
  })[];
};

// API response types
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// Form types
export type CreateBookingInput = {
  sessionId: string;
  spotId?: string;
  bookingSource?: "web" | "app" | "front_desk" | "walk_in";
};

export type CreateMemberInput = {
  email: string;
  name: string;
  phone?: string;
  password?: string;
};

export type CreateClassSessionInput = {
  templateId?: string;
  studioId: string;
  name: string;
  instructorId?: string;
  startAt: Date | string;
  endAt: Date | string;
  capacity?: number;
  onlineCapacity?: number;
  virtualLink?: string;
};

// Dashboard summary types
export type DashboardSummary = {
  todayRevenue: number;
  todayBookings: number;
  activeMembers: number;
  upcomingClasses: number;
};

// User role type (matching Prisma enum)
export type UserRole = "admin" | "instructor" | "front_desk" | "member";

// Membership plan types
export type MembershipPlanType = "unlimited" | "pack" | "drop_in" | "intro" | "trial";
export type BillingCycle = "monthly" | "weekly" | "annual" | "once";
export type MembershipStatus = "active" | "paused" | "cancelled" | "expired";

// Booking status types
export type BookingStatus =
  | "booked"
  | "waitlisted"
  | "cancelled"
  | "late_cancelled"
  | "no_show"
  | "checked_in";

// Session status types
export type SessionStatus = "scheduled" | "cancelled" | "completed";

// NextAuth session extension
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

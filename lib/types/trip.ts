export const TRIP_MODES = [
  "commando",
  "relaxed",
  "vacation",
  "foodie",
  "cultural",
] as const;

export type TripMode = (typeof TRIP_MODES)[number];

export const TRIP_MODE_LABELS: Record<TripMode, string> = {
  commando: "特种兵打卡",
  relaxed: "休闲模式",
  vacation: "度假模式",
  foodie: "美食之旅",
  cultural: "文化探索",
};

export const ACTIVITY_TYPES = [
  "meal",
  "attraction",
  "transport",
  "rest",
  "shopping",
  "other",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  meal: "餐饮",
  attraction: "景点",
  transport: "交通",
  rest: "休息",
  shopping: "购物",
  other: "其他",
};

export interface TripDestination {
  placeId: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

export interface TripConfig {
  startDate: string;
  endDate: string;
  destination: TripDestination;
  budget?: number;
  days: number;
  peopleCount: number;
  mode: TripMode;
}

export interface PlannedActivity {
  time: string;
  title: string;
  description: string;
  location: string;
  type: ActivityType;
  lng?: number;
  lat?: number;
  highlights?: string;
  tags?: string[];
  recommendation?: string;
  transportTo?: {
    mode: string;
    duration: string;
    distance: string;
  };
}

export interface GeneratedDay {
  dayNumber: number;
  date: string;
  theme: string;
  activities: PlannedActivity[];
}

export interface GeneratedItinerary {
  overview: string;
  days: GeneratedDay[];
}

export type TripStatus = "generated" | "saved";

export interface Trip {
  id: string;
  userId: string;
  title: string;
  config: TripConfig;
  overview: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TripDay {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  theme: string;
  activities: PlannedActivity[];
}

export interface TripWithDays extends Trip {
  days: TripDay[];
}

// Maps form option codes (from src/config/formOptions.js, which is left
// untouched) to lucide-react icons for the card/chip UI. Keeping this
// mapping separate from formOptions.js keeps that file plain data.
import {
  Home,
  Key,
  TrendingUp,
  HelpCircle,
  Building2,
  Building,
  Warehouse,
  Rows3,
  Trees,
  Store,
  MoreHorizontal,
  Zap,
  Calendar,
  CalendarClock,
  CalendarRange,
  Eye,
  Banknote,
  Landmark,
  CreditCard,
  BedDouble,
  Route,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Plane,
  Bus,
  Waves,
} from "lucide-react";

export const ENQUIRY_TYPE_ICONS = {
  buy: Home,
  rent: Key,
  invest: TrendingUp,
  general: HelpCircle,
};

export const PROPERTY_TYPE_ICONS = {
  Apartment: Building2,
  "Detached House": Home,
  "Semi-Detached House": Building,
  "Terraced House": Rows3,
  Bungalow: Warehouse,
  Land: Trees,
  Commercial: Store,
  Other: MoreHorizontal,
};

export const PROXIMITY_ICONS = {
  main_road: Route,
  school: GraduationCap,
  hospital: HeartPulse,
  shopping: ShoppingBag,
  airport: Plane,
  public_transport: Bus,
  worship: Landmark,
  waterfront: Waves,
};

export const TIMELINE_ICONS = {
  immediately: Zap,
  "1-3 months": Calendar,
  "3-6 months": CalendarClock,
  "6+ months": CalendarRange,
  browsing: Eye,
};

export const PAYMENT_METHOD_ICONS = {
  cash: Banknote,
  mortgage: Landmark,
  instalment: CreditCard,
  not_sure: HelpCircle,
};

export const BEDROOMS_ICON = BedDouble;

import {
  Users,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Building2,
  Heart,
  TreePine,
  Landmark,
  FileSearch,
  ShieldAlert,
  Palmtree,
  MapPin,
  Award,
  FileText,
  Building,
  Sprout,
  MessageCircle,
  IdCard,
  FileCheck,
  Home,
  CreditCard,
  Factory,
  Bus,
  Cloud,
} from "lucide-react";

export type IconName =
  | "Users"
  | "HeartPulse"
  | "GraduationCap"
  | "Briefcase"
  | "Building2"
  | "Heart"
  | "TreePine"
  | "Landmark"
  | "FileSearch"
  | "ShieldAlert"
  | "Palmtree"
  | "MapPin"
  | "Award"
  | "FileText"
  | "Building"
  | "Sprout"
  | "MessageCircle"
  | "IdCard"
  | "FileCheck"
  | "Home"
  | "CreditCard"
  | "Factory"
  | "Bus"
  | "Cloud";

export const SERVICE_ICON_MAP: Record<IconName, React.ComponentType> = {
  Users,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Building2,
  Heart,
  TreePine,
  Landmark,
  FileSearch,
  ShieldAlert,
  Palmtree,
  MapPin,
  Award,
  FileText,
  Building,
  Sprout,
  MessageCircle,
  IdCard,
  FileCheck,
  Home,
  CreditCard,
  Factory,
  Bus,
  Cloud,
};

export function getServiceIcon(iconName: string): React.ComponentType {
  return SERVICE_ICON_MAP[iconName as IconName] || Building2;
}

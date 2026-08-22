export type Role = 'TRAVELER' | 'ADMIN';

export type TripStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export type Category = 'ADVENTURE' | 'CULTURE' | 'FOOD' | 'NATURE' | 'OTHER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  photo?: string | null;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  image?: string | null;
  popularity: number;
  activities?: Activity[];
  _count?: {
    activities: number;
  };
}

export interface Activity {
  id: string;
  name: string;
  category: Category;
  estimatedCost: number;
  cityId: string;
  city?: City;
}

export interface StopActivity {
  id: string;
  day: number;
  expense: number;
  notes?: string | null;
  sectionId: string;
  activityId: string;
  activity?: Activity;
}

export interface Section {
  id: string;
  name: string;
  sectionStart: string;
  sectionEnd: string;
  budget: number;
  sequence: number;
  tripId: string;
  createdAt?: string;
  updatedAt?: string;
  activities?: StopActivity[];
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string | null;
  coverPhoto?: string | null;
  status: TripStatus;
  isPublic: boolean;
  shareToken?: string | null;
  totalBudget: number;
  userId: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'photo' | 'email'>;
  sections?: Section[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityPost {
  id: string;
  content: string;
  image?: string | null;
  tripId?: string | null;
  userId: string;
  createdAt: string;
  trip?: Trip | null;
  user?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  details?: Record<string, string[]>;
}

export interface CreateTripInput {
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  coverPhoto?: string;
}

export interface UpdateTripInput {
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  coverPhoto?: string;
  isPublic?: boolean;
}

export interface CreateSectionInput {
  tripId: string;
  name: string;
  sectionStart: string;
  sectionEnd: string;
  budget?: number;
  sequence?: number;
}

export interface UpdateSectionInput {
  name?: string;
  sectionStart?: string;
  sectionEnd?: string;
  budget?: number;
  sequence?: number;
}

export interface AddStopActivityInput {
  activityId: string;
  day: number;
  expense?: number;
  notes?: string;
}

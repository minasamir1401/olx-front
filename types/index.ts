export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

export interface AdImage {
  id: number;
  image_url: string;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  avatar: string | null;
  created_at?: string;
}

export interface Ad {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  city: string;
  phone: string;
  status: string;
  views: number;
  user_id: number;
  category_id: number;
  created_at: string;
  images: AdImage[];
  user?: User;
  category?: Category;
}

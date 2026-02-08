export interface Zone {
  id: number;
  name: string;
  url: string;
  cover: string;
  image?: string;
  description?: string;
  author: string;
  authorLink?: string;
  featured?: boolean;
  special?: string[];
}

export interface PopularityData {
  [key: number]: number;
}

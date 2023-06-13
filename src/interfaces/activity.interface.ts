import UserEntity from '@/entity/user.entity';

export enum TypeLocation {
  'KEPULAUAN SERIBU' = 'Kepulauan Seribu',
  'JAKARTA BARAT' = 'Jakarta Barat',
  'JAKARTA PUSAT' = 'Jakarta Pusat',
  'JAKARTA SELATAN' = 'Jakarta Selatan',
  'JAKARTA TIMUR' = 'Jakarta Timur',
  'JAKARTA UTARA' = 'Jakarta Utara',
  'YOGYAKARTA' = 'Yogyakarta',
  'BANTUL' = 'Bantul',
  'GUNUNGKIDUL' = 'Gunungkidul',
  'KULON PROGO' = 'Kulon Progo',
}

export interface Activity extends ActivityRequest {
  id: string;
}

export interface ActivityRequest {
  activity_name: string;
  location: TypeLocation;
  description: string;
  background_img: string;
  gmap_link: string;
  start_time: Date;
  end_time: Date;
  users?: UserEntity[];
}

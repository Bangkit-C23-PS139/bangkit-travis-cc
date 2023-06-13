import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TypeLocation } from '../interfaces/activity.interface';
import { nanoid } from 'nanoid';
import { HighlightedDestination } from '../interfaces/highlighted-destination.interface';

@Entity()
class HighlightedDestinationEntity implements HighlightedDestination {
  constructor(
    id = nanoid(32),
    destination_name: string,
    location: TypeLocation,
    description: string,
    gmap_link: string,
    background_img: string,
    image_gallery: string[],
    activity: string[],
    contact_number: string,
  ) {
    this.id = id;
    this.destination_name = destination_name;
    this.location = location;
    this.description = description;
    this.gmap_link = gmap_link;
    this.background_img = background_img;
    this.image_gallery = image_gallery;
    this.activity = activity;
    this.contact_number = contact_number;
  }

  public edit(
    destination_name: string,
    location: TypeLocation,
    description: string,
    background_img: string,
    gmap_link: string,
    image_gallery: string[],
    activity: string[],
    contact_number: string,
  ) {
    this.destination_name = destination_name ?? this.destination_name;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.location = location === null ? this.location : !(location.toUpperCase() in TypeLocation) ? undefined : location.toUpperCase();
    this.description = description ?? this.description;
    this.background_img = background_img ?? this.background_img;
    this.gmap_link = gmap_link ?? this.gmap_link;
    this.image_gallery = image_gallery ?? this.image_gallery;
    this.activity = activity ?? this.activity;
    this.contact_number = contact_number ?? this.contact_number;
  }

  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  destination_name: string;

  @Column({
    type: 'varchar',
    length: 25,
    nullable: false,
  })
  location: TypeLocation;

  @Column({ nullable: false, type: 'text' })
  description: string;

  @Column({ nullable: false })
  gmap_link: string;

  @Column({ nullable: false })
  background_img: string;

  @Column('simple-array', { nullable: false })
  image_gallery: string[];

  @Column('simple-array', { nullable: false })
  activity: string[];

  @Column({ nullable: false })
  contact_number: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @DeleteDateColumn()
  deletedAt: Date;
}

export default HighlightedDestinationEntity;

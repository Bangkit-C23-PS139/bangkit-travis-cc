import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Activity, TypeLocation } from '../interfaces/activity.interface';
import { nanoid } from 'nanoid';
import UserEntity from './user.entity';

@Entity()
class ActivityEntity implements Activity {
  constructor(
    id = nanoid(32),
    activity_name: string,
    location: TypeLocation,
    description: string,
    background_img: string,
    gmap_link: string,
    start_time: Date,
    end_time: Date,
  ) {
    this.id = id;
    this.activity_name = activity_name;
    this.location = location;
    this.description = description;
    this.background_img = background_img;
    this.gmap_link = gmap_link;
    this.start_time = start_time;
    this.end_time = end_time;
  }

  public edit(
    activity_name: string,
    location: TypeLocation,
    description: string,
    background_img: string,
    gmap_link: string,
    start_time: Date,
    end_time: Date,
  ) {
    this.activity_name = activity_name ?? this.activity_name;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.location = location === null ? this.location : !(location.toUpperCase() in TypeLocation) ? undefined : location.toUpperCase();
    this.description = description ?? this.description;
    this.background_img = background_img ?? this.background_img;
    this.gmap_link = gmap_link ?? this.gmap_link;
    this.start_time = start_time ?? this.start_time;
    this.end_time = end_time ?? this.end_time;
  }

  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  activity_name: string;

  @Column({
    type: 'varchar',
    length: 25,
    nullable: false,
  })
  location: TypeLocation;

  @Column({ nullable: false, type: 'text' })
  description: string;

  @Column({ nullable: false })
  background_img: string;

  @Column({ nullable: false })
  gmap_link: string;

  @Column({ nullable: false, type: 'timestamptz' })
  start_time: Date;

  @Column({ nullable: false, type: 'timestamptz' })
  end_time: Date;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToMany(() => UserEntity, user => user.activities)
  @JoinTable({
    name: 'user_activities_entity',
    joinColumn: {
      name: 'activities',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user',
      referencedColumnName: 'id',
    },
  })
  users: UserEntity[];
}

export default ActivityEntity;

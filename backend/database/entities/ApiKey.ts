import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("api_keys")
export class ApiKey {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255, unique: true })
  key: string;

  @Column({ length: 255 })
  userId: string;

  @Column({ length: 255 })
  cooperativeId: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
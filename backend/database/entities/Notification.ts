import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  memberId: string;

  @Column({ length: 255 })
  cooperativeId: string;

  @Column({ length: 50 })
  type: string;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  message: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @Index("idx_notification_member")
  @Column({ length: 255, nullable: true })
  memberIdIndex: string;
}
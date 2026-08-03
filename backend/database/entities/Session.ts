import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity("sessions")
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  userId: string;

  @Column({ length: 255 })
  token: string;

  @Column({ length: 255, nullable: true })
  refreshToken: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: "timestamp", nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Index("idx_session_token")
  @Column({ length: 255, nullable: true })
  tokenIndex: string;
}
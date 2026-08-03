import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  cooperativeId: string;

  @Column({ length: 255 })
  userId: string;

  @Column({ length: 100 })
  action: string;

  @Column({ type: "text", nullable: true })
  entityType: string;

  @Column({ length: 255, nullable: true })
  entityId: string;

  @Column({ type: "jsonb", nullable: true })
  details: Record<string, unknown>;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @Index("idx_audit_cooperative")
  @Column({ length: 255, nullable: true })
  cooperativeIdIndex: string;

  @Index("idx_audit_action")
  @Column({ length: 100, nullable: true })
  actionIndex: string;
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Cooperative } from "./Cooperative";
import { Transaction } from "./Transaction";

@Entity("emergency_funds")
export class EmergencyFund {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  cooperativeId: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  balance: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  totalContributed: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  totalWithdrawn: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  monthlyContributionTarget: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: "jsonb", nullable: true })
  settings: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cooperative, (cooperative) => cooperative.emergencyFunds)
  cooperative: Cooperative;

  @OneToMany(() => Transaction, (tx) => tx.treasury)
  transactions: Transaction[];
}
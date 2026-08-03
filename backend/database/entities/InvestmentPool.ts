import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Cooperative } from "./Cooperative";
import { Transaction } from "./Transaction";

@Entity("investment_pools")
export class InvestmentPool {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  cooperativeId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  totalContributed: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  totalReturns: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  currentValue: string;

  @Column({ type: "int", default: 0 })
  totalMembers: number;

  @Column({
    type: "enum",
    enum: ["Active", "Paused", "Closed", "Liquidated"],
    default: "Active",
  })
  status: string;

  @Column({ type: "jsonb", nullable: true })
  settings: Record<string, unknown>;

  @Column({ type: "jsonb", nullable: true })
  returnsHistory: Record<string, unknown>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cooperative, (cooperative) => cooperative.investmentPools)
  cooperative: Cooperative;

  @OneToMany(() => Transaction, (tx) => tx.treasury)
  transactions: Transaction[];
}
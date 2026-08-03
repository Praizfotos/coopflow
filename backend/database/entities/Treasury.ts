import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Cooperative } from "./Cooperative";
import { Transaction } from "./Transaction";

@Entity("treasuries")
export class Treasury {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  cooperativeId: string;

  @Column({ length: 10 })
  asset: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  balance: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  totalDeposited: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  totalWithdrawn: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cooperative, (cooperative) => cooperative.treasuries)
  cooperative: Cooperative;

  @OneToMany(() => Transaction, (tx) => tx.treasury)
  transactions: Transaction[];
}
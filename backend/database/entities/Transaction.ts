import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Treasury } from "./Treasury";
import { Loan } from "./Loan";

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: ["deposit", "withdrawal", "transfer", "interest", "penalty", "payout", "repayment", "investment"],
  })
  type: string;

  @Column({ length: 255, nullable: true })
  treasuryId: string;

  @Column({ length: 255, nullable: true })
  loanId: string;

  @Column({ length: 56, nullable: true })
  fromAddress: string;

  @Column({ length: 56, nullable: true })
  toAddress: string;

  @Column({ type: "decimal", precision: 18, scale: 7 })
  amount: string;

  @Column({ length: 10 })
  asset: string;

  @Column({ length: 64, nullable: true })
  txHash: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Treasury, (treasury) => treasury.transactions)
  treasury: Treasury;

  @ManyToOne(() => Loan, (loan) => loan.transactions)
  loan: Loan;
}
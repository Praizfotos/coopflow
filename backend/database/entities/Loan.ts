import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Cooperative } from "./Cooperative";
import { Member } from "./Member";
import { LoanRepayment } from "./LoanRepayment";

@Entity("loans")
export class Loan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  cooperativeId: string;

  @Column({ length: 255 })
  borrowerId: string;

  @Column({ type: "decimal", precision: 18, scale: 7 })
  amount: string;

  @Column({ length: 10 })
  asset: string;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  interestRate: number;

  @Column({ type: "int" })
  termDays: number;

  @Column({
    type: "enum",
    enum: ["Pending", "Approved", "Rejected", "Active", "Repaid", "Defaulted", "Seized"],
    default: "Pending",
  })
  status: string;

  @Column({ length: 255, nullable: true })
  approvedBy: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  collateralAmount: string;

  @Column({ length: 10, default: "XLM" })
  collateralAsset: string;

  @Column({ type: "timestamp", nullable: true })
  disbursedAt: Date;

  @Column({ type: "timestamp" })
  dueDate: Date;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  repaidAmount: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  remainingBalance: string;

  @Column({ type: "int", default: 0 })
  missedPayments: number;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  totalPaid: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cooperative, (cooperative) => cooperative.loans)
  cooperative: Cooperative;

  @ManyToOne(() => Member, (member) => member.loans)
  borrower: Member;

  @OneToMany(() => LoanRepayment, (repayment) => repayment.loan)
  repayments: LoanRepayment[];

  @OneToMany(() => Transaction, (tx) => tx.loan)
  transactions: Transaction[];
}
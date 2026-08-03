import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Loan } from "./Loan";

@Entity("loan_repayments")
export class LoanRepayment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  loanId: string;

  @Column({ type: "int" })
  installmentNumber: number;

  @Column({ type: "decimal", precision: 18, scale: 7 })
  amountDue: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  amountPaid: string;

  @Column({ type: "timestamp", nullable: true })
  paidAt: Date;

  @Column({ length: 20, default: "pending" })
  status: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  penaltyAmount: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Loan, (loan) => loan.repayments)
  loan: Loan;
}
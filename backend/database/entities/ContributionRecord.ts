import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Member } from "./Member";
import { ContributionCycle } from "./ContributionCycle";

@Entity("contribution_records")
export class ContributionRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  memberId: string;

  @Column({ length: 255 })
  cycleId: string;

  @Column({ type: "decimal", precision: 18, scale: 7 })
  amount: string;

  @Column({ length: 10 })
  asset: string;

  @Column({ type: "timestamp" })
  paidAt: Date;

  @Column({ length: 64 })
  txHash: string;

  @Column({ length: 20, default: "completed" })
  status: string;

  @Column({ type: "text", nullable: true })
  receiptUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Member, (member) => member.contributionRecords)
  member: Member;

  @ManyToOne(() => ContributionCycle, (cycle) => cycle.payments)
  cycle: ContributionCycle;
}
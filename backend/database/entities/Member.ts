import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Cooperative } from "./Cooperative";
import { ContributionRecord } from "./ContributionRecord";
import { Loan } from "./Loan";
import { Vote } from "./Vote";

@Entity("members")
export class Member {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  cooperativeId: string;

  @Column({ length: 255 })
  organizationId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 56 })
  walletAddress: string;

  @Column({
    type: "enum",
    enum: ["Founder", "Administrator", "Treasurer", "Secretary", "Auditor", "Member"],
    default: "Member",
  })
  role: string;

  @Column({
    type: "enum",
    enum: ["Active", "Inactive", "Suspended", "Pending", "Revoked"],
    default: "Active",
  })
  status: string;

  @Column({ default: false })
  identityVerified: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cooperative, (cooperative) => cooperative.members)
  cooperative: Cooperative;

  @OneToMany(() => ContributionRecord, (record) => record.member)
  contributionRecords: ContributionRecord[];

  @OneToMany(() => Loan, (loan) => loan.borrower)
  loans: Loan[];

  @OneToMany(() => Vote, (vote) => vote.member)
  votes: Vote[];
}
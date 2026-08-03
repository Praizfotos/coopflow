import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Cooperative } from "./Cooperative";
import { Member } from "./Member";
import { Vote } from "./Vote";

@Entity("proposals")
export class Proposal {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  cooperativeId: string;

  @Column({ length: 255 })
  proposerId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({
    type: "enum",
    enum: ["Spend", "MemberApproval", "MemberRemoval", "RuleChange", "Pause", "Resume", "Custom"],
  })
  type: string;

  @Column({
    type: "enum",
    enum: ["Active", "Passed", "Rejected", "Executed", "Expired"],
    default: "Active",
  })
  status: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  votesFor: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  votesAgainst: string;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  requiredApprovalPercent: number;

  @Column({ type: "timestamp" })
  votingStart: Date;

  @Column({ type: "timestamp" })
  votingEnd: Date;

  @Column({ type: "timestamp", nullable: true })
  executedAt: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cooperative, (cooperative) => cooperative.proposals)
  cooperative: Cooperative;

  @ManyToOne(() => Member, (member) => member.proposals)
  proposer: Member;

  @OneToMany(() => Vote, (vote) => vote.proposal)
  votes: Vote[];
}
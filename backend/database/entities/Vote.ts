import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Proposal } from "./Proposal";
import { Member } from "./Member";

@Entity("votes")
export class Vote {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  proposalId: string;

  @Column({ length: 255 })
  memberId: string;

  @Column({ type: "boolean" })
  vote: boolean;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  votingPower: string;

  @CreateDateColumn()
  votedAt: Date;

  @ManyToOne(() => Proposal, (proposal) => proposal.votes)
  proposal: Proposal;

  @ManyToOne(() => Member, (member) => member.votes)
  member: Member;
}
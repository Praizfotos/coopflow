import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Organization } from "./Organization";
import { Member } from "./Member";
import { ContributionCycle } from "./ContributionCycle";
import { Treasury } from "./Treasury";
import { Loan } from "./Loan";
import { Proposal } from "./Proposal";
import { EmergencyFund } from "./EmergencyFund";
import { InvestmentPool } from "./InvestmentPool";

@Entity("cooperatives")
export class Cooperative {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  organizationId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  treasuryAddress: string;

  @Column({ length: 255, nullable: true })
  contributionContractAddress: string;

  @Column({ length: 255, nullable: true })
  rotationContractAddress: string;

  @Column({ length: 255, nullable: true })
  governanceContractAddress: string;

  @Column({ length: 255, nullable: true })
  loanContractAddress: string;

  @Column({ type: "jsonb", nullable: true })
  settings: Record<string, unknown>;

  @Column({ default: true })
  active: boolean;

  @Column({ type: "int", default: 0 })
  totalMembers: number;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  totalAssets: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Organization, (org) => org.cooperatives)
  organization: Organization;

  @OneToMany(() => Member, (member) => member.cooperative)
  members: Member[];

  @OneToMany(() => ContributionCycle, (cycle) => cycle.cooperative)
  contributionCycles: ContributionCycle[];

  @OneToMany(() => Treasury, (treasury) => treasury.cooperative)
  treasuries: Treasury[];

  @OneToMany(() => Loan, (loan) => loan.cooperative)
  loans: Loan[];

  @OneToMany(() => Proposal, (proposal) => proposal.cooperative)
  proposals: Proposal[];

  @OneToMany(() => EmergencyFund, (fund) => fund.cooperative)
  emergencyFunds: EmergencyFund[];

  @OneToMany(() => InvestmentPool, (pool) => pool.cooperative)
  investmentPools: InvestmentPool[];
}
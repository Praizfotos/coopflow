import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Cooperative } from "./Cooperative";
import { ContributionRecord } from "./ContributionRecord";

@Entity("contribution_cycles")
export class ContributionCycle {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  cooperativeId: string;

  @Column({
    type: "enum",
    enum: ["Weekly", "Biweekly", "Monthly", "Quarterly", "Yearly", "Custom"],
  })
  cycleType: string;

  @Column({ type: "decimal", precision: 18, scale: 7 })
  amount: string;

  @Column({ length: 10 })
  asset: string;

  @Column({ type: "timestamp" })
  startDate: Date;

  @Column({ type: "timestamp" })
  endDate: Date;

  @Column({ type: "jsonb", nullable: true })
  members: string[];

  @Column({ default: false })
  completed: boolean;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  totalCollected: string;

  @Column({ type: "jsonb", nullable: true })
  penaltyConfig: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cooperative, (cooperative) => cooperative.contributionCycles)
  cooperative: Cooperative;

  @OneToMany(() => ContributionRecord, (record) => record.cycle)
  payments: ContributionRecord[];
}
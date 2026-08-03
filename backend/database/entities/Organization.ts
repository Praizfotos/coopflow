import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Cooperative } from "./Cooperative";

@Entity("organizations")
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ length: 255 })
  ownerId: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Cooperative, (cooperative) => cooperative.organization)
  cooperatives: Cooperative[];
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Member } from "./Member";

@Entity("wallets")
export class Wallet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  memberId: string;

  @Column({ length: 56 })
  address: string;

  @Column({ length: 10, default: "XLM" })
  asset: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  balance: string;

  @Column({ type: "decimal", precision: 18, scale: 7, default: 0 })
  reservedBalance: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Member, (member) => member.wallets)
  member: Member;
}
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec, Map,
    IntoVal, TryFromVal,
};
use soroban_sdk::storage::{Map as StorageMap, Vec as StorageVec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LoanError {
    NotAuthorized,
    InvalidAmount,
    InvalidInterestRate,
    MemberNotFound,
    LoanNotFound,
    LoanAlreadyRepaid,
    LoanDefaulted,
    InsufficientCollateral,
    ContractPaused,
    InvalidRepaymentAmount,
    RepaymentPeriodExpired,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LoanStatus {
    Pending,
    Approved,
    Rejected,
    Active,
    Repaid,
    Defaulted,
    Seized,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Loan {
    pub id: u64,
    pub cooperative_id: String,
    pub borrower_id: String,
    pub amount: i128,
    pub asset: String,
    pub interest_rate: i128,
    pub term_days: u64,
    pub status: LoanStatus,
    pub approved_by: Address,
    pub collateral_amount: i128,
    pub collateral_asset: String,
    pub disbursed_at: u64,
    pub due_date: u64,
    pub repaid_amount: i128,
    pub remaining_balance: i128,
    pub repayment_schedule: Vec<RepaymentEntry>,
    pub missed_payments: u32,
    pub total_paid: i128,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct RepaymentEntry {
    pub installment_number: u32,
    pub due_date: u64,
    pub amount_due: i128,
    pub amount_paid: i128,
    pub paid_at: u64,
    pub status: String,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct LoanConfig {
    pub cooperative_id: String,
    pub max_loan_amount: i128,
    pub min_loan_amount: i128,
    pub max_interest_rate: i128,
    pub min_interest_rate: i128,
    pub max_term_days: u64,
    pub min_term_days: u64,
    pub default_interest_rate: i128,
    pub default_grace_period_days: u64,
    pub require_collateral: bool,
    pub max_collateral_ratio: i128,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct MemberLoanSummary {
    pub member_id: String,
    pub total_loans: u32,
    pub active_loans: u32,
    pub total_borrowed: i128,
    pub total_repaid: i128,
    pub total_interest_paid: i128,
    pub missed_payments: u32,
    pub defaulted_loans: u32,
    pub credit_score: i128,
}

#[contract]
pub trait CoopFlowLoan {
    fn initialize(env: Env, owner: Address, cooperative_id: String, config: LoanConfig);
    fn request_loan(env: Env, borrower: Address, cooperative_id: String, amount: i128, asset: String, interest_rate: i128, term_days: u64, collateral_amount: i128, collateral_asset: String, reason: String) -> u64;
    fn approve_loan(env: Env, approver: Address, loan_id: u64) -> Result<(), LoanError>;
    fn reject_loan(env: Env, approver: Address, loan_id: u64) -> Result<(), LoanError>;
    fn disburse_loan(env: Env, admin: Address, loan_id: u64) -> Result<(), LoanError>;
    fn record_repayment(env: Env, borrower: Address, loan_id: u64, amount: i128, asset: String) -> Result<(), LoanError>;
    fn get_loan(env: Env, loan_id: u64) -> Result<Loan, LoanError>;
    fn get_member_loans(env: Env, member_id: String) -> Result<Vec<Loan>, LoanError>;
    fn get_member_summary(env: Env, member_id: String) -> Result<MemberLoanSummary, LoanError>;
    fn calculate_interest(env: Env, loan_id: u64) -> Result<i128, LoanError>;
    fn calculate_remaining_balance(env: Env, loan_id: u64) -> Result<i128, LoanError>;
    fn mark_defaulted(env: Env, admin: Address, loan_id: u64) -> Result<(), LoanError>;
    fn seize_collateral(env: Env, admin: Address, loan_id: u64) -> Result<(), LoanError>;
    fn update_config(env: Env, admin: Address, config: LoanConfig) -> Result<(), LoanError>;
    fn pause(env: Env, admin: Address) -> Result<(), LoanError>;
    fn unpause(env: Env, admin: Address) -> Result<(), LoanError>;
    fn get_active_loans(env: Env, cooperative_id: String) -> Result<Vec<Loan>, LoanError>;
    fn get_overdue_loans(env: Env, cooperative_id: String) -> Result<Vec<Loan>, LoanError>;
    fn get_loan_repayment_schedule(env: Env, loan_id: u64) -> Result<Vec<RepaymentEntry>, LoanError>;
    fn generate_loan_receipt(env: Env, loan_id: u64, payment_number: u32) -> Result<String, LoanError>;
}

pub struct CoopFlowLoanContract;

impl CoopFlowLoanContract {
    fn owner(env: &Env) -> Address {
        env.storage().instance().get(&Symbol::new(env, "owner")).unwrap()
    }

    fn check_admin(env: &Env, addr: &Address) -> Result<(), LoanError> {
        let owner = Self::owner(env);
        if owner != *addr {
            return Err(LoanError::NotAuthorized);
        }
        Ok(())
    }

    fn next_loan_id(env: &Env) -> u64 {
        let key = Symbol::new(env, "next_loan_id");
        let mut id: u64 = env.storage().instance().get(&key).unwrap_or(0);
        id += 1;
        env.storage().instance().set(&key, &id);
        id
    }
}

#[contractimpl]
impl CoopFlowLoan for CoopFlowLoanContract {
    fn initialize(env: Env, owner: Address, cooperative_id: String, config: LoanConfig) {
        owner.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "owner"), &owner);
        env.storage().instance().set(&Symbol::new(&env, "coop_id"), &cooperative_id);
        env.storage().instance().set(&Symbol::new(&env, "config"), &config);

        let loans_key = Symbol::new(&env, "loans");
        let loans: StorageMap<u64, Loan> = StorageMap::new(&env);
        env.storage().instance().set(&loans_key, &loans);

        let members_key = Symbol::new(&env, "members");
        let members: StorageMap<String, MemberLoanSummary> = StorageMap::new(&env);
        env.storage().instance().set(&members_key, &members);

        env.events().publish(("initialize",), (owner, cooperative_id));
    }

    fn request_loan(env: Env, borrower: Address, cooperative_id: String, amount: i128, asset: String, interest_rate: i128, term_days: u64, collateral_amount: i128, collateral_asset: String, reason: String) -> u64 {
        borrower.require_auth();

        if amount <= 0 {
            panic!("Invalid amount");
        }

        if interest_rate < 0 {
            panic!("Invalid interest rate");
        }

        let config_key = Symbol::new(&env, "config");
        let config: LoanConfig = env.storage().instance().get(&config_key).unwrap();

        if config.paused {
            panic!("Contract is paused");
        }

        if amount > config.max_loan_amount {
            panic!("Amount exceeds maximum loan limit");
        }

        if interest_rate > config.max_interest_rate {
            panic!("Interest rate exceeds maximum allowed");
        }

        if term_days > config.max_term_days {
            panic!("Term exceeds maximum allowed");
        }

        let loan_id = Self::next_loan_id(&env);
        let now = env.ledger().timestamp();
        let due_date = now + term_days * 86400;

        let loan = Loan {
            id: loan_id,
            cooperative_id,
            borrower_id: borrower.to_string(),
            amount,
            asset,
            interest_rate,
            term_days,
            status: LoanStatus::Pending,
            approved_by: Address::generate(&env),
            collateral_amount,
            collateral_asset,
            disbursed_at: 0,
            due_date,
            repaid_amount: 0,
            remaining_balance: amount,
            repayment_schedule: Vec::new(&env),
            missed_payments: 0,
            total_paid: 0,
            created_at: now,
        };

        let loans_key = Symbol::new(&env, "loans");
        let mut loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));
        loans.set(&loan_id, loan);
        env.storage().instance().set(&loans_key, &loans);

        env.events().publish(("loan_requested",), (loan_id, borrower, amount));
        Ok(loan_id)
    }

    fn approve_loan(env: Env, approver: Address, loan_id: u64) -> Result<(), LoanError> {
        approver.require_auth();

        let loans_key = Symbol::new(&env, "loans");
        let mut loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));

        let mut loan = match loans.get(&loan_id) {
            Some(l) => l,
            None => return Err(LoanError::LoanNotFound),
        };

        if loan.status != LoanStatus::Pending {
            return Err(LoanError::LoanNotFound);
        }

        loan.status = LoanStatus::Approved;
        loan.approved_by = approver.clone();
        loans.set(&loan_id, loan.clone());
        env.storage().instance().set(&loans_key, &loans);

        env.events().publish(("loan_approved",), (loan_id, approver));
        Ok(())
    }

    fn reject_loan(env: Env, approver: Address, loan_id: u64) -> Result<(), LoanError> {
        approver.require_auth();

        let loans_key = Symbol::new(&env, "loans");
        let mut loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));

        let mut loan = match loans.get(&loan_id) {
            Some(l) => l,
            None => return Err(LoanError::LoanNotFound),
        };

        if loan.status != LoanStatus::Pending {
            return Err(LoanError::LoanNotFound);
        }

        loan.status = LoanStatus::Rejected;
        loans.set(&loan_id, loan.clone());
        env.storage().instance().set(&loans_key, &loans);

        env.events().publish(("loan_rejected",), (loan_id, approver));
        Ok(())
    }

    fn disburse_loan(env: Env, admin: Address, loan_id: u64) -> Result<(), LoanError> {
        Self::check_admin(&env, &admin)?;

        let loans_key = Symbol::new(&env, "loans");
        let mut loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));

        let mut loan = match loans.get(&loan_id) {
            Some(l) => l,
            None => return Err(LoanError::LoanNotFound),
        };

        if loan.status != LoanStatus::Approved {
            return Err(LoanError::NotAuthorized);
        }

        loan.status = LoanStatus::Active;
        loan.disbursed_at = env.ledger().timestamp();

        let config_key = Symbol::new(&env, "config");
        let config: LoanConfig = env.storage().instance().get(&config_key).unwrap();

        let num_installments = 12u32;
        let installment_amount = loan.amount / num_installments as i128;
        let installment_days = loan.term_days / num_installments as u64;

        let mut schedule = Vec::new(&env);
        for i in 0..num_installments {
            let due_date = loan.disbursed_at + (i as u64 + 1) * installment_days * 86400;
            let entry = RepaymentEntry {
                installment_number: i + 1,
                due_date,
                amount_due: installment_amount,
                amount_paid: 0,
                paid_at: 0,
                status: "pending".to_string(),
            };
            schedule.push_back(&entry);
        }

        loan.repayment_schedule = schedule;
        loan.remaining_balance = loan.amount;

        loans.set(&loan_id, loan.clone());
        env.storage().instance().set(&loans_key, &loans);

        env.events().publish(("loan_disbursed",), (loan_id, admin, loan.amount));
        Ok(())
    }

    fn record_repayment(env: Env, borrower: Address, loan_id: u64, amount: i128, asset: String) -> Result<(), LoanError> {
        borrower.require_auth();

        if amount <= 0 {
            return Err(LoanError::InvalidRepaymentAmount);
        }

        let loans_key = Symbol::new(&env, "loans");
        let mut loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));

        let mut loan = match loans.get(&loan_id) {
            Some(l) => l,
            None => return Err(LoanError::LoanNotFound),
        };

        if loan.status != LoanStatus::Active {
            return Err(LoanError::LoanNotFound);
        }

        let now = env.ledger().timestamp();
        let mut schedule = loan.repayment_schedule;
        let mut found_installment = false;

        for i in 0..schedule.len() {
            let mut entry = schedule.get(i as u32).unwrap();
            if entry.status == "pending" && entry.amount_due > 0 {
                entry.amount_paid += amount;
                entry.paid_at = now;
                if entry.amount_paid >= entry.amount_due {
                    entry.status = "paid".to_string();
                } else {
                    entry.status = "partial".to_string();
                }
                schedule.set(i as u32, entry.clone());
                found_installment = true;
                loan.repaid_amount += amount;
                loan.remaining_balance -= amount;
                loan.total_paid += amount;
                break;
            }
        }

        if !found_installment {
            return Err(LoanError::LoanAlreadyRepaid);
        }

        loan.repayment_schedule = schedule;

        if loan.remaining_balance <= 0 {
            loan.status = LoanStatus::Repaid;
        }

        loans.set(&loan_id, loan.clone());
        env.storage().instance().set(&loans_key, &loans);

        let members_key = Symbol::new(&env, "members");
        let mut members: StorageMap<String, MemberLoanSummary> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        let mut summary = members.get(&loan.borrower_id).unwrap_or(MemberLoanSummary {
            member_id: loan.borrower_id.clone(),
            total_loans: 0,
            active_loans: 0,
            total_borrowed: 0,
            total_repaid: 0,
            total_interest_paid: 0,
            missed_payments: 0,
            defaulted_loans: 0,
            credit_score: 1000,
        });
        summary.total_repaid += amount;
        summary.total_borrowed += loan.amount;
        members.set(&loan.borrower_id, summary);
        env.storage().instance().set(&members_key, &members);

        env.events().publish(("repayment_recorded",), (loan_id, borrower, amount, asset));
        Ok(())
    }

    fn get_loan(env: Env, loan_id: u64) -> Result<Loan, LoanError> {
        let loans_key = Symbol::new(&env, "loans");
        let loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));
        match loans.get(&loan_id) {
            Some(l) => Ok(l),
            None => Err(LoanError::LoanNotFound),
        }
    }

    fn get_member_loans(env: Env, member_id: String) -> Result<Vec<Loan>, LoanError> {
        let loans_key = Symbol::new(&env, "loans");
        let loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (_, loan) in loans.iter() {
            if loan.borrower_id == member_id {
                result.push_back(&loan);
            }
        }
        Ok(result)
    }

    fn get_member_summary(env: Env, member_id: String) -> Result<MemberLoanSummary, LoanError> {
        let members_key = Symbol::new(&env, "members");
        let members: StorageMap<String, MemberLoanSummary> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        match members.get(&member_id) {
            Some(s) => Ok(s),
            None => Err(LoanError::MemberNotFound),
        }
    }

    fn calculate_interest(env: Env, loan_id: u64) -> Result<i128, LoanError> {
        let loans_key = Symbol::new(&env, "loans");
        let loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));
        let loan = match loans.get(&loan_id) {
            Some(l) => l,
            None => return Err(LoanError::LoanNotFound),
        };

        let interest = loan.amount * loan.interest_rate / 10000;
        Ok(interest)
    }

    fn calculate_remaining_balance(env: Env, loan_id: u64) -> Result<i128, LoanError> {
        let loans_key = Symbol::new(&env, "loans");
        let loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));
        let loan = match loans.get(&loan_id) {
            Some(l) => l,
            None => return Err(LoanError::LoanNotFound),
        };

        Ok(loan.remaining_balance)
    }

    fn mark_defaulted(env: Env, admin: Address, loan_id: u64) -> Result<(), LoanError> {
        Self::check_admin(&env, &admin)?;

        let loans_key = Symbol::new(&env, "loans");
        let mut loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));

        let mut loan = match loans.get(&loan_id) {
            Some(l) => l,
            None => return Err(LoanError::LoanNotFound),
        };

        loan.status = LoanStatus::Defaulted;
        loan.missed_payments += 1;
        loans.set(&loan_id, loan.clone());
        env.storage().instance().set(&loans_key, &loans);

        env.events().publish(("loan_defaulted",), (loan_id, admin));
        Ok(())
    }

    fn seize_collateral(env: Env, admin: Address, loan_id: u64) -> Result<(), LoanError> {
        Self::check_admin(&env, &admin)?;

        let loans_key = Symbol::new(&env, "loans");
        let mut loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));

        let mut loan = match loans.get(&loan_id) {
            Some(l) => l,
            None => return Err(LoanError::LoanNotFound),
        };

        if loan.status != LoanStatus::Defaulted {
            return Err(LoanError::NotAuthorized);
        }

        loan.status = LoanStatus::Seized;
        loans.set(&loan_id, loan.clone());
        env.storage().instance().set(&loans_key, &loans);

        env.events().publish(("collateral_seized",), (loan_id, admin));
        Ok(())
    }

    fn update_config(env: Env, admin: Address, config: LoanConfig) -> Result<(), LoanError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "config"), &config);
        env.events().publish(("config_updated",), (admin,));
        Ok(())
    }

    fn pause(env: Env, admin: Address) -> Result<(), LoanError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "paused"), &true);
        env.events().publish(("paused",), (admin,));
        Ok(())
    }

    fn unpause(env: Env, admin: Address) -> Result<(), LoanError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "paused"), &false);
        env.events().publish(("unpaused",), (admin,));
        Ok(())
    }

    fn get_active_loans(env: Env, cooperative_id: String) -> Result<Vec<Loan>, LoanError> {
        let loans_key = Symbol::new(&env, "loans");
        let loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (_, loan) in loans.iter() {
            if loan.cooperative_id == cooperative_id && loan.status == LoanStatus::Active {
                result.push_back(&loan);
            }
        }
        Ok(result)
    }

    fn get_overdue_loans(env: Env, cooperative_id: String) -> Result<Vec<Loan>, LoanError> {
        let loans_key = Symbol::new(&env, "loans");
        let loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));
        let now = env.ledger().timestamp();
        let mut result = Vec::new(&env);
        for (_, loan) in loans.iter() {
            if loan.cooperative_id == cooperative_id && loan.status == LoanStatus::Active && loan.due_date < now {
                result.push_back(&loan);
            }
        }
        Ok(result)
    }

    fn get_loan_repayment_schedule(env: Env, loan_id: u64) -> Result<Vec<RepaymentEntry>, LoanError> {
        let loans_key = Symbol::new(&env, "loans");
        let loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));
        let loan = match loans.get(&loan_id) {
            Some(l) => l,
            None => return Err(LoanError::LoanNotFound),
        };

        Ok(loan.repayment_schedule)
    }

    fn generate_loan_receipt(env: Env, loan_id: u64, payment_number: u32) -> Result<String, LoanError> {
        let loans_key = Symbol::new(&env, "loans");
        let loans: StorageMap<u64, Loan> = env.storage().instance().get(&loans_key).unwrap_or(StorageMap::new(&env));
        let loan = match loans.get(&loan_id) {
            Some(l) => l,
            None => return Err(LoanError::LoanNotFound),
        };

        let receipt = format!(
            "Loan Receipt #{}: Borrower {} repaid {} {} for loan {} installment {}",
            loan_id, loan.borrower_id, loan.repaid_amount, loan.asset, loan_id, payment_number
        );
        Ok(receipt)
    }
}
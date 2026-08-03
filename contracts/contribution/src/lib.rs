use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec, Map,
    IntoVal, TryFromVal,
};
use soroban_sdk::storage::{Map as StorageMap, Vec as StorageVec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ContributionError {
    NotAuthorized,
    InvalidAmount,
    InvalidCycle,
    MemberNotFound,
    CycleNotFound,
    AlreadyPaid,
    PaymentFailed,
    ContractPaused,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ContributionCycleType {
    Weekly,
    Biweekly,
    Monthly,
    Quarterly,
    Yearly,
    Custom,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct ContributionRecord {
    pub member_id: String,
    pub amount: i128,
    pub asset: String,
    pub cycle_id: u64,
    pub paid_at: u64,
    pub tx_hash: String,
    pub status: String,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct ContributionCycle {
    pub id: u64,
    pub cooperative_id: String,
    pub cycle_type: ContributionCycleType,
    pub amount: i128,
    pub asset: String,
    pub start_date: u64,
    pub end_date: u64,
    pub members: Vec<String>,
    pub completed: bool,
    pub total_collected: i128,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct PenaltyConfig {
    pub late_fee_percent: i128,
    pub grace_period_days: u64,
    pub max_penalty: i128,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct MemberContributionSummary {
    pub member_id: String,
    pub total_contributed: i128,
    pub cycles_completed: u32,
    pub late_payments: u32,
    pub missed_payments: u32,
    pub last_contribution_date: u64,
    pub streak_days: u32,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct CooperativeConfig {
    pub cooperative_id: String,
    pub default_cycle_type: ContributionCycleType,
    pub default_amount: i128,
    pub default_asset: String,
    pub penalty_config: PenaltyConfig,
    pub reminder_enabled: bool,
    pub receipt_enabled: bool,
}

#[contract]
pub trait CoopFlowContribution {
    fn initialize(env: Env, owner: Address, cooperative_id: String, config: CooperativeConfig);
    fn create_cycle(env: Env, admin: Address, cooperative_id: String, cycle_type: ContributionCycleType, amount: i128, asset: String, start_date: u64, end_date: u64) -> u64;
    fn record_payment(env: Env, member_id: String, cycle_id: u64, amount: i128, asset: String) -> Result<(), ContributionError>;
    fn get_cycle(env: Env, cycle_id: u64) -> Result<ContributionCycle, ContributionError>;
    fn get_member_summary(env: Env, member_id: String) -> Result<MemberContributionSummary, ContributionError>;
    fn get_cycle_payments(env: Env, cycle_id: u64) -> Result<Vec<ContributionRecord>, ContributionError>;
    fn calculate_penalty(env: Env, cycle_id: u64, member_id: String) -> Result<i128, ContributionError>;
    fn update_penalty_config(env: Env, admin: Address, config: PenaltyConfig) -> Result<(), ContributionError>;
    fn pause(env: Env, admin: Address) -> Result<(), ContributionError>;
    fn unpause(env: Env, admin: Address) -> Result<(), ContributionError>;
    fn add_member_to_cycle(env: Env, admin: Address, cycle_id: u64, member_id: String) -> Result<(), ContributionError>;
    fn remove_member_from_cycle(env: Env, admin: Address, cycle_id: u64, member_id: String) -> Result<(), ContributionError>;
    fn get_active_cycles(env: Env, cooperative_id: String) -> Result<Vec<ContributionCycle>, ContributionError>;
    fn complete_cycle(env: Env, admin: Address, cycle_id: u64) -> Result<(), ContributionError>;
    fn get_total_collected(env: Env, cycle_id: u64) -> Result<i128, ContributionError>;
    fn generate_receipt(env: Env, payment_id: u64) -> Result<String, ContributionError>;
    fn send_reminder(env: Env, cycle_id: u64, member_id: String) -> Result<(), ContributionError>;
}

pub struct CoopFlowContributionContract;

impl CoopFlowContributionContract {
    fn owner(env: &Env) -> Address {
        env.storage().instance().get(&Symbol::new(env, "owner")).unwrap()
    }

    fn check_admin(env: &Env, addr: &Address) -> Result<(), ContributionError> {
        let owner = Self::owner(env);
        if owner != *addr {
            return Err(ContributionError::NotAuthorized);
        }
        Ok(())
    }

    fn next_cycle_id(env: &Env) -> u64 {
        let key = Symbol::new(env, "next_cycle_id");
        let mut id: u64 = env.storage().instance().get(&key).unwrap_or(0);
        id += 1;
        env.storage().instance().set(&key, &id);
        id
    }

    fn next_payment_id(env: &Env) -> u64 {
        let key = Symbol::new(env, "next_payment_id");
        let mut id: u64 = env.storage().instance().get(&key).unwrap_or(0);
        id += 1;
        env.storage().instance().set(&key, &id);
        id
    }
}

#[contractimpl]
impl CoopFlowContribution for CoopFlowContributionContract {
    fn initialize(env: Env, owner: Address, cooperative_id: String, config: CooperativeConfig) {
        owner.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "owner"), &owner);
        env.storage().instance().set(&Symbol::new(&env, "coop_id"), &cooperative_id);
        env.storage().instance().set(&Symbol::new(&env, "config"), &config);

        let cycles_key = Symbol::new(&env, "cycles");
        let cycles: StorageMap<u64, ContributionCycle> = StorageMap::new(&env);
        env.storage().instance().set(&cycles_key, &cycles);

        let members_key = Symbol::new(&env, "members");
        let members: StorageMap<String, MemberContributionSummary> = StorageMap::new(&env);
        env.storage().instance().set(&members_key, &members);

        env.events().publish(("initialize",), (owner, cooperative_id));
    }

    fn create_cycle(env: Env, admin: Address, cooperative_id: String, cycle_type: ContributionCycleType, amount: i128, asset: String, start_date: u64, end_date: u64) -> u64 {
        Self::check_admin(&env, &admin)?;
        if amount <= 0 {
            panic!("Invalid amount");
        }

        let cycle_id = Self::next_cycle_id(&env);
        let cycle = ContributionCycle {
            id: cycle_id,
            cooperative_id,
            cycle_type,
            amount,
            asset,
            start_date,
            end_date,
            members: Vec::new(&env),
            completed: false,
            total_collected: 0,
        };

        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, ContributionCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));
        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        env.events().publish(("cycle_created",), (cycle_id, admin));
        Ok(cycle_id)
    }

    fn record_payment(env: Env, member_id: String, cycle_id: u64, amount: i128, asset: String) -> Result<(), ContributionError> {
        if amount <= 0 {
            return Err(ContributionError::InvalidAmount);
        }

        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, ContributionCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));

        let mut cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(ContributionError::CycleNotFound),
        };

        if cycle.completed {
            return Err(ContributionError::PaymentFailed);
        }

        let payment_id = Self::next_payment_id(&env);
        let record = ContributionRecord {
            member_id: member_id.clone(),
            amount,
            asset: asset.clone(),
            cycle_id,
            paid_at: env.ledger().timestamp(),
            tx_hash: env.tx().hash().to_string(),
            status: "completed".to_string(),
        };

        let payments_key = Symbol::new(&env, "payments");
        let mut payments: StorageVec<ContributionRecord> = env.storage().instance().get(&payments_key).unwrap_or(StorageVec::new(&env));
        payments.push_back(&record);
        env.storage().instance().set(&payments_key, &payments);

        cycle.total_collected += amount;
        let mut members = cycle.members;
        let mut member_found = false;
        for m in members.iter() {
            if m == member_id {
                member_found = true;
                break;
            }
        }
        if !member_found {
            members.push_back(&member_id);
        }
        cycle.members = members;
        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        let members_key = Symbol::new(&env, "members");
        let mut members_summary: StorageMap<String, MemberContributionSummary> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        let mut summary = members_summary.get(&member_id).unwrap_or(MemberContributionSummary {
            member_id: member_id.clone(),
            total_contributed: 0,
            cycles_completed: 0,
            late_payments: 0,
            missed_payments: 0,
            last_contribution_date: 0,
            streak_days: 0,
        });
        summary.total_contributed += amount;
        summary.last_contribution_date = env.ledger().timestamp();
        members_summary.set(&member_id, summary);
        env.storage().instance().set(&members_key, &members_summary);

        env.events().publish(("payment_recorded",), (member_id, cycle_id, amount, asset));
        Ok(())
    }

    fn get_cycle(env: Env, cycle_id: u64) -> Result<ContributionCycle, ContributionError> {
        let cycles_key = Symbol::new(&env, "cycles");
        let cycles: StorageMap<u64, ContributionCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));
        match cycles.get(&cycle_id) {
            Some(c) => Ok(c),
            None => Err(ContributionError::CycleNotFound),
        }
    }

    fn get_member_summary(env: Env, member_id: String) -> Result<MemberContributionSummary, ContributionError> {
        let members_key = Symbol::new(&env, "members");
        let members: StorageMap<String, MemberContributionSummary> = env.storage().instance().get(&members_key).unwrap_or(StorageMap::new(&env));
        match members.get(&member_id) {
            Some(s) => Ok(s),
            None => Err(ContributionError::MemberNotFound),
        }
    }

    fn get_cycle_payments(env: Env, cycle_id: u64) -> Result<Vec<ContributionRecord>, ContributionError> {
        let payments_key = Symbol::new(&env, "payments");
        let payments: StorageVec<ContributionRecord> = env.storage().instance().get(&payments_key).unwrap_or(StorageVec::new(&env));
        let mut result = Vec::new(&env);
        for payment in payments.iter() {
            if payment.cycle_id == cycle_id {
                result.push_back(&payment);
            }
        }
        Ok(result)
    }

    fn calculate_penalty(env: Env, cycle_id: u64, member_id: String) -> Result<i128, ContributionError> {
        let config_key = Symbol::new(&env, "config");
        let config: CooperativeConfig = env.storage().instance().get(&config_key).unwrap();

        let penalty_config = config.penalty_config;
        let grace_period = penalty_config.grace_period_days * 86400;
        let now = env.ledger().timestamp();

        let payments_key = Symbol::new(&env, "payments");
        let payments: StorageVec<ContributionRecord> = env.storage().instance().get(&payments_key).unwrap_or(StorageVec::new(&env));

        let mut last_payment_date: u64 = 0;
        for payment in payments.iter() {
            if payment.member_id == member_id && payment.cycle_id == cycle_id {
                if payment.paid_at > last_payment_date {
                    last_payment_date = payment.paid_at;
                }
            }
        }

        if last_payment_date == 0 {
            return Ok(0);
        }

        let elapsed = now - last_payment_date;
        if elapsed <= grace_period {
            return Ok(0);
        }

        let penalty = penalty_config.late_fee_percent * config.default_amount / 10000;
        let max_penalty = penalty_config.max_penalty;
        if penalty > max_penalty && max_penalty > 0 {
            Ok(max_penalty)
        } else {
            Ok(penalty)
        }
    }

    fn update_penalty_config(env: Env, admin: Address, config: PenaltyConfig) -> Result<(), ContributionError> {
        Self::check_admin(&env, &admin)?;
        let config_key = Symbol::new(&env, "config");
        let mut coop_config: CooperativeConfig = env.storage().instance().get(&config_key).unwrap();
        coop_config.penalty_config = config;
        env.storage().instance().set(&config_key, &coop_config);
        env.events().publish(("penalty_config_updated",), (admin,));
        Ok(())
    }

    fn pause(env: Env, admin: Address) -> Result<(), ContributionError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "paused"), &true);
        env.events().publish(("paused",), (admin,));
        Ok(())
    }

    fn unpause(env: Env, admin: Address) -> Result<(), ContributionError> {
        Self::check_admin(&env, &admin)?;
        env.storage().instance().set(&Symbol::new(&env, "paused"), &false);
        env.events().publish(("unpaused",), (admin,));
        Ok(())
    }

    fn add_member_to_cycle(env: Env, admin: Address, cycle_id: u64, member_id: String) -> Result<(), ContributionError> {
        Self::check_admin(&env, &admin)?;
        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, ContributionCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));

        let mut cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(ContributionError::CycleNotFound),
        };

        let mut members = cycle.members;
        members.push_back(&member_id);
        cycle.members = members;
        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        env.events().publish(("member_added_to_cycle",), (cycle_id, member_id));
        Ok(())
    }

    fn remove_member_from_cycle(env: Env, admin: Address, cycle_id: u64, member_id: String) -> Result<(), ContributionError> {
        Self::check_admin(&env, &admin)?;
        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, ContributionCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));

        let mut cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(ContributionError::CycleNotFound),
        };

        let mut new_members = Vec::new(&env);
        for m in cycle.members.iter() {
            if m != member_id {
                new_members.push_back(&m);
            }
        }
        cycle.members = new_members;
        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        env.events().publish(("member_removed_from_cycle",), (cycle_id, member_id));
        Ok(())
    }

    fn get_active_cycles(env: Env, cooperative_id: String) -> Result<Vec<ContributionCycle>, ContributionError> {
        let cycles_key = Symbol::new(&env, "cycles");
        let cycles: StorageMap<u64, ContributionCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));
        let mut result = Vec::new(&env);
        for (_, cycle) in cycles.iter() {
            if cycle.cooperative_id == cooperative_id && !cycle.completed {
                result.push_back(&cycle);
            }
        }
        Ok(result)
    }

    fn complete_cycle(env: Env, admin: Address, cycle_id: u64) -> Result<(), ContributionError> {
        Self::check_admin(&env, &admin)?;
        let cycles_key = Symbol::new(&env, "cycles");
        let mut cycles: StorageMap<u64, ContributionCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));

        let mut cycle = match cycles.get(&cycle_id) {
            Some(c) => c,
            None => return Err(ContributionError::CycleNotFound),
        };

        cycle.completed = true;
        cycles.set(&cycle_id, cycle);
        env.storage().instance().set(&cycles_key, &cycles);

        env.events().publish(("cycle_completed",), (cycle_id, admin));
        Ok(())
    }

    fn get_total_collected(env: Env, cycle_id: u64) -> Result<i128, ContributionError> {
        let cycles_key = Symbol::new(&env, "cycles");
        let cycles: StorageMap<u64, ContributionCycle> = env.storage().instance().get(&cycles_key).unwrap_or(StorageMap::new(&env));
        match cycles.get(&cycle_id) {
            Some(c) => Ok(c.total_collected),
            None => Err(ContributionError::CycleNotFound),
        }
    }

    fn generate_receipt(env: Env, payment_id: u64) -> Result<String, ContributionError> {
        let payments_key = Symbol::new(&env, "payments");
        let payments: StorageVec<ContributionRecord> = env.storage().instance().get(&payments_key).unwrap_or(StorageVec::new(&env));

        let payment = match payments.get(payment_id as u32 - 1) {
            Some(p) => p,
            None => return Err(ContributionError::PaymentFailed),
        };

        let receipt = format!(
            "Receipt #{}: Member {} paid {} {} for cycle {} on {}",
            payment_id, payment.member_id, payment.amount, payment.asset, payment.cycle_id, payment.paid_at
        );
        Ok(receipt)
    }

    fn send_reminder(env: Env, cycle_id: u64, member_id: String) -> Result<(), ContributionError> {
        let cycle = Self::get_cycle(env.clone(), cycle_id)?;
        env.events().publish(("reminder_sent",), (cycle_id, member_id, cycle.amount, cycle.asset));
        Ok(())
    }
}
